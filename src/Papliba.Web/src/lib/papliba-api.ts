import type {
  Project,
  Workflow,
  WorkflowConnection,
  WorkflowNode,
  WorkflowTrigger,
  WorkspaceSnapshot,
} from "@/app/app/types";
import { workspaceSchemaVersion } from "@/app/app/constants";

const runnerBaseUrl =
  process.env.NEXT_PUBLIC_PAPLIBA_RUNNER_URL ?? "http://127.0.0.1:5127";

export type SavedWorkspace = {
  revision: number;
  schemaVersion: number;
  updatedAt: string;
  workspace: WorkspaceSnapshot;
};

export class WorkspaceConflictError extends Error {
  currentRevision: number;

  constructor(currentRevision: number) {
    super("Workspace was changed by another client.");
    this.name = "WorkspaceConflictError";
    this.currentRevision = currentRevision;
  }
}

export async function loadWorkspace(signal?: AbortSignal) {
  const response = await fetch(`${runnerBaseUrl}/api/workspace`, {
    method: "GET",
    signal,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Could not load workspace (${response.status}).`);
  }

  return parseSavedWorkspace(await response.json());
}

export async function saveWorkspace(
  workspace: WorkspaceSnapshot,
  expectedRevision: number,
) {
  const response = await fetch(`${runnerBaseUrl}/api/workspace`, {
    body: JSON.stringify({
      expectedRevision,
      schemaVersion: workspaceSchemaVersion,
      workspace,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

  if (response.status === 409) {
    const body: unknown = await response.json();
    const currentRevision =
      isRecord(body) && typeof body.currentRevision === "number"
        ? body.currentRevision
        : expectedRevision;

    throw new WorkspaceConflictError(currentRevision);
  }

  if (!response.ok) {
    throw new Error(`Could not save workspace (${response.status}).`);
  }

  return parseSavedWorkspace(await response.json());
}

export async function openPythonScriptInVsCode(
  projectName: string,
  workflowName: string,
  nodeId: string,
  scriptName: string,
) {
  const response = await fetch(`${runnerBaseUrl}/api/python-scripts/open`, {
    body: JSON.stringify({ projectName, workflowName, nodeId, scriptName }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      isRecord(body) && typeof body.error === "string"
        ? body.error
        : `Could not open Python script (${response.status}).`;

    throw new Error(message);
  }
}

export async function trashPythonScriptFile(
  projectName: string,
  workflowName: string,
  nodeId: string,
  scriptName: string,
) {
  const response = await fetch(`${runnerBaseUrl}/api/python-scripts/trash`, {
    body: JSON.stringify({ projectName, workflowName, nodeId, scriptName }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      isRecord(body) && typeof body.error === "string"
        ? body.error
        : `Could not remove Python script (${response.status}).`;

    throw new Error(message);
  }
}

export async function askPythonScriptChat(
  projectName: string,
  workflowName: string,
  nodeId: string,
  scriptName: string,
  message: string,
) {
  const response = await fetch(`${runnerBaseUrl}/api/python-scripts/chat`, {
    body: JSON.stringify({
      message,
      nodeId,
      projectName,
      scriptName,
      workflowName,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Could not ask AI."));
  }

  const body: unknown = await response.json();

  if (!isRecord(body) || typeof body.code !== "string") {
    throw new Error("Runner returned an invalid AI response.");
  }

  return body.code;
}

export async function applyPythonScriptCode(
  projectName: string,
  workflowName: string,
  nodeId: string,
  scriptName: string,
  code: string,
) {
  const response = await fetch(`${runnerBaseUrl}/api/python-scripts/apply`, {
    body: JSON.stringify({
      code,
      nodeId,
      projectName,
      scriptName,
      workflowName,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Could not update Python script."),
    );
  }
}

export function normalizeWorkspace(workspace: WorkspaceSnapshot) {
  const projects = workspace.projects.map(resetProjectRuntimeState);
  const selectedProject = projects.find((project) => {
    return project.name === workspace.activeProjectName;
  });
  const activeProjectName = selectedProject?.name ?? projects[0]?.name ?? "";
  const activeProject = projects.find((project) => {
    return project.name === activeProjectName;
  });
  const selectedWorkflow = activeProject?.workflows.find((workflow) => {
    return workflow.name === workspace.activeWorkflowName;
  });

  return {
    activeItemLevel:
      workspace.activeItemLevel === "workflow" && selectedWorkflow
        ? "workflow"
        : "project",
    activeProjectName,
    activeWorkflowName: selectedWorkflow?.name ?? "",
    projects,
  } satisfies WorkspaceSnapshot;
}

export function createDurableWorkspace(workspace: WorkspaceSnapshot) {
  return normalizeWorkspace(workspace);
}

function parseSavedWorkspace(value: unknown): SavedWorkspace {
  if (
    !isRecord(value) ||
    value.schemaVersion !== workspaceSchemaVersion ||
    typeof value.revision !== "number" ||
    typeof value.updatedAt !== "string" ||
    !isWorkspaceSnapshot(value.workspace)
  ) {
    throw new Error("Runner returned an invalid workspace document.");
  }

  return {
    revision: value.revision,
    schemaVersion: value.schemaVersion,
    updatedAt: value.updatedAt,
    workspace: normalizeWorkspace(value.workspace),
  };
}

function isWorkspaceSnapshot(value: unknown): value is WorkspaceSnapshot {
  return (
    isRecord(value) &&
    Array.isArray(value.projects) &&
    value.projects.every(isProject) &&
    typeof value.activeProjectName === "string" &&
    typeof value.activeWorkflowName === "string" &&
    (value.activeItemLevel === "project" ||
      value.activeItemLevel === "workflow")
  );
}

function isProject(value: unknown): value is Project {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    Array.isArray(value.workflows) &&
    value.workflows.every(isWorkflow)
  );
}

function isWorkflow(value: unknown): value is Workflow {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    Array.isArray(value.nodes) &&
    value.nodes.every(isWorkflowNode) &&
    Array.isArray(value.connections) &&
    value.connections.every(isWorkflowConnection) &&
    (value.trigger === undefined ||
      value.trigger === null ||
      isWorkflowTrigger(value.trigger))
  );
}

function isWorkflowTrigger(value: unknown): value is WorkflowTrigger {
  return (
    isRecord(value) &&
    typeof value.x === "number" &&
    Number.isFinite(value.x) &&
    typeof value.y === "number" &&
    Number.isFinite(value.y)
  );
}

function isWorkflowNode(value: unknown): value is WorkflowNode {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.kind === "rectangle" &&
    typeof value.name === "string" &&
    (value.status === "idle" ||
      value.status === "running" ||
      value.status === "done" ||
      value.status === "error") &&
    (value.stepType === "python" || value.stepType === "ai") &&
    typeof value.x === "number" &&
    Number.isFinite(value.x) &&
    typeof value.y === "number" &&
    Number.isFinite(value.y) &&
    (value.input === undefined || typeof value.input === "string") &&
    (value.output === undefined || typeof value.output === "string") &&
    (value.scriptName === undefined || typeof value.scriptName === "string")
  );
}

function isWorkflowConnection(value: unknown): value is WorkflowConnection {
  return (
    isRecord(value) &&
    typeof value.fromNodeId === "string" &&
    typeof value.toNodeId === "string"
  );
}

function resetProjectRuntimeState(project: Project): Project {
  return {
    ...project,
    workflows: project.workflows.map((workflow) => ({
      ...workflow,
      connections: workflow.connections.map((connection) => ({
        ...connection,
      })),
      nodes: workflow.nodes.map((node) => ({
        ...node,
        input: undefined,
        output: undefined,
        status: "idle",
      })),
      trigger: workflow.trigger ? { ...workflow.trigger } : workflow.trigger,
    })),
  };
}

async function getApiErrorMessage(response: Response, fallback: string) {
  const body: unknown = await response.json().catch(() => null);

  if (isRecord(body) && typeof body.error === "string") {
    return body.error;
  }

  return `${fallback} (${response.status}).`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
