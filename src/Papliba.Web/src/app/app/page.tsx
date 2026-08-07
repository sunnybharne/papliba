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
  applyPythonScriptCode,
  askPythonScriptChat,
  createDurableWorkspace,
  loadWorkspace,
  loadPythonScriptContent,
  openPythonScriptInApplication,
  renamePythonScriptFile,
  saveWorkspace,
  trashPythonScriptFile,
  writePythonRunLog,
  type PythonOpenTarget,
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
const defaultPythonScriptName = "python-script";
const defaultPythonRunLogRetention = 10;
const pythonScriptNamePattern = /^[a-z0-9][a-z0-9_-]{0,59}$/;
const workflowTriggerHandoffDelayMs = 240;
const workflowConnectionHandoffDelayMs = 190;
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
  const triggers =
    workflow.triggers ??
    (workflow.trigger ? [workflow.trigger] : []);

  return {
    ...workflow,
    connections: getInitializedWorkflowConnections(workflow).map(
      (connection) => ({ ...connection }),
    ),
    nodes: workflow.nodes.map((node) => ({ ...node })),
    triggers: triggers.map((trigger, triggerIndex) => ({
      ...trigger,
      id: trigger.id || `manual-trigger-${triggerIndex + 1}`,
    })),
    triggerConnectionsInitialized: true,
  };
}

function getInitializedWorkflowConnections(workflow: Workflow) {
  if (workflow.triggerConnectionsInitialized === true) {
    return workflow.connections;
  }

  const connections = workflow.connections.map((connection) => ({
    ...connection,
  }));
  const entryNode = [...workflow.nodes].sort(
    (first, second) => first.x - second.x,
  )[0];

  if (!entryNode) {
    return connections;
  }

  for (const trigger of workflow.triggers ?? []) {
    if (
      !connections.some(
        (connection) => connection.fromNodeId === trigger.id,
      )
    ) {
      connections.push({
        fromNodeId: trigger.id,
        toNodeId: entryNode.id,
      });
    }
  }

  return connections;
}

function getWorkflowExecutionBatches(workflow: Workflow, triggerId: string) {
  const nodesById = new Map(workflow.nodes.map((node) => [node.id, node]));
  const connections = getInitializedWorkflowConnections(workflow);
  const reachableNodeIds = new Set<string>();
  const pendingNodeIds = connections
    .filter((connection) => connection.fromNodeId === triggerId)
    .map((connection) => connection.toNodeId);

  while (pendingNodeIds.length > 0) {
    const nodeId = pendingNodeIds.shift();

    if (!nodeId || reachableNodeIds.has(nodeId) || !nodesById.has(nodeId)) {
      continue;
    }

    reachableNodeIds.add(nodeId);

    for (const connection of connections) {
      if (connection.fromNodeId === nodeId) {
        pendingNodeIds.push(connection.toNodeId);
      }
    }
  }

  const completedNodeIds = new Set<string>();
  const scheduledNodeIds = new Set<string>();
  const executionBatches: Array<Workflow["nodes"]> = [];

  while (scheduledNodeIds.size < reachableNodeIds.size) {
    const readyNodes = workflow.nodes
      .filter((node) => {
        if (
          !reachableNodeIds.has(node.id) ||
          scheduledNodeIds.has(node.id)
        ) {
          return false;
        }

        return connections.every((connection) => {
          if (
            connection.toNodeId !== node.id ||
            !reachableNodeIds.has(connection.fromNodeId)
          ) {
            return true;
          }

          return completedNodeIds.has(connection.fromNodeId);
        });
      })
      .sort((first, second) => first.x - second.x);

    if (readyNodes.length === 0) {
      break;
    }

    executionBatches.push(readyNodes);

    for (const node of readyNodes) {
      scheduledNodeIds.add(node.id);
      completedNodeIds.add(node.id);
    }
  }

  return executionBatches;
}

function isEditableElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.closest("input, textarea, select, [contenteditable='true']") !==
    null
  );
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function getDefaultStepType(): WorkflowNodeStepType {
  return "codex";
}

function getDefaultStepName(stepType: WorkflowNodeStepType) {
  if (stepType === "python") {
    return defaultPythonScriptName;
  }

  if (stepType === "claude-code") {
    return "Claude Code";
  }

  if (stepType === "codex") {
    return "OpenAI";
  }

  return "AI step";
}

function getDemoOutput(stepType: WorkflowNodeStepType, input: string) {
  if (stepType === "python") {
    return "Found 5 unread emails from today.";
  }

  if (stepType === "codex") {
    return `OpenAI completed: ${input}`;
  }

  if (stepType === "claude-code") {
    return `Claude Code completed: ${input}`;
  }

  return `Summary: ${input} 2 items look urgent.`;
}

function getFallbackPythonScriptName(pythonNodeIndex: number) {
  return pythonNodeIndex === 1
    ? defaultPythonScriptName
    : `${defaultPythonScriptName}-${pythonNodeIndex}`;
}

function getPythonScriptName(workflow: Workflow, nodeId: string) {
  let pythonNodeIndex = 0;

  for (const node of workflow.nodes) {
    if (node.stepType !== "python") {
      continue;
    }

    pythonNodeIndex += 1;

    if (node.id === nodeId) {
      return node.scriptName ?? getFallbackPythonScriptName(pythonNodeIndex);
    }
  }

  return defaultPythonScriptName;
}

