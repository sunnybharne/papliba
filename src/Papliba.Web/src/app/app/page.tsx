"use client";

import {
  type CSSProperties,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createDurableWorkspace,
  loadWorkspace,
  openPythonScriptInVsCode,
  saveWorkspace,
  trashPythonScriptFile,
} from "@/lib/papliba-api";

import { CreateProjectDialog } from "./_components/CreateProjectDialog";
import { CreateWorkflowDialog } from "./_components/CreateWorkflowDialog";
import { DeleteDialog } from "./_components/DeleteDialog";
import { GlobalSearchDialog } from "./_components/GlobalSearchDialog";
import { Sidebar } from "./_components/Sidebar";
import { WorkspacePanel } from "./_components/WorkspacePanel";
import {
  defaultWorkflowTriggerPosition,
  projectNameErrorMessage,
  projectNamePattern,
  themeStorageKey,
  workflowNameErrorMessage,
  workflowNamePattern,
} from "./constants";
import type {
  ActiveItemLevel,
  Project,
  ThemeMode,
  Workflow,
  WorkflowNodeStepType,
  WorkspaceSaveStatus,
  WorkspaceSnapshot,
} from "./types";

const collapsedSidebarWidth = 48;
const defaultSidebarWidth = 260;
const maximumSidebarWidth = 380;
const minimumSidebarWidth = 220;
const maximumWorkflowUndoSteps = 25;
const workflowRunDelayMs = 650;
const starterProjectName = "main";

