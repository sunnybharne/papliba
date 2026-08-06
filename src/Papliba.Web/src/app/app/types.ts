export type ThemeMode = "system" | "light" | "dark";

export type ActiveItemLevel = "project" | "workflow";

export type WorkspaceSaveStatus =
  | "loading"
  | "saving"
  | "saved"
  | "error";

export type WorkflowNodeStatus = "idle" | "running" | "done" | "error";

export type WorkflowNodeStepType = "python" | "ai";

export type WorkflowNode = {
  id: string;
  input?: string;
  kind: "rectangle";
  name: string;
  output?: string;
  status: WorkflowNodeStatus;
  stepType: WorkflowNodeStepType;
  x: number;
  y: number;
};

export type WorkflowConnection = {
  fromNodeId: string;
  toNodeId: string;
};

export type WorkflowTrigger = {
  x: number;
  y: number;
};

export type Workflow = {
  connections: WorkflowConnection[];
  name: string;
  nodes: WorkflowNode[];
  trigger?: WorkflowTrigger | null;
};

export type Project = {
  name: string;
  workflows: Workflow[];
};

export type WorkspaceSnapshot = {
  activeItemLevel: ActiveItemLevel;
  activeProjectName: string;
  activeWorkflowName: string;
  projects: Project[];
};
