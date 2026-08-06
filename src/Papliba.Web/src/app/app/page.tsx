"use client";

import {
  type CSSProperties,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useState,
} from "react";

import { CreateProjectDialog } from "./_components/CreateProjectDialog";
import { CreateWorkflowDialog } from "./_components/CreateWorkflowDialog";
import { DeleteDialog } from "./_components/DeleteDialog";
import { GlobalSearchDialog } from "./_components/GlobalSearchDialog";
import { Sidebar } from "./_components/Sidebar";
import { WorkspacePanel } from "./_components/WorkspacePanel";
import {
  projectNameErrorMessage,
  projectNamePattern,
  themeStorageKey,
  workflowNameErrorMessage,
  workflowNamePattern,
} from "./constants";
import type {
  Project,
  ThemeMode,
  Workflow,
  WorkflowNodeStepType,
} from "./types";

type ActiveItemLevel = "project" | "workflow";

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
  return stepType === "python" ? "Python step" : "AI step";
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
  const [projectNameError, setProjectNameError] = useState("");
  const [workflowNameError, setWorkflowNameError] = useState("");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [workflowUndoStack, setWorkflowUndoStack] = useState<Workflow[]>([]);

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
  const canUndoWorkflowEdit =
    activeWorkspaceType === "workflow" && workflowUndoStack.length > 0;

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

  function addWorkflowNode(position?: { x: number; y: number }) {
    if (!activeWorkflow) {
      return;
    }

    saveWorkflowUndoStep();

    const nodeCount = activeWorkflow.nodes.length;
    const stepType = getDefaultStepType(nodeCount);
    const nextNode = {
      id: `rectangle-${Date.now()}-${nodeCount + 1}`,
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

  function deleteWorkflowNode(nodeId: string) {
    if (!activeWorkflow) {
      return;
    }

    const nodeExists = activeWorkflow.nodes.some((node) => {
      return node.id === nodeId;
    });

    if (!nodeExists) {
      return;
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
          onAddWorkflowNode={addWorkflowNode}
          onBackToProject={backToProject}
          onConnectWorkflowNodes={connectWorkflowNodes}
          onCreateWorkflow={openWorkflowDialog}
          onDeleteWorkflowNode={deleteWorkflowNode}
          onMoveWorkflowNode={moveWorkflowNode}
          onRunWorkflowDemo={runWorkflowDemo}
          onSelectWorkflow={selectWorkflow}
          onStartWorkflowNodeMove={startWorkflowNodeMove}
          onUndoWorkflowEdit={undoWorkflowEdit}
          onUpdateWorkflowNode={updateWorkflowNode}
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
