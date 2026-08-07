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

export type CodexAuthState = {
  authenticated: boolean;
  available: boolean;
  error: string | null;
  method: string | null;
};

export type PythonOpenTarget =
  | "vscode"
  | "cursor"
  | "finder"
  | "terminal"
  | "ghostty"
  | "xcode";

export class WorkspaceConflictError extends Error {
  currentRevision: number;

  constructor(currentRevision: number) {
    super("Workspace was changed by another client.");
    this.name = "WorkspaceConflictError";
    this.currentRevision = currentRevision;
  }
}

export async function getCodexAuthStatus(signal?: AbortSignal) {
  const response = await fetch(`${runnerBaseUrl}/api/codex/auth/status`, {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Could not check the Codex sign-in status.",
      ),
    );
  }

  return parseCodexAuthState(await response.json());
}

export async function startCodexLogin() {
  const response = await fetch(`${runnerBaseUrl}/api/codex/auth/login`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Could not start Codex sign-in."),
    );
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

export async function openPythonScriptInApplication(
  projectName: string,
  workflowName: string,
  nodeId: string,
  scriptName: string,
  target: PythonOpenTarget,
) {
  const response = await fetch(`${runnerBaseUrl}/api/python-scripts/open`, {
    body: JSON.stringify({
      nodeId,
      projectName,
      scriptName,
      target,
      workflowName,
    }),
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

export async function loadPythonScriptContent(
  projectName: string,
  workflowName: string,
  nodeId: string,
  scriptName: string,
) {
  const response = await fetch(`${runnerBaseUrl}/api/python-scripts/content`, {
    body: JSON.stringify({ projectName, workflowName, nodeId, scriptName }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Could not load Python script."),
    );
  }

  const body: unknown = await response.json();

  if (!isRecord(body) || typeof body.code !== "string") {
    throw new Error("Runner returned invalid Python script content.");
  }

  return body.code;
}

export async function renamePythonScriptFile(
  projectName: string,
  workflowName: string,
  nodeId: string,
  scriptName: string,
  nextScriptName: string,
) {
  const response = await fetch(`${runnerBaseUrl}/api/python-scripts/rename`, {
    body: JSON.stringify({
      nextScriptName,
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
      await getApiErrorMessage(response, "Could not rename Python script."),
    );
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

export async function writePythonRunLog(
  projectName: string,
  workflowName: string,
  nodeId: string,
  scriptName: string,
  retention: number,
  input: string,
  output: string,
) {
  const response = await fetch(`${runnerBaseUrl}/api/python-scripts/logs`, {
    body: JSON.stringify({
      input,
      nodeId,
      output,
      projectName,
      retention,
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
      await getApiErrorMessage(response, "Could not write Python run log."),
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
    (value.triggerConnectionsInitialized === undefined ||
      typeof value.triggerConnectionsInitialized === "boolean") &&
    (value.triggers === undefined ||
      (Array.isArray(value.triggers) &&
        value.triggers.every(isWorkflowTrigger))) &&
    (value.trigger === undefined ||
      value.trigger === null ||
      isWorkflowTrigger(value.trigger))
  );
}

function isWorkflowTrigger(value: unknown): value is WorkflowTrigger {
  return (
    isRecord(value) &&
    (value.id === undefined || typeof value.id === "string") &&
    typeof value.x === "number" &&
    Number.isFinite(value.x) &&
    typeof value.y === "number" &&
    Number.isFinite(value.y) &&
    (value.name === undefined || typeof value.name === "string")
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
    (value.stepType === "codex" ||
      value.stepType === "claude-code" ||
      value.stepType === "python" ||
      value.stepType === "ai") &&
    typeof value.x === "number" &&
    Number.isFinite(value.x) &&
    typeof value.y === "number" &&
    Number.isFinite(value.y) &&
    (value.input === undefined || typeof value.input === "string") &&
    (value.output === undefined || typeof value.output === "string") &&
    (value.logRetention === undefined ||
      (typeof value.logRetention === "number" &&
        Number.isInteger(value.logRetention) &&
        value.logRetention >= 1 &&
        value.logRetention <= 100)) &&
    (value.scriptName === undefined || typeof value.scriptName === "string")
  );
}

function isWorkflowConnection(value: unknown): value is WorkflowConnection {
  return (
    isRecord(value) &&
    typeof value.fromNodeId === "string" &&
    typeof value.toNodeId === "string" &&
    (value.status === undefined ||
      value.status === "idle" ||
      value.status === "running")
  );
}

function resetProjectRuntimeState(project: Project): Project {
  return {
    ...project,
    workflows: project.workflows.map((workflow) => {
      const savedTriggers =
        workflow.triggers ??
        (workflow.trigger ? [workflow.trigger] : []);
      const triggers = savedTriggers.map((trigger, triggerIndex) => ({
        ...trigger,
        id: trigger.id || `manual-trigger-${triggerIndex + 1}`,
        name: trigger.name?.trim() || "Manual trigger",
      }));
      const connections = workflow.connections.map((connection) => ({
        ...connection,
        status: undefined,
      }));
      const entryNode = [...workflow.nodes].sort(
        (first, second) => first.x - second.x,
      )[0];

      if (workflow.triggerConnectionsInitialized !== true && entryNode) {
        for (const trigger of triggers) {
          if (
            !connections.some(
              (connection) => connection.fromNodeId === trigger.id,
            )
          ) {
            connections.push({
              fromNodeId: trigger.id,
              status: undefined,
              toNodeId: entryNode.id,
            });
          }
        }
      }

      return {
        ...workflow,
        connections,
        nodes: workflow.nodes.map((node) => ({
          ...node,
          input: undefined,
          logRetention:
            node.stepType === "python" ? node.logRetention ?? 10 : undefined,
          output: undefined,
          status: "idle",
        })),
        trigger: undefined,
        triggerConnectionsInitialized: true,
        triggers,
      };
    }),
  };
}

function parseCodexAuthState(value: unknown): CodexAuthState {
  if (
    !isRecord(value) ||
    typeof value.authenticated !== "boolean" ||
    typeof value.available !== "boolean" ||
    (value.method !== null && typeof value.method !== "string") ||
    (value.error !== null && typeof value.error !== "string")
  ) {
    throw new Error("Runner returned an invalid Codex sign-in status.");
  }

  return {
    authenticated: value.authenticated,
    available: value.available,
    error: value.error,
    method: value.method,
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