function createStarterProjects(): Project[] {
  return [
    {
      name: starterProjectName,
      workflows: [],
    },
  ];
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function applyThemeMode(themeMode: ThemeMode) {
  if (themeMode === "system") {
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.removeItem(themeStorageKey);
    return;
  }

  document.documentElement.dataset.theme = themeMode;
  window.localStorage.setItem(themeStorageKey, themeMode);
}

function copyWorkflow(workflow: Workflow): Workflow {
  return {
    ...workflow,
    connections: workflow.connections.map((connection) => ({ ...connection })),
    nodes: workflow.nodes.map((node) => ({ ...node })),
    trigger: workflow.trigger ? { ...workflow.trigger } : workflow.trigger,
  };
}

function isEditableElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.closest("input, textarea, select, [contenteditable='true']") !== null;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function getDefaultStepType(nodeCount: number): WorkflowNodeStepType {
  return nodeCount === 0 ? "python" : "ai";
}

function getDefaultStepName(stepType: WorkflowNodeStepType) {
  return stepType === "python" ? "Python script" : "AI step";
}

function getDemoOutput(stepType: WorkflowNodeStepType, input: string) {
  if (stepType === "python") {
    return "Found 5 unread emails from today.";
  }

  return `Summary: ${input} 2 items look urgent.`;
}

export default function Home() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const savedTheme = window.localStorage.getItem(themeStorageKey);

    return isThemeMode(savedTheme) ? savedTheme : "system";
  });
  const [projects, setProjects] = useState<Project[]>(createStarterProjects);
  const [activeProjectName, setActiveProjectName] =
    useState(starterProjectName);
  const [activeWorkflowName, setActiveWorkflowName] = useState("");
  const [activeItemLevel, setActiveItemLevel] =
    useState<ActiveItemLevel>("project");
  const [draftProjectName, setDraftProjectName] = useState("");
  const [draftWorkflowName, setDraftWorkflowName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isWorkflowDialogOpen, setIsWorkflowDialogOpen] = useState(false);
  const [deleteProjectName, setDeleteProjectName] = useState("");
  const [deleteProjectConfirmationText, setDeleteProjectConfirmationText] =
    useState("");
  const [deleteWorkflowName, setDeleteWorkflowName] = useState("");
  const [deleteWorkflowConfirmationText, setDeleteWorkflowConfirmationText] =
    useState("");
  const [projectNameError, setProjectNameError] = useState("");
  const [workflowNameError, setWorkflowNameError] = useState("");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [workflowUndoStack, setWorkflowUndoStack] = useState<Workflow[]>([]);
  const [isWorkspaceHydrated, setIsWorkspaceHydrated] = useState(false);
  const [workspaceSaveStatus, setWorkspaceSaveStatus] =
    useState<WorkspaceSaveStatus>("loading");
  const workspaceRevisionRef = useRef(0);
  const lastSavedWorkspaceRef = useRef("");
  const pendingWorkspaceSaveRef = useRef<{
    serialized: string;
    snapshot: WorkspaceSnapshot;
  } | null>(null);
  const isWorkspaceSaveInFlightRef = useRef(false);
  const isAppMountedRef = useRef(true);

  const activeProjectNameForSelection = projects.some((project) => {
    return project.name === activeProjectName;
  })
    ? activeProjectName
    : (projects[0]?.name ?? "");
  const activeProject = projects.find((project) => {
    return project.name === activeProjectNameForSelection;
  });
  const activeWorkflow = activeProject?.workflows.find((workflow) => {
    return workflow.name === activeWorkflowName;
  });
  const activeWorkspaceItem =
    activeItemLevel === "workflow" && activeWorkflow
      ? activeWorkflow
      : activeProject;
  const activeWorkspaceType =
    activeItemLevel === "workflow" && activeWorkflow ? "workflow" : "project";
  const appShellClassName = [
    "app-shell",
    !isSidebarOpen && "sidebar-collapsed",
    isResizingSidebar && "sidebar-resizing",
  ]
    .filter(Boolean)
    .join(" ");
  const appShellStyle = {
    "--sidebar-width": `${isSidebarOpen ? sidebarWidth : collapsedSidebarWidth}px`,
  } as CSSProperties;
  const hasProject = activeProject !== undefined;
  const canDeleteProject =
    deleteProjectName.length > 0 &&
    deleteProjectConfirmationText === deleteProjectName;
  const canDeleteWorkflow =
    deleteWorkflowName.length > 0 &&
    deleteWorkflowConfirmationText === deleteWorkflowName;
  const canUndoWorkflowEdit =
    activeWorkspaceType === "workflow" && workflowUndoStack.length > 0;
  const durableWorkspace = createDurableWorkspace({
    activeItemLevel,
    activeProjectName: activeProjectNameForSelection,
    activeWorkflowName,
    projects,
  });

  function changeThemeMode(nextThemeMode: ThemeMode) {
    setThemeMode(nextThemeMode);
    applyThemeMode(nextThemeMode);
  }

  function toggleSidebar() {
    setIsSidebarOpen((currentIsSidebarOpen) => !currentIsSidebarOpen);
  }

  function openSidebar() {
    setIsSidebarOpen(true);
  }

  function resizeSidebar(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = sidebarWidth;

    function moveSidebar(pointerEvent: PointerEvent) {
      const nextWidth = startWidth + pointerEvent.clientX - startX;

      setSidebarWidth(
        Math.min(maximumSidebarWidth, Math.max(minimumSidebarWidth, nextWidth)),
      );
    }

    function stopResizingSidebar() {
      setIsResizingSidebar(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", moveSidebar);
      window.removeEventListener("pointerup", stopResizingSidebar);
    }

    setIsResizingSidebar(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", moveSidebar);
    window.addEventListener("pointerup", stopResizingSidebar);
  }

  function openGlobalSearch() {
    setGlobalSearchQuery("");
    setIsGlobalSearchOpen(true);
  }

  function closeGlobalSearch() {
    setIsGlobalSearchOpen(false);
    setGlobalSearchQuery("");
  }

  function openProjectDialog() {
    setDraftProjectName("");
    setProjectNameError("");
    setDeleteProjectName("");
    setDeleteProjectConfirmationText("");
    setIsWorkflowDialogOpen(false);
    setIsProjectDialogOpen(true);
  }

  function closeProjectDialog() {
    setIsProjectDialogOpen(false);
  }

  function openWorkflowDialog() {
    if (!activeProject) {
      return;
    }

    setDraftWorkflowName("");
    setWorkflowNameError("");
    setIsProjectDialogOpen(false);
    setIsWorkflowDialogOpen(true);
  }

  function closeWorkflowDialog() {
    setIsWorkflowDialogOpen(false);
  }

  function updateDraftProjectName(projectName: string) {
    setDraftProjectName(projectName.toLowerCase());
    setProjectNameError("");
  }

  function updateDraftWorkflowName(workflowName: string) {
    setDraftWorkflowName(workflowName.toLowerCase());
    setWorkflowNameError("");
  }

  function selectProject(projectName: string) {
    setActiveProjectName(projectName);
    setActiveWorkflowName("");
    setActiveItemLevel("project");
    setDraftWorkflowName("");
    setWorkflowNameError("");
    setIsWorkflowRunning(false);
    setWorkflowUndoStack([]);
  }

  function selectWorkflow(workflowName: string) {
    setActiveWorkflowName(workflowName);
    setActiveItemLevel("workflow");
    setIsWorkflowRunning(false);
    setWorkflowUndoStack([]);
  }

  function backToProject() {
    setActiveWorkflowName("");
    setActiveItemLevel("project");
    setIsWorkflowRunning(false);
    setWorkflowUndoStack([]);
  }

  function renameProject(projectName: string, nextName: string) {
    if (projectName === nextName) {
      return "";
    }

    if (!projectNamePattern.test(nextName)) {
      return projectNameErrorMessage;
    }

    if (
      projects.some((project) => {
        return project.name === nextName;
      })
    ) {
      return "A project with this name already exists.";
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.name !== projectName) {
          return project;
        }

        return { ...project, name: nextName };
      }),
    );

    if (activeProjectNameForSelection === projectName) {
      setActiveProjectName(nextName);
    }

    return "";
  }

  function openDeleteProjectDialog(projectName: string) {
    setDeleteProjectName(projectName);
    setDeleteProjectConfirmationText("");
    setIsWorkflowDialogOpen(false);
  }

  function closeDeleteProjectDialog() {
    setDeleteProjectName("");
    setDeleteProjectConfirmationText("");
  }

  function openDeleteWorkflowDialog(workflowName: string) {
    setDeleteWorkflowName(workflowName);
    setDeleteWorkflowConfirmationText("");
    setIsProjectDialogOpen(false);
    setIsWorkflowDialogOpen(false);
  }

  function closeDeleteWorkflowDialog() {
    setDeleteWorkflowName("");
    setDeleteWorkflowConfirmationText("");
  }

  function createProjectFromInput() {
    const nextProjectName = draftProjectName.trim();

    if (!projectNamePattern.test(nextProjectName)) {
      setProjectNameError(projectNameErrorMessage);
      return;
    }

    if (
      projects.some((project) => {
        return project.name === nextProjectName;
      })
    ) {
      setProjectNameError("A project with this name already exists.");
      return;
    }

    setProjects((currentProjects) => [
      ...currentProjects,
      {
        name: nextProjectName,
        workflows: [],
      },
    ]);
    setDraftProjectName("");
    setProjectNameError("");
    setActiveProjectName(nextProjectName);
    setActiveWorkflowName("");
    setActiveItemLevel("project");
    setIsWorkflowRunning(false);
    setWorkflowUndoStack([]);
    setIsProjectDialogOpen(false);
  }

  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createProjectFromInput();
  }

  function createWorkflowFromInput() {
    const nextWorkflowName = draftWorkflowName.trim();

    if (!workflowNamePattern.test(nextWorkflowName)) {
      setWorkflowNameError(workflowNameErrorMessage);
      return;
    }

    if (!activeProject) {
      return;
    }

    if (
      activeProject.workflows.some((workflow) => {
        return workflow.name === nextWorkflowName;
      })
    ) {
      setWorkflowNameError("A workflow with this name already exists.");
      return;
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.name !== activeProject.name) {
          return project;
        }

        return {
          ...project,
          workflows: [
            ...project.workflows,
            {
              connections: [],
              name: nextWorkflowName,
              nodes: [],
              trigger: { ...defaultWorkflowTriggerPosition },
            },
          ],
        };
      }),
    );
    setDraftWorkflowName("");
    setWorkflowNameError("");
    setActiveWorkflowName(nextWorkflowName);
    setActiveItemLevel("workflow");
    setIsWorkflowRunning(false);
    setWorkflowUndoStack([]);
    setIsWorkflowDialogOpen(false);
  }

  function createWorkflow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createWorkflowFromInput();
  }

  function renameWorkflow(workflowName: string, nextName: string) {
    if (workflowName === nextName) {
      return "";
    }

    if (!workflowNamePattern.test(nextName)) {
      return workflowNameErrorMessage;
    }

    if (!activeProject) {
      return "The project is no longer available.";
    }

    if (
      activeProject.workflows.some((workflow) => {
        return workflow.name === nextName;
      })
    ) {
      return "A workflow with this name already exists.";
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.name !== activeProject.name) {
          return project;
        }

        return {
          ...project,
          workflows: project.workflows.map((workflow) => {
            if (workflow.name !== workflowName) {
              return workflow;
            }

            return { ...workflow, name: nextName };
          }),
        };
      }),
    );

    if (activeWorkflowName === workflowName) {
      setActiveWorkflowName(nextName);
    }

    return "";
  }

  function updateActiveWorkflow(
    updateWorkflow: (workflow: Workflow) => Workflow,
  ) {
    if (!activeProject || !activeWorkflow) {
      return;
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.name !== activeProject.name) {
          return project;
        }

        return {
          ...project,
          workflows: project.workflows.map((workflow) => {
            if (workflow.name !== activeWorkflow.name) {
              return workflow;
            }

            return updateWorkflow(workflow);
          }),
        };
      }),
    );
  }

  function saveWorkflowUndoStep() {
    if (!activeWorkflow) {
      return;
    }

    setWorkflowUndoStack((currentUndoStack) => [
      ...currentUndoStack.slice(-(maximumWorkflowUndoSteps - 1)),
      copyWorkflow(activeWorkflow),
    ]);
  }

  function undoWorkflowEdit() {
    const previousWorkflow = workflowUndoStack.at(-1);

    if (!activeProject || !activeWorkflow || !previousWorkflow) {
      return;
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.name !== activeProject.name) {
          return project;
        }

        return {
          ...project,
          workflows: project.workflows.map((workflow) => {
            if (workflow.name !== activeWorkflow.name) {
              return workflow;
            }

            return copyWorkflow(previousWorkflow);
          }),
        };
      }),
    );
    setWorkflowUndoStack((currentUndoStack) => currentUndoStack.slice(0, -1));
  }

  function addWorkflowNode(
    position?: { x: number; y: number },
    requestedStepType?: WorkflowNodeStepType,
  ) {
    if (!activeWorkflow) {
      return;
    }

    saveWorkflowUndoStep();

    const nodeCount = activeWorkflow.nodes.length;
    const stepType = requestedStepType ?? getDefaultStepType(nodeCount);
    const nextNode = {
      id: `${stepType}-${Date.now()}-${nodeCount + 1}`,
      kind: "rectangle" as const,
      name: getDefaultStepName(stepType),
      status: "idle" as const,
      stepType,
      x: Math.max(24, position?.x ?? 230 + nodeCount * 190),
      y: Math.max(24, position?.y ?? 120),
    };

    updateActiveWorkflow((workflow) => ({
      ...workflow,
      nodes: [...workflow.nodes, nextNode],
    }));
  }

  async function openWorkflowPythonScript(nodeId: string) {
    if (!activeProject || !activeWorkflow) {
      throw new Error("The workflow is no longer available.");
    }

    await openPythonScriptInVsCode(
      activeProject.name,
      activeWorkflow.name,
      nodeId,
    );
  }

  function startWorkflowNodeMove() {
    saveWorkflowUndoStep();
  }

  function moveWorkflowNode(nodeId: string, x: number, y: number) {
    updateActiveWorkflow((workflow) => ({
      ...workflow,
      nodes: workflow.nodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        return { ...node, x, y };
      }),
    }));
  }

  function moveWorkflowTrigger(x: number, y: number) {
    updateActiveWorkflow((workflow) => ({
      ...workflow,
      trigger: { x, y },
    }));
  }

  function addWorkflowTrigger() {
    if (!activeWorkflow || activeWorkflow.trigger !== null) {
      return;
    }

    saveWorkflowUndoStep();
    updateActiveWorkflow((workflow) => ({
      ...workflow,
      trigger: { ...defaultWorkflowTriggerPosition },
    }));
  }

  function deleteWorkflowTrigger() {
    if (!activeWorkflow || activeWorkflow.trigger === null) {
      return;
    }

    saveWorkflowUndoStep();
    updateActiveWorkflow((workflow) => ({
      ...workflow,
      trigger: null,
    }));
  }

  function updateWorkflowNode(
    nodeId: string,
    updateNode: {
      name?: string;
      stepType?: WorkflowNodeStepType;
    },
  ) {
    saveWorkflowUndoStep();

    updateActiveWorkflow((workflow) => ({
      ...workflow,
      nodes: workflow.nodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        return {
          ...node,
          ...updateNode,
          input: undefined,
          output: undefined,
          status: "idle",
        };
      }),
    }));
  }

  async function deleteWorkflowNode(nodeId: string) {
    if (!activeProject || !activeWorkflow) {
      return;
    }

    const node = activeWorkflow.nodes.find((node) => {
      return node.id === nodeId;
    });

    if (!node) {
      return;
    }

    if (node.stepType === "python") {
      try {
        await trashPythonScriptFile(
          activeProject.name,
          activeWorkflow.name,
          node.id,
        );
      } catch {
        setWorkspaceSaveStatus("error");
        return;
      }
    }

    saveWorkflowUndoStep();

    updateActiveWorkflow((workflow) => ({
      ...workflow,
      connections: workflow.connections.filter((connection) => {
        return (
          connection.fromNodeId !== nodeId && connection.toNodeId !== nodeId
        );
      }),
      nodes: workflow.nodes.filter((node) => {
        return node.id !== nodeId;
      }),
    }));
  }

  async function runWorkflowDemo() {
    if (!activeWorkflow || activeWorkflow.nodes.length === 0 || isWorkflowRunning) {
      return;
    }

    setIsWorkflowRunning(true);
    setWorkflowUndoStack([]);

    const orderedNodes = [...activeWorkflow.nodes].sort((firstNode, secondNode) => {
      return firstNode.x - secondNode.x;
    });
    let previousOutput = "Manual trigger started the workflow.";

    updateActiveWorkflow((workflow) => ({
      ...workflow,
      nodes: workflow.nodes.map((node) => ({
        ...node,
        input: undefined,
        output: undefined,
        status: "idle",
      })),
    }));

    for (const node of orderedNodes) {
      updateActiveWorkflow((workflow) => ({
        ...workflow,
        nodes: workflow.nodes.map((currentNode) => {
          if (currentNode.id !== node.id) {
            return currentNode;
          }

          return {
            ...currentNode,
            input: previousOutput,
            output: undefined,
            status: "running",
          };
        }),
      }));

      await wait(workflowRunDelayMs);

      const nextOutput = getDemoOutput(node.stepType, previousOutput);

      updateActiveWorkflow((workflow) => ({
        ...workflow,
        nodes: workflow.nodes.map((currentNode) => {
          if (currentNode.id !== node.id) {
            return currentNode;
          }

          return {
            ...currentNode,
            output: nextOutput,
            status: "done",
          };
        }),
      }));

      previousOutput = nextOutput;
    }

    setIsWorkflowRunning(false);
  }

  function connectWorkflowNodes(fromNodeId: string, toNodeId: string) {
    if (!activeWorkflow || fromNodeId === toNodeId) {
      return;
    }

    const alreadyConnected = activeWorkflow.connections.some((connection) => {
      return (
        connection.fromNodeId === fromNodeId &&
        connection.toNodeId === toNodeId
      );
    });

    if (alreadyConnected) {
      return;
    }

    saveWorkflowUndoStep();

    updateActiveWorkflow((workflow) => {
      return {
        ...workflow,
        connections: [...workflow.connections, { fromNodeId, toNodeId }],
      };
    });
  }

  function deleteProject(projectName: string) {
    const remainingProjects = projects.filter((project) => {
      return project.name !== projectName;
    });

    setProjects(remainingProjects);
    setDeleteProjectName("");
    setDeleteProjectConfirmationText("");
    setIsWorkflowDialogOpen(false);

    if (projectName === activeProjectNameForSelection) {
      setActiveProjectName(remainingProjects[0]?.name ?? "");
      setActiveWorkflowName("");
      setActiveItemLevel("project");
      setWorkflowUndoStack([]);
    }
  }

  function confirmDeleteProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canDeleteProject) {
      return;
    }

    deleteProject(deleteProjectName);
  }

  function deleteWorkflow(workflowName: string) {
    if (!activeProject) {
      return;
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.name !== activeProject.name) {
          return project;
        }

        return {
          ...project,
          workflows: project.workflows.filter((workflow) => {
            return workflow.name !== workflowName;
          }),
        };
      }),
    );
    setDeleteWorkflowName("");
    setDeleteWorkflowConfirmationText("");

    if (workflowName === activeWorkflowName) {
      setActiveWorkflowName("");
      setActiveItemLevel("project");
      setIsWorkflowRunning(false);
      setWorkflowUndoStack([]);
    }
  }

  function confirmDeleteWorkflow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canDeleteWorkflow) {
      return;
    }

    deleteWorkflow(deleteWorkflowName);
  }

  useEffect(() => {
    const abortController = new AbortController();

    async function hydrateWorkspace() {
      try {
        const savedWorkspace = await loadWorkspace(abortController.signal);

        if (abortController.signal.aborted) {
          return;
        }

        if (savedWorkspace) {
          const workspace = savedWorkspace.workspace;

          workspaceRevisionRef.current = savedWorkspace.revision;
          lastSavedWorkspaceRef.current = JSON.stringify(workspace);
          setProjects(workspace.projects);
          setActiveProjectName(workspace.activeProjectName);
          setActiveWorkflowName(workspace.activeWorkflowName);
          setActiveItemLevel(workspace.activeItemLevel);
        }

        setWorkspaceSaveStatus("saved");
      } catch {
        if (abortController.signal.aborted) {
          return;
        }

        setWorkspaceSaveStatus("error");
      } finally {
        if (!abortController.signal.aborted) {
          setIsWorkspaceHydrated(true);
        }
      }
    }

    void hydrateWorkspace();

    return () => abortController.abort();
  }, []);

  useEffect(() => {
    isAppMountedRef.current = true;

    return () => {
      isAppMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isWorkspaceHydrated) {
      return;
    }

    const serializedWorkspace = JSON.stringify(durableWorkspace);

    if (serializedWorkspace === lastSavedWorkspaceRef.current) {
      if (
        pendingWorkspaceSaveRef.current?.serialized === serializedWorkspace
      ) {
        pendingWorkspaceSaveRef.current = null;
      }

      return;
    }

    if (serializedWorkspace === pendingWorkspaceSaveRef.current?.serialized) {
      return;
    }

    pendingWorkspaceSaveRef.current = {
      serialized: serializedWorkspace,
      snapshot: durableWorkspace,
    };

    const saveTimer = window.setTimeout(async () => {
      if (isWorkspaceSaveInFlightRef.current) {
        return;
      }

      isWorkspaceSaveInFlightRef.current = true;

      try {
        while (
          pendingWorkspaceSaveRef.current &&
          pendingWorkspaceSaveRef.current.serialized !==
            lastSavedWorkspaceRef.current
        ) {
          const pendingSave = pendingWorkspaceSaveRef.current;
          pendingWorkspaceSaveRef.current = null;

          if (isAppMountedRef.current) {
            setWorkspaceSaveStatus("saving");
          }

          try {
            const savedWorkspace = await saveWorkspace(
              pendingSave.snapshot,
              workspaceRevisionRef.current,
            );

            workspaceRevisionRef.current = savedWorkspace.revision;
            lastSavedWorkspaceRef.current = pendingSave.serialized;
          } catch {
            pendingWorkspaceSaveRef.current = pendingSave;

            if (isAppMountedRef.current) {
              setWorkspaceSaveStatus("error");
            }

            return;
          }
        }

        if (isAppMountedRef.current) {
          setWorkspaceSaveStatus("saved");
        }
      } finally {
        isWorkspaceSaveInFlightRef.current = false;
      }
    }, 400);

    return () => window.clearTimeout(saveTimer);
  }, [durableWorkspace, isWorkspaceHydrated]);

  useEffect(() => {
    function undoWithKeyboard(event: KeyboardEvent) {
      const isUndoShortcut =
        event.key.toLowerCase() === "z" &&
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey;

      if (
        !isUndoShortcut ||
        !canUndoWorkflowEdit ||
        activeWorkspaceType !== "workflow" ||
        isEditableElement(event.target)
      ) {
        return;
      }

      event.preventDefault();
      undoWorkflowEdit();
    }

    window.addEventListener("keydown", undoWithKeyboard);

    return () => window.removeEventListener("keydown", undoWithKeyboard);
  });

  return (
    <main className="shell">
      <section
        aria-label="Papliba app"
        className={appShellClassName}
        style={appShellStyle}
      >
        <Sidebar
          activeProjectName={activeProjectNameForSelection}
          isSidebarOpen={isSidebarOpen}
          onCreateProject={openProjectDialog}
          onOpenDeleteProjectDialog={openDeleteProjectDialog}
          onOpenGlobalSearch={openGlobalSearch}
          onOpenSidebar={openSidebar}
          onResizeSidebar={resizeSidebar}
          onRenameProject={renameProject}
          onSelectProject={selectProject}
          onThemeChange={changeThemeMode}
          onToggleSidebar={toggleSidebar}
          projects={projects}
          themeMode={themeMode}
        />

        <WorkspacePanel
          activeItem={activeWorkspaceItem}
          activeItemType={activeWorkspaceType}
          canUndoWorkflowEdit={canUndoWorkflowEdit}
          hasProject={hasProject}
          isWorkflowRunning={isWorkflowRunning}
          onAddWorkflowTrigger={addWorkflowTrigger}
          onAddWorkflowNode={addWorkflowNode}
          onBackToProject={backToProject}
          onConnectWorkflowNodes={connectWorkflowNodes}
          onCreateWorkflow={openWorkflowDialog}
          onOpenDeleteWorkflowDialog={openDeleteWorkflowDialog}
          onDeleteWorkflowNode={deleteWorkflowNode}
          onDeleteWorkflowTrigger={deleteWorkflowTrigger}
          onMoveWorkflowNode={moveWorkflowNode}
          onMoveWorkflowTrigger={moveWorkflowTrigger}
          onOpenPythonScript={openWorkflowPythonScript}
          onRenameWorkflow={renameWorkflow}
          onRunWorkflowDemo={runWorkflowDemo}
          onSelectWorkflow={selectWorkflow}
          onStartWorkflowNodeMove={startWorkflowNodeMove}
          onUndoWorkflowEdit={undoWorkflowEdit}
          onUpdateWorkflowNode={updateWorkflowNode}
          workspaceSaveStatus={workspaceSaveStatus}
        />
      </section>

      {isProjectDialogOpen && (
        <CreateProjectDialog
          draftProjectName={draftProjectName}
          error={projectNameError}
          onCancel={closeProjectDialog}
          onNameChange={updateDraftProjectName}
          onSubmit={createProject}
        />
      )}

      {isWorkflowDialogOpen && (
        <CreateWorkflowDialog
          draftWorkflowName={draftWorkflowName}
          error={workflowNameError}
          onCancel={closeWorkflowDialog}
          onNameChange={updateDraftWorkflowName}
          onSubmit={createWorkflow}
        />
      )}

      {deleteProjectName && (
        <DeleteDialog
          canDelete={canDeleteProject}
          confirmationText={deleteProjectConfirmationText}
          description={`This will delete ${deleteProjectName} and its workflows.`}
          itemName={deleteProjectName}
          label="project"
          onCancel={closeDeleteProjectDialog}
          onConfirmationChange={setDeleteProjectConfirmationText}
          onSubmit={confirmDeleteProject}
        />
      )}

      {deleteWorkflowName && (
        <DeleteDialog
          canDelete={canDeleteWorkflow}
          confirmationText={deleteWorkflowConfirmationText}
          description={`This will delete ${deleteWorkflowName} and all its nodes and connections.`}
          itemName={deleteWorkflowName}
          label="workflow"
          onCancel={closeDeleteWorkflowDialog}
          onConfirmationChange={setDeleteWorkflowConfirmationText}
          onSubmit={confirmDeleteWorkflow}
        />
      )}

      {isGlobalSearchOpen && (
        <GlobalSearchDialog
          activeProjectName={activeProjectNameForSelection}
          onClose={closeGlobalSearch}
          onCreateProject={openProjectDialog}
          onQueryChange={setGlobalSearchQuery}
          onSelectProject={selectProject}
          projects={projects}
          query={globalSearchQuery}
        />
      )}
    </main>
  );
}
