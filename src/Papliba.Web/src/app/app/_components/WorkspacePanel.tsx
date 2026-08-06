import {
  useRef,
  useState,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type {
  Workflow,
  WorkflowConnection,
  WorkflowNode,
  WorkflowNodeStepType,
  WorkflowNodeStatus,
} from "../types";

type ActiveItem = {
  connections?: WorkflowConnection[];
  name: string;
  nodes?: WorkflowNode[];
  workflows?: Workflow[];
};

type ActiveItemType = "project" | "workflow";

type WorkspacePanelProps = {
  activeItem: ActiveItem | undefined;
  activeItemType: ActiveItemType;
  canUndoWorkflowEdit: boolean;
  hasProject: boolean;
  isWorkflowRunning: boolean;
  onAddWorkflowNode: (position?: { x: number; y: number }) => void;
  onBackToProject: () => void;
  onConnectWorkflowNodes: (fromNodeId: string, toNodeId: string) => void;
  onCreateWorkflow: () => void;
  onDeleteWorkflowNode: (nodeId: string) => void;
  onMoveWorkflowNode: (nodeId: string, x: number, y: number) => void;
  onRunWorkflowDemo: () => void;
  onSelectWorkflow: (workflowName: string) => void;
  onStartWorkflowNodeMove: () => void;
  onUndoWorkflowEdit: () => void;
  onUpdateWorkflowNode: (
    nodeId: string,
    updateNode: { name?: string; stepType?: WorkflowNodeStepType },
  ) => void;
};

export function WorkspacePanel({
  activeItem,
  activeItemType,
  canUndoWorkflowEdit,
  hasProject,
  isWorkflowRunning,
  onAddWorkflowNode,
  onBackToProject,
  onConnectWorkflowNodes,
  onCreateWorkflow,
  onDeleteWorkflowNode,
  onMoveWorkflowNode,
  onRunWorkflowDemo,
  onSelectWorkflow,
  onStartWorkflowNodeMove,
  onUndoWorkflowEdit,
  onUpdateWorkflowNode,
}: WorkspacePanelProps) {
  return (
    <section className="workspace-panel">
      <WorkspaceHeader
        activeItem={activeItem}
        activeItemType={activeItemType}
        onBackToProject={onBackToProject}
      />

      <div className={hasProject ? "content-area" : "content-area empty"}>
        {!hasProject ? (
          <section className="empty-card setup-empty-card">
            <h1>Create project</h1>
            <p>Click the + button to create your first project.</p>
          </section>
        ) : activeItemType === "workflow" ? (
          <WorkflowCanvas
            canUndo={canUndoWorkflowEdit}
            connections={activeItem?.connections ?? []}
            isRunning={isWorkflowRunning}
            nodes={activeItem?.nodes ?? []}
            onAddNode={onAddWorkflowNode}
            onConnectNodes={onConnectWorkflowNodes}
            onDeleteNode={onDeleteWorkflowNode}
            onMoveNode={onMoveWorkflowNode}
            onRun={onRunWorkflowDemo}
            onStartNodeMove={onStartWorkflowNodeMove}
            onUndo={onUndoWorkflowEdit}
            onUpdateNode={onUpdateWorkflowNode}
          />
        ) : (
          <ProjectWorkflows
            onCreateWorkflow={onCreateWorkflow}
            onSelectWorkflow={onSelectWorkflow}
            workflows={activeItem?.workflows ?? []}
          />
        )}
      </div>
    </section>
  );
}

type WorkspaceHeaderProps = {
  activeItem: ActiveItem | undefined;
  activeItemType: ActiveItemType;
  onBackToProject: () => void;
};

function WorkspaceHeader({
  activeItem,
  activeItemType,
  onBackToProject,
}: WorkspaceHeaderProps) {
  return (
    <header className="workspace-header">
      {activeItem && (
        <div className="workspace-title-row">
          {activeItemType === "workflow" && (
            <button
              aria-label="Back to project"
              className="workspace-back-button"
              onClick={onBackToProject}
              type="button"
            >
              <BackIcon />
            </button>
          )}
          <WorkspaceItemIcon itemType={activeItemType} />
          <strong>{activeItem.name}</strong>
        </div>
      )}
    </header>
  );
}

function BackIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function WorkspaceItemIcon({ itemType }: { itemType: ActiveItemType }) {
  return (
    <svg
      aria-hidden="true"
      className="workspace-title-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      {itemType === "project" && (
        <>
          <rect height="14" rx="3" width="16" x="4" y="6" />
          <path d="M9 6V4h6v2" />
          <path d="M4 11h16" />
        </>
      )}
      {itemType === "workflow" && (
        <>
          <path d="M6 7h6" />
          <path d="M12 7c4 0 4 10 0 10H6" />
          <path d="M15 14l3 3-3 3" />
        </>
      )}
    </svg>
  );
}