function getNextPythonScriptName(workflow: Workflow, ignoredNodeId?: string) {
  const usedNames = new Set<string>();
  let pythonNodeIndex = 0;

  for (const node of workflow.nodes) {
    if (node.stepType !== "python") {
      continue;
    }

    pythonNodeIndex += 1;

    if (node.id !== ignoredNodeId) {
      usedNames.add(
        node.scriptName ?? getFallbackPythonScriptName(pythonNodeIndex),
      );
    }
  }

  let nextIndex = 1;

  while (true) {
    const nextName = getFallbackPythonScriptName(nextIndex);

    if (!usedNames.has(nextName)) {
      return nextName;
    }

    nextIndex += 1;
  }
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
      ? {
          ...activeWorkflow,
          connections: getInitializedWorkflowConnections(activeWorkflow),
        }
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
              triggerConnectionsInitialized: true,
              triggers: [],
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
    const stepType = requestedStepType ?? getDefaultStepType();
    const scriptName =
      stepType === "python"
        ? getNextPythonScriptName(activeWorkflow)
        : undefined;
    const nextNode = {
      id: `${stepType}-${Date.now()}-${nodeCount + 1}`,
      kind: "rectangle" as const,
      logRetention:
        stepType === "python" ? defaultPythonRunLogRetention : undefined,
      name: getDefaultStepName(stepType),
      scriptName,
      status: "idle" as const,
      stepType,
      x: Math.max(24, position?.x ?? 230 + nodeCount * 190),
      y: Math.max(24, position?.y ?? 120),
    };

    updateActiveWorkflow((workflow) => ({
      ...workflow,
      connections:
        workflow.nodes.length === 0
          ? [
              ...workflow.connections,
              ...workflow.triggers.map((trigger) => ({
                fromNodeId: trigger.id,
                toNodeId: nextNode.id,
              })),
            ]
          : workflow.connections,
      nodes: [...workflow.nodes, nextNode],
    }));
  }

  async function openWorkflowPythonScript(
    nodeId: string,
    target: PythonOpenTarget,
  ) {
    if (!activeProject || !activeWorkflow) {
      throw new Error("The workflow is no longer available.");
    }

    await openPythonScriptInApplication(
      activeProject.name,
      activeWorkflow.name,
      nodeId,
      getPythonScriptName(activeWorkflow, nodeId),
      target,
    );
  }

  async function loadWorkflowPythonScript(nodeId: string) {
    if (!activeProject || !activeWorkflow) {
      throw new Error("The workflow is no longer available.");
    }

    return loadPythonScriptContent(
      activeProject.name,
      activeWorkflow.name,
      nodeId,
      getPythonScriptName(activeWorkflow, nodeId),
    );
  }

  async function renameWorkflowPythonScript(
    nodeId: string,
    requestedName: string,
  ) {
    if (!activeProject || !activeWorkflow) {
      return "The workflow is no longer available.";
    }

    const node = activeWorkflow.nodes.find(
      (candidate) =>
        candidate.id === nodeId && candidate.stepType === "python",
    );

    if (!node) {
      return "The Python script is no longer available.";
    }

    const nextScriptName = requestedName
      .trim()
      .toLowerCase()
      .replace(/\.py$/i, "");

    if (!pythonScriptNamePattern.test(nextScriptName)) {
      return "Use 1–60 lowercase letters, numbers, hyphens, or underscores.";
    }

    const nameAlreadyExists = activeWorkflow.nodes.some(
      (candidate) =>
        candidate.id !== nodeId &&
        candidate.stepType === "python" &&
        getPythonScriptName(activeWorkflow, candidate.id) === nextScriptName,
    );

    if (nameAlreadyExists) {
      return `A Python step named ${nextScriptName} already exists in this workflow.`;
    }

    const currentScriptName = getPythonScriptName(activeWorkflow, nodeId);

    if (currentScriptName !== nextScriptName) {
      try {
        await renamePythonScriptFile(
          activeProject.name,
          activeWorkflow.name,
          nodeId,
          currentScriptName,
          nextScriptName,
        );
      } catch (error) {
        return error instanceof Error
          ? error.message
          : "Could not rename Python script.";
      }
    }

    setWorkflowUndoStack([]);
    updateActiveWorkflow((workflow) => ({
      ...workflow,
      nodes: workflow.nodes.map((candidate) =>
        candidate.id === nodeId
          ? {
              ...candidate,
              name: nextScriptName,
              scriptName: nextScriptName,
            }
          : candidate,
      ),
    }));

    return "";
  }

  async function askWorkflowPythonScript(nodeId: string, message: string) {
    if (!activeProject || !activeWorkflow) {
      throw new Error("The workflow is no longer available.");
    }

    return askPythonScriptChat(
      activeProject.name,
      activeWorkflow.name,
      nodeId,
      getPythonScriptName(activeWorkflow, nodeId),
      message,
    );
  }

  async function applyWorkflowPythonScript(nodeId: string, code: string) {
    if (!activeProject || !activeWorkflow) {
      throw new Error("The workflow is no longer available.");
    }

    await applyPythonScriptCode(
      activeProject.name,
      activeWorkflow.name,
      nodeId,
      getPythonScriptName(activeWorkflow, nodeId),
      code,
    );
  }

  function updateWorkflowPythonLogRetention(
    nodeId: string,
    requestedRetention: number,
  ) {
    const logRetention = Math.min(
      100,
      Math.max(1, Math.trunc(requestedRetention) || defaultPythonRunLogRetention),
    );

    updateActiveWorkflow((workflow) => ({
      ...workflow,
      nodes: workflow.nodes.map((node) =>
        node.id === nodeId && node.stepType === "python"
          ? { ...node, logRetention }
          : node,
      ),
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

  function moveWorkflowNodes(
    positions: Array<{ nodeId: string; x: number; y: number }>,
  ) {
    const positionsByNodeId = new Map(
      positions.map((position) => [position.nodeId, position]),
    );

    updateActiveWorkflow((workflow) => ({
      ...workflow,
      nodes: workflow.nodes.map((node) => {
        const position = positionsByNodeId.get(node.id);

        return position
          ? { ...node, x: position.x, y: position.y }
          : node;
      }),
    }));
  }

  function moveWorkflowTrigger(triggerId: string, x: number, y: number) {
    updateActiveWorkflow((workflow) => ({
      ...workflow,
      triggers: workflow.triggers.map((trigger) =>
        trigger.id === triggerId ? { ...trigger, x, y } : trigger,
      ),
    }));
  }

  function pasteWorkflowSelection(
    copiedNodes: Workflow["nodes"],
    copiedTriggers: Workflow["triggers"],
    copiedConnections: Workflow["connections"],
    offset: number,
  ) {
    if (!activeWorkflow || (copiedNodes.length === 0 && copiedTriggers.length === 0)) {
      return { nodeIds: [], triggerIds: [] };
    }

    const copiedIdToPastedId = new Map<string, string>();
    let workflowWithPastedNodes = activeWorkflow;
    const pastedNodes = copiedNodes.map((copiedNode) => {
      const nodeId = crypto.randomUUID();
      copiedIdToPastedId.set(copiedNode.id, nodeId);

      const pastedNode = {
        ...copiedNode,
        id: nodeId,
        input: undefined,
        output: undefined,
        status: "idle" as const,
        x: Math.max(12, copiedNode.x + offset),
        y: Math.max(12, copiedNode.y + offset),
      };

      if (copiedNode.stepType !== "python") {
        workflowWithPastedNodes = {
          ...workflowWithPastedNodes,
          nodes: [...workflowWithPastedNodes.nodes, pastedNode],
        };
        return pastedNode;
      }

      const scriptName = getNextPythonScriptName(workflowWithPastedNodes);
      const pastedPythonNode = {
        ...pastedNode,
        name: scriptName,
        scriptName,
      };
      workflowWithPastedNodes = {
        ...workflowWithPastedNodes,
        nodes: [...workflowWithPastedNodes.nodes, pastedPythonNode],
      };
      return pastedPythonNode;
    });
    const pastedTriggers = copiedTriggers.map((copiedTrigger) => {
      const triggerId = crypto.randomUUID();
      copiedIdToPastedId.set(copiedTrigger.id, triggerId);

      return {
        ...copiedTrigger,
        id: triggerId,
        x: Math.max(12, copiedTrigger.x + offset),
        y: Math.max(12, copiedTrigger.y + offset),
      };
    });
    const pastedConnections = copiedConnections.flatMap((connection) => {
      const fromNodeId = copiedIdToPastedId.get(connection.fromNodeId);
      const toNodeId = copiedIdToPastedId.get(connection.toNodeId);

      return fromNodeId && toNodeId
        ? [{ fromNodeId, status: "idle" as const, toNodeId }]
        : [];
    });

    saveWorkflowUndoStep();
    updateActiveWorkflow((workflow) => ({
      ...workflow,
      connections: [...workflow.connections, ...pastedConnections],
      nodes: [...workflow.nodes, ...pastedNodes],
      triggers: [...workflow.triggers, ...pastedTriggers],
    }));

    return {
      nodeIds: pastedNodes.map((node) => node.id),
      triggerIds: pastedTriggers.map((trigger) => trigger.id),
    };
  }

  function renameWorkflowTrigger(triggerId: string, name: string) {
    const nextName = name.trim();

    if (
      !activeWorkflow?.triggers.some((trigger) => trigger.id === triggerId) ||
      nextName.length === 0
    ) {
      return;
    }

    saveWorkflowUndoStep();
    updateActiveWorkflow((workflow) => ({
      ...workflow,
      triggers: workflow.triggers.map((trigger) =>
        trigger.id === triggerId ? { ...trigger, name: nextName } : trigger,
      ),
    }));
  }

  function addWorkflowTrigger(position?: { x: number; y: number }) {
    if (!activeWorkflow) {
      return;
    }

    saveWorkflowUndoStep();
    updateActiveWorkflow((workflow) => {
      const triggerId = crypto.randomUUID();
      const entryNode = [...workflow.nodes].sort(
        (first, second) => first.x - second.x,
      )[0];

      return {
        ...workflow,
        connections: entryNode
          ? [
              ...workflow.connections,
              { fromNodeId: triggerId, toNodeId: entryNode.id },
            ]
          : workflow.connections,
        triggers: [
          ...workflow.triggers,
          {
            ...defaultWorkflowTriggerPosition,
            id: triggerId,
            ...(position ?? {
              x:
                defaultWorkflowTriggerPosition.x +
                workflow.triggers.length * 18,
              y:
                defaultWorkflowTriggerPosition.y +
                workflow.triggers.length * 18,
            }),
          },
        ],
      };
    });
  }

  function deleteWorkflowTrigger(triggerId: string) {
    if (
      !activeWorkflow?.triggers.some((trigger) => trigger.id === triggerId)
    ) {
      return;
    }

    saveWorkflowUndoStep();
    updateActiveWorkflow((workflow) => ({
      ...workflow,
      connections: workflow.connections.filter(
        (connection) => connection.fromNodeId !== triggerId,
      ),
      triggers: workflow.triggers.filter(
        (trigger) => trigger.id !== triggerId,
      ),
    }));
  }

  async function deleteWorkflowNodes(nodeIds: string[]) {
    if (!activeProject || !activeWorkflow) {
      return false;
    }

    const nodeIdSet = new Set(nodeIds);
    const nodesToDelete = activeWorkflow.nodes.filter((node) => {
      return nodeIdSet.has(node.id);
    });

    if (nodesToDelete.length === 0) {
      return false;
    }

    try {
      await Promise.all(
        nodesToDelete
          .filter((node) => node.stepType === "python")
          .map((node) =>
            trashPythonScriptFile(
              activeProject.name,
              activeWorkflow.name,
              node.id,
              getPythonScriptName(activeWorkflow, node.id),
            ),
          ),
      );
    } catch {
      setWorkspaceSaveStatus("error");
      return false;
    }

    saveWorkflowUndoStep();

    updateActiveWorkflow((workflow) => ({
      ...workflow,
      connections: workflow.connections.filter((connection) => {
        return (
          !nodeIdSet.has(connection.fromNodeId) &&
          !nodeIdSet.has(connection.toNodeId)
        );
      }),
      nodes: workflow.nodes.filter((node) => {
        return !nodeIdSet.has(node.id);
      }),
    }));

    return true;
  }

  async function runWorkflowDemo(triggerId: string) {
    if (
      !activeProject ||
      !activeWorkflow ||
      activeWorkflow.nodes.length === 0 ||
      isWorkflowRunning
    ) {
      return;
    }

    const trigger = activeWorkflow.triggers.find(
      (candidate) => candidate.id === triggerId,
    );

    if (!trigger) {
      return;
    }

    const executionBatches = getWorkflowExecutionBatches(
      activeWorkflow,
      triggerId,
    );

    if (executionBatches.length === 0) {
      return;
    }

    setIsWorkflowRunning(true);
    setWorkflowUndoStack([]);

    const workflowConnections =
      getInitializedWorkflowConnections(activeWorkflow);
    const triggerOutput = `${trigger.name?.trim() || "Manual trigger"} started the workflow.`;
    const nodeOutputs = new Map<string, string>();

    async function animateConnections(
      connectionsToAnimate: Workflow["connections"],
    ) {
      if (connectionsToAnimate.length === 0) {
        return;
      }

      const connectionKeys = new Set(
        connectionsToAnimate.map(
          (connection) =>
            `${connection.fromNodeId}->${connection.toNodeId}`,
        ),
      );

      updateActiveWorkflow((workflow) => ({
        ...workflow,
        connections: getInitializedWorkflowConnections(workflow).map(
          (connection) => ({
            ...connection,
            status: connectionKeys.has(
              `${connection.fromNodeId}->${connection.toNodeId}`,
            )
              ? "running"
              : undefined,
          }),
        ),
        triggerConnectionsInitialized: true,
      }));

      await wait(workflowConnectionHandoffDelayMs);

      updateActiveWorkflow((workflow) => ({
        ...workflow,
        connections: workflow.connections.map((connection) => ({
          ...connection,
          status: undefined,
        })),
      }));
    }

    updateActiveWorkflow((workflow) => ({
      ...workflow,
      connections: getInitializedWorkflowConnections(workflow).map(
        (connection) => ({
          ...connection,
          status: undefined,
        }),
      ),
      nodes: workflow.nodes.map((node) => ({
        ...node,
        input: undefined,
        output: undefined,
        status: "idle",
      })),
    }));

    await wait(workflowTriggerHandoffDelayMs);
    for (const nodesInBatch of executionBatches) {
      const nodeIdsInBatch = new Set(
        nodesInBatch.map((node) => node.id),
      );
      const incomingConnections = workflowConnections.filter(
        (connection) =>
          nodeIdsInBatch.has(connection.toNodeId) &&
          (connection.fromNodeId === triggerId ||
            nodeOutputs.has(connection.fromNodeId)),
      );
      await animateConnections(incomingConnections);
      const nodeInputs = new Map(
        nodesInBatch.map((node) => {
          const inputs = incomingConnections
            .filter((connection) => connection.toNodeId === node.id)
            .map((connection) =>
              connection.fromNodeId === triggerId
                ? triggerOutput
                : nodeOutputs.get(connection.fromNodeId),
            )
            .filter((input): input is string => input !== undefined);

          return [node.id, [...new Set(inputs)].join("\n") || triggerOutput];
        }),
      );

      updateActiveWorkflow((workflow) => ({
        ...workflow,
        nodes: workflow.nodes.map((currentNode) => {
          if (!nodeIdsInBatch.has(currentNode.id)) {
            return currentNode;
          }

          return {
            ...currentNode,
            input: nodeInputs.get(currentNode.id),
            output: undefined,
            status: "running",
          };
        }),
      }));

      await wait(workflowRunDelayMs);

      const batchOutputs = new Map(
        nodesInBatch.map((node) => {
          const nodeInput = nodeInputs.get(node.id) ?? triggerOutput;
          return [node.id, getDemoOutput(node.stepType, nodeInput)];
        }),
      );

      updateActiveWorkflow((workflow) => ({
        ...workflow,
        nodes: workflow.nodes.map((currentNode) => {
          if (!nodeIdsInBatch.has(currentNode.id)) {
            return currentNode;
          }

          return {
            ...currentNode,
            output: batchOutputs.get(currentNode.id),
            status: "done",
          };
        }),
      }));

      for (const node of nodesInBatch) {
        nodeOutputs.set(
          node.id,
          batchOutputs.get(node.id) ?? triggerOutput,
        );
      }

      await Promise.all(
        nodesInBatch
          .filter((node) => node.stepType === "python")
          .map(async (node) => {
            try {
              await writePythonRunLog(
                activeProject.name,
                activeWorkflow.name,
                node.id,
                getPythonScriptName(activeWorkflow, node.id),
                node.logRetention ?? defaultPythonRunLogRetention,
                nodeInputs.get(node.id) ?? triggerOutput,
                batchOutputs.get(node.id) ?? triggerOutput,
              );
            } catch {
              setWorkspaceSaveStatus("error");
            }
          }),
      );
    }

    updateActiveWorkflow((workflow) => ({
      ...workflow,
      connections: workflow.connections.map((connection) => ({
        ...connection,
        status: undefined,
      })),
    }));
    setIsWorkflowRunning(false);
  }

  function connectWorkflowNodes(fromNodeId: string, toNodeId: string) {
    if (!activeWorkflow || fromNodeId === toNodeId) {
      return;
    }

    const initializedConnections =
      getInitializedWorkflowConnections(activeWorkflow);
    const alreadyConnected = initializedConnections.some((connection) => {
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
        connections: [
          ...getInitializedWorkflowConnections(workflow),
          { fromNodeId, toNodeId },
        ],
        triggerConnectionsInitialized: true,
      };
    });
  }

  function deleteWorkflowConnection(
    fromNodeId: string,
    toNodeId: string,
  ) {
    if (!activeWorkflow) {
      return;
    }

    const initializedConnections =
      getInitializedWorkflowConnections(activeWorkflow);
    const connectionExists = initializedConnections.some(
      (connection) =>
        connection.fromNodeId === fromNodeId &&
        connection.toNodeId === toNodeId,
    );

    if (!connectionExists) {
      return;
    }

    saveWorkflowUndoStep();
    updateActiveWorkflow((workflow) => ({
      ...workflow,
      connections: getInitializedWorkflowConnections(workflow).filter(
        (connection) =>
          connection.fromNodeId !== fromNodeId ||
          connection.toNodeId !== toNodeId,
      ),
      triggerConnectionsInitialized: true,
    }));
  }

  function reconnectWorkflowConnection(
    fromNodeId: string,
    previousToNodeId: string,
    nextToNodeId: string,
  ) {
    if (
      !activeWorkflow ||
      fromNodeId === nextToNodeId ||
      previousToNodeId === nextToNodeId
    ) {
      return;
    }

    const initializedConnections =
      getInitializedWorkflowConnections(activeWorkflow);
    const connectionExists = initializedConnections.some(
      (connection) =>
        connection.fromNodeId === fromNodeId &&
        connection.toNodeId === previousToNodeId,
    );

    if (!connectionExists) {
      return;
    }

    saveWorkflowUndoStep();
    updateActiveWorkflow((workflow) => {
      const remainingConnections =
        getInitializedWorkflowConnections(workflow).filter(
          (connection) =>
            connection.fromNodeId !== fromNodeId ||
            connection.toNodeId !== previousToNodeId,
        );
      const nextConnectionAlreadyExists = remainingConnections.some(
        (connection) =>
          connection.fromNodeId === fromNodeId &&
          connection.toNodeId === nextToNodeId,
      );

      return {
        ...workflow,
        connections: nextConnectionAlreadyExists
          ? remainingConnections
          : [
              ...remainingConnections,
              { fromNodeId, toNodeId: nextToNodeId },
            ],
        triggerConnectionsInitialized: true,
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
          onApplyPythonScriptCode={applyWorkflowPythonScript}
          onAskPythonScriptCode={askWorkflowPythonScript}
          onBackToProject={backToProject}
          onConnectWorkflowNodes={connectWorkflowNodes}
          onDeleteWorkflowConnection={deleteWorkflowConnection}
          onReconnectWorkflowConnection={reconnectWorkflowConnection}
          onCreateWorkflow={openWorkflowDialog}
          onOpenDeleteWorkflowDialog={openDeleteWorkflowDialog}
          onDeleteWorkflowNodes={deleteWorkflowNodes}
          onDeleteWorkflowTrigger={deleteWorkflowTrigger}
          onMoveWorkflowNode={moveWorkflowNode}
          onMoveWorkflowNodes={moveWorkflowNodes}
          onMoveWorkflowTrigger={moveWorkflowTrigger}
          onPasteWorkflowSelection={pasteWorkflowSelection}
          onRenameWorkflowPythonScript={renameWorkflowPythonScript}
          onRenameWorkflowTrigger={renameWorkflowTrigger}
          onLoadPythonScript={loadWorkflowPythonScript}
          onOpenPythonScript={openWorkflowPythonScript}
          onRenameWorkflow={renameWorkflow}
          onRunWorkflowDemo={runWorkflowDemo}
          onSelectWorkflow={selectWorkflow}
          onStartWorkflowNodeMove={startWorkflowNodeMove}
          onUndoWorkflowEdit={undoWorkflowEdit}
          onUpdatePythonLogRetention={updateWorkflowPythonLogRetention}
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
