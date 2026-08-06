export type ThemeMode = "system" | "light" | "dark";

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

export type Workflow = {
  connections: WorkflowConnection[];
  name: string;
  nodes: WorkflowNode[];
};

export type Project = {
  name: string;
  workflows: Workflow[];
};