type ProjectWorkflowsProps = {
  onCreateWorkflow: () => void;
  onSelectWorkflow: (workflowName: string) => void;
  workflows: Workflow[];
};

function ProjectWorkflows({
  onCreateWorkflow,
  onSelectWorkflow,
  workflows,
}: ProjectWorkflowsProps) {
  return (
    <section className="project-workflows-panel">
      <div className="project-workflows-card">
        <div className="project-workflows-header">
          <strong>Workflows</strong>
          <button
            aria-label="Create workflow"
            className="panel-icon-button"
            onClick={onCreateWorkflow}
            type="button"
          >
            <PlusIcon />
          </button>
        </div>

        {workflows.length === 0 ? (
          <div className="workflow-empty">No workflows yet.</div>
        ) : (
          <div className="workflow-list">
            {workflows.map((workflow) => (
              <button
                className="workflow-item"
                key={workflow.name}
                onClick={() => onSelectWorkflow(workflow.name)}
                type="button"
              >
                <WorkflowIcon />
                <strong>{workflow.name}</strong>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

type WorkflowCanvasProps = {
  canUndo: boolean;
  connections: WorkflowConnection[];
  isRunning: boolean;
  nodes: WorkflowNode[];
  onAddNode: (position?: { x: number; y: number }) => void;
  onConnectNodes: (fromNodeId: string, toNodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
  onRun: () => void;
  onStartNodeMove: () => void;
  onUndo: () => void;
  onUpdateNode: (
    nodeId: string,
    updateNode: { name?: string; stepType?: WorkflowNodeStepType },
  ) => void;
};

function WorkflowCanvas({
  canUndo,
  connections,
  isRunning,
  nodes,
  onAddNode,
  onConnectNodes,
  onDeleteNode,
  onMoveNode,
  onRun,
  onStartNodeMove,
  onUndo,
  onUpdateNode,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [connectingFromNodeId, setConnectingFromNodeId] = useState("");
  const [openNodeId, setOpenNodeId] = useState("");
  const openNode = nodes.find((node) => node.id === openNodeId);
  const firstNode = [...nodes].sort((first, second) => first.x - second.x)[0];

  function dropNode(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const kind = event.dataTransfer.getData("application/papliba-node");

    if (kind !== "rectangle") {
      return;
    }

    const canvasRect = canvasRef.current?.getBoundingClientRect();

    if (!canvasRect) {
      return;
    }

    onAddNode({
      x: event.clientX - canvasRect.left - getNodeSize().width / 2,
      y: event.clientY - canvasRect.top - getNodeSize().height / 2,
    });
  }

  function allowDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function startDragTool(event: DragEvent<HTMLButtonElement>) {
    event.dataTransfer.setData("application/papliba-node", "rectangle");
  }

  function startConnection(nodeId: string) {
    setConnectingFromNodeId(nodeId);
  }

  function finishConnection(nodeId: string) {
    if (!connectingFromNodeId) {
      return;
    }

    onConnectNodes(connectingFromNodeId, nodeId);
    setConnectingFromNodeId("");
  }

  return (
    <section className="workflow-canvas-panel">
      <div className="workflow-toolbar">
        <button
          className="workflow-run-button"
          disabled={isRunning || nodes.length === 0}
          onClick={onRun}
          type="button"
        >
          {isRunning ? "Running" : "Run"}
        </button>
        <button
          aria-label="Undo"
          className="workflow-tool-button"
          disabled={!canUndo}
          onClick={onUndo}
          type="button"
        >
          <UndoIcon />
        </button>
        <button
          aria-label="Add node"
          className="workflow-tool-button"
          draggable
          onClick={() => onAddNode()}
          onDragStart={startDragTool}
          type="button"
        >
          <RectangleToolIcon />
        </button>
      </div>

      <div
        className="workflow-canvas"
        onDragOver={allowDrop}
        onDrop={dropNode}
        ref={canvasRef}
      >
        <svg aria-hidden="true" className="workflow-connections">
          {firstNode && (
            <path
              className="workflow-trigger-connection"
              d={getTriggerConnectionPath(firstNode)}
            />
          )}
          {connections.map((connection) => {
            const path = getConnectionPath(connection, nodes);

            if (!path) {
              return null;
            }

            return (
              <path
                d={path}
                key={`${connection.fromNodeId}-${connection.toNodeId}`}
              />
            );
          })}
        </svg>

        <WorkflowTriggerBlock isRunning={isRunning} />

        {nodes.map((node) => (
          <WorkflowNodeView
            connectingFromNodeId={connectingFromNodeId}
            isOpen={openNodeId === node.id}
            key={node.id}
            node={node}
            onDelete={onDeleteNode}
            onFinishConnection={finishConnection}
            onMoveNode={onMoveNode}
            onOpen={setOpenNodeId}
            onStartMove={onStartNodeMove}
            onStartConnection={startConnection}
          />
        ))}

        {openNode && (
          <WorkflowNodePanel
            node={openNode}
            onClose={() => setOpenNodeId("")}
            onUpdate={onUpdateNode}
          />
        )}

        {nodes.length === 0 && <div className="workflow-canvas-empty" />}
      </div>
    </section>
  );
}

type WorkflowNodeViewProps = {
  connectingFromNodeId: string;
  isOpen: boolean;
  node: WorkflowNode;
  onDelete: (nodeId: string) => void;
  onFinishConnection: (nodeId: string) => void;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
  onOpen: (nodeId: string) => void;
  onStartMove: () => void;
  onStartConnection: (nodeId: string) => void;
};

function WorkflowTriggerBlock({ isRunning }: { isRunning: boolean }) {
  return (
    <article className="workflow-trigger-node" data-running={isRunning}>
      <span>Trigger</span>
      <strong>Manual trigger</strong>
    </article>
  );
}

function WorkflowNodeView({
  connectingFromNodeId,
  isOpen,
  node,
  onDelete,
  onFinishConnection,
  onMoveNode,
  onOpen,
  onStartMove,
  onStartConnection,
}: WorkflowNodeViewProps) {
  const size = getNodeSize();

  function dragNode(event: ReactPointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement;

    if (target.closest("button")) {
      return;
    }

    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const startNodeX = node.x;
    const startNodeY = node.y;
    let hasStartedMoving = false;

    function moveNode(pointerEvent: PointerEvent) {
      if (!hasStartedMoving) {
        onStartMove();
        hasStartedMoving = true;
      }

      onMoveNode(
        node.id,
        Math.max(12, startNodeX + pointerEvent.clientX - startX),
        Math.max(12, startNodeY + pointerEvent.clientY - startY),
      );
    }

    function stopMovingNode() {
      if (!hasStartedMoving) {
        onOpen(node.id);
      }

      window.removeEventListener("pointermove", moveNode);
      window.removeEventListener("pointerup", stopMovingNode);
    }

    window.addEventListener("pointermove", moveNode);
    window.addEventListener("pointerup", stopMovingNode);
  }

  return (
    <article
      className={`workflow-node workflow-node-${node.kind}`}
      data-open={isOpen}
      onPointerDown={dragNode}
      style={{
        height: size.height,
        left: node.x,
        top: node.y,
        width: size.width,
      }}
    >
      <button
        aria-label="Delete rectangle"
        className="workflow-delete-button"
        onClick={() => onDelete(node.id)}
        type="button"
      >
        <TrashIcon />
      </button>
      <button
        aria-label={`Connect to ${node.kind}`}
        className="workflow-port workflow-port-input"
        onClick={() => onFinishConnection(node.id)}
        type="button"
      />
      <div className="workflow-node-content">
        <span className="workflow-node-type">{getStepTypeLabel(node.stepType)}</span>
        <strong>{node.name}</strong>
        <span className="workflow-node-status" data-status={node.status}>
          {getStatusLabel(node.status)}
        </span>
      </div>
      <button
        aria-label={`Connect from ${node.kind}`}
        className="workflow-port workflow-port-output"
        data-active={connectingFromNodeId === node.id}
        onClick={() => onStartConnection(node.id)}
        type="button"
      />
    </article>
  );
}

function getStepTypeLabel(stepType: WorkflowNodeStepType) {
  return stepType === "python" ? "Python" : "AI";
}

function getStatusLabel(status: WorkflowNodeStatus) {
  if (status === "running") {
    return "Running";
  }

  if (status === "done") {
    return "Done";
  }

  if (status === "error") {
    return "Error";
  }

  return "Idle";
}

type WorkflowNodePanelProps = {
  node: WorkflowNode;
  onClose: () => void;
  onUpdate: (
    nodeId: string,
    updateNode: { name?: string; stepType?: WorkflowNodeStepType },
  ) => void;
};

function WorkflowNodePanel({ node, onClose, onUpdate }: WorkflowNodePanelProps) {
  return (
    <aside className="workflow-node-panel">
      <div className="workflow-node-panel-header">
        <strong>Step</strong>
        <button
          aria-label="Close rectangle"
          className="workflow-node-panel-close"
          onClick={onClose}
          type="button"
        >
          <CloseIcon />
        </button>
      </div>

      <label className="workflow-node-panel-field">
        <span>Name</span>
        <input
          onChange={(event) => {
            onUpdate(node.id, { name: event.target.value });
          }}
          value={node.name}
        />
      </label>

      <label className="workflow-node-panel-field">
        <span>Type</span>
        <select
          onChange={(event) => {
            onUpdate(node.id, {
              stepType: event.target.value as WorkflowNodeStepType,
            });
          }}
          value={node.stepType}
        >
          <option value="python">Python</option>
          <option value="ai">AI</option>
        </select>
      </label>

      {(node.input || node.output) && (
        <div className="workflow-node-panel-output">
          {node.input && (
            <div>
              <span>Input</span>
              <p>{node.input}</p>
            </div>
          )}
          {node.output && (
            <div>
              <span>Output</span>
              <p>{node.output}</p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

function getNodeSize() {
  return { height: 86, width: 150 };
}

function getTriggerConnectionPath(node: WorkflowNode) {
  const triggerX = 24;
  const triggerY = 26;
  const triggerWidth = 150;
  const triggerHeight = 70;
  const nodeSize = getNodeSize();
  const startX = triggerX + triggerWidth;
  const startY = triggerY + triggerHeight / 2;
  const endX = node.x;
  const endY = node.y + nodeSize.height / 2;
  const curve = Math.max(60, Math.abs(endX - startX) / 2);

  return `M ${startX} ${startY} C ${startX + curve} ${startY} ${
    endX - curve
  } ${endY} ${endX} ${endY}`;
}

function getConnectionPath(
  connection: WorkflowConnection,
  nodes: WorkflowNode[],
) {
  const fromNode = nodes.find((node) => node.id === connection.fromNodeId);
  const toNode = nodes.find((node) => node.id === connection.toNodeId);

  if (!fromNode || !toNode) {
    return "";
  }

  const fromSize = getNodeSize();
  const toSize = getNodeSize();
  const startX = fromNode.x + fromSize.width;
  const startY = fromNode.y + fromSize.height / 2;
  const endX = toNode.x;
  const endY = toNode.y + toSize.height / 2;
  const curve = Math.max(60, Math.abs(endX - startX) / 2);

  return `M ${startX} ${startY} C ${startX + curve} ${startY} ${
    endX - curve
  } ${endY} ${endX} ${endY}`;
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg
      aria-hidden="true"
      className="workflow-tool-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M9 7 5 11l4 4" />
      <path d="M5 11h9a5 5 0 0 1 0 10h-2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function RectangleToolIcon() {
  return (
    <svg
      aria-hidden="true"
      className="workflow-tool-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect height="10" rx="2" width="16" x="4" y="7" />
    </svg>
  );
}

function WorkflowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="workflow-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M6 7h6" />
      <path d="M12 7c4 0 4 10 0 10H6" />
      <path d="M15 14l3 3-3 3" />
    </svg>
  );
}
