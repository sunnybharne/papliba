import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type {
  Workflow,
  WorkflowConnection,
  WorkflowNode,
  WorkflowNodeStepType,
  WorkflowNodeStatus,
  WorkflowTrigger,
  WorkspaceSaveStatus,
} from "../types";
import { defaultWorkflowTriggerPosition } from "../constants";

type ActiveItem = {
  connections?: WorkflowConnection[];
  name: string;
  nodes?: WorkflowNode[];
  trigger?: WorkflowTrigger | null;
  workflows?: Workflow[];
};

type ActiveItemType = "project" | "workflow";

type WorkspacePanelProps = {
  activeItem: ActiveItem | undefined;
  activeItemType: ActiveItemType;
  canUndoWorkflowEdit: boolean;
  hasProject: boolean;
  isWorkflowRunning: boolean;
  onAddWorkflowNode: (
    position?: { x: number; y: number },
    stepType?: WorkflowNodeStepType,
  ) => void;
  onAddWorkflowTrigger: () => void;
  onBackToProject: () => void;
  onConnectWorkflowNodes: (fromNodeId: string, toNodeId: string) => void;
  onCreateWorkflow: () => void;
  onOpenDeleteWorkflowDialog: (workflowName: string) => void;
  onDeleteWorkflowNode: (nodeId: string) => void;
  onDeleteWorkflowTrigger: () => void;
  onMoveWorkflowNode: (nodeId: string, x: number, y: number) => void;
  onMoveWorkflowTrigger: (x: number, y: number) => void;
  onOpenPythonScript: (nodeId: string) => Promise<void>;
  onRenameWorkflow: (workflowName: string, nextName: string) => string;
  onRunWorkflowDemo: () => void;
  onSelectWorkflow: (workflowName: string) => void;
  onStartWorkflowNodeMove: () => void;
  onUndoWorkflowEdit: () => void;
  onUpdateWorkflowNode: (
    nodeId: string,
    updateNode: { name?: string; stepType?: WorkflowNodeStepType },
  ) => void;
  workspaceSaveStatus: WorkspaceSaveStatus;
};

export function WorkspacePanel({
  activeItem,
  activeItemType,
  canUndoWorkflowEdit,
  hasProject,
  isWorkflowRunning,
  onAddWorkflowNode,
  onAddWorkflowTrigger,
  onBackToProject,
  onConnectWorkflowNodes,
  onCreateWorkflow,
  onOpenDeleteWorkflowDialog,
  onDeleteWorkflowNode,
  onDeleteWorkflowTrigger,
  onMoveWorkflowNode,
  onMoveWorkflowTrigger,
  onOpenPythonScript,
  onRenameWorkflow,
  onRunWorkflowDemo,
  onSelectWorkflow,
  onStartWorkflowNodeMove,
  onUndoWorkflowEdit,
  onUpdateWorkflowNode,
  workspaceSaveStatus,
}: WorkspacePanelProps) {
  return (
    <section className="workspace-panel">
      <WorkspaceHeader
        activeItem={activeItem}
        activeItemType={activeItemType}
        onBackToProject={onBackToProject}
        workspaceSaveStatus={workspaceSaveStatus}
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
            trigger={
              activeItem?.trigger === undefined
                ? defaultWorkflowTriggerPosition
                : activeItem.trigger
            }
            onAddNode={onAddWorkflowNode}
            onAddTrigger={onAddWorkflowTrigger}
            onConnectNodes={onConnectWorkflowNodes}
            onDeleteNode={onDeleteWorkflowNode}
            onDeleteTrigger={onDeleteWorkflowTrigger}
            onMoveNode={onMoveWorkflowNode}
            onMoveTrigger={onMoveWorkflowTrigger}
            onOpenPythonScript={onOpenPythonScript}
            onRun={onRunWorkflowDemo}
            onStartNodeMove={onStartWorkflowNodeMove}
            onUndo={onUndoWorkflowEdit}
            onUpdateNode={onUpdateWorkflowNode}
          />
        ) : (
          <ProjectWorkflows
            onCreateWorkflow={onCreateWorkflow}
            onOpenDeleteWorkflowDialog={onOpenDeleteWorkflowDialog}
            onRenameWorkflow={onRenameWorkflow}
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
  workspaceSaveStatus: WorkspaceSaveStatus;
};

function WorkspaceHeader({
  activeItem,
  activeItemType,
  onBackToProject,
  workspaceSaveStatus,
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
      <WorkspaceStatus status={workspaceSaveStatus} />
    </header>
  );
}

function WorkspaceStatus({ status }: { status: WorkspaceSaveStatus }) {
  const label = {
    error: "Not saved",
    loading: "Connecting",
    saved: "Saved",
    saving: "Saving",
  }[status];

  return (
    <span className="workspace-save-status" data-status={status} role="status">
      <span aria-hidden="true" className="workspace-save-status-dot" />
      {label}
    </span>
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
  onOpenDeleteWorkflowDialog: (workflowName: string) => void;
  onRenameWorkflow: (workflowName: string, nextName: string) => string;
  onSelectWorkflow: (workflowName: string) => void;
  workflows: Workflow[];
};

function ProjectWorkflows({
  onCreateWorkflow,
  onOpenDeleteWorkflowDialog,
  onRenameWorkflow,
  onSelectWorkflow,
  workflows,
}: ProjectWorkflowsProps) {
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [renameWorkflowName, setRenameWorkflowName] = useState("");
  const [renameDraft, setRenameDraft] = useState("");
  const [renameError, setRenameError] = useState("");

  useEffect(() => {
    if (!renameWorkflowName) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [renameWorkflowName]);

  function startRename(workflowName: string) {
    setRenameWorkflowName(workflowName);
    setRenameDraft(workflowName);
    setRenameError("");
  }

  function cancelRename() {
    setRenameWorkflowName("");
    setRenameDraft("");
    setRenameError("");
  }

  function saveRename() {
    if (!renameWorkflowName) {
      return;
    }

    const error = onRenameWorkflow(renameWorkflowName, renameDraft.trim());

    if (error) {
      setRenameError(error);
      renameInputRef.current?.focus();
      return;
    }

    cancelRename();
  }

  function saveRenameOnBlur() {
    if (!renameWorkflowName) {
      return;
    }

    const error = onRenameWorkflow(renameWorkflowName, renameDraft.trim());

    if (error) {
      cancelRename();
      return;
    }

    cancelRename();
  }

  function handleRenameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveRename();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelRename();
    }
  }

  return (
    <section className="project-workflows-panel">
      <div className="project-workflows-header">
        <div>
          <h1>Workflows</h1>
          <p>Build and manage automations for this project.</p>
        </div>
        <button
          className="workflow-create-button"
          onClick={onCreateWorkflow}
          type="button"
        >
          <PlusIcon />
          New workflow
        </button>
      </div>

      {workflows.length === 0 ? (
        <div className="workflow-empty">
          <WorkflowIcon />
          <strong>No workflows yet</strong>
          <p>Create a workflow to start building your automation.</p>
        </div>
      ) : (
        <div className="workflow-list">
          {workflows.map((workflow) => (
            <div className="workflow-item-row" key={workflow.name}>
              {renameWorkflowName === workflow.name ? (
                <div className="workflow-item workflow-item-renaming">
                  <WorkflowIcon />
                  <input
                    aria-invalid={renameError.length > 0}
                    aria-label="Rename workflow"
                    className="workflow-rename-input"
                    onBlur={saveRenameOnBlur}
                    onChange={(event) => {
                      setRenameDraft(event.target.value.toLowerCase());
                      setRenameError("");
                    }}
                    onKeyDown={handleRenameKeyDown}
                    ref={renameInputRef}
                    title={renameError}
                    value={renameDraft}
                  />
                </div>
              ) : (
                <>
                  <button
                    className="workflow-item"
                    onClick={() => onSelectWorkflow(workflow.name)}
                    type="button"
                  >
                    <WorkflowIcon />
                    <strong>{workflow.name}</strong>
                  </button>
                  <div className="workflow-item-actions">
                    <button
                      aria-label={`Rename ${workflow.name}`}
                      className="workflow-item-action"
                      onClick={() => startRename(workflow.name)}
                      type="button"
                    >
                      <RenameIcon />
                    </button>
                    <button
                      aria-label={`Delete ${workflow.name}`}
                      className="workflow-item-action workflow-item-delete"
                      onClick={() =>
                        onOpenDeleteWorkflowDialog(workflow.name)
                      }
                      type="button"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

type WorkflowCanvasProps = {
  canUndo: boolean;
  connections: WorkflowConnection[];
  isRunning: boolean;
  nodes: WorkflowNode[];
  trigger: WorkflowTrigger | null;
  onAddNode: (
    position?: { x: number; y: number },
    stepType?: WorkflowNodeStepType,
  ) => void;
  onAddTrigger: () => void;
  onConnectNodes: (fromNodeId: string, toNodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteTrigger: () => void;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
  onMoveTrigger: (x: number, y: number) => void;
  onOpenPythonScript: (nodeId: string) => Promise<void>;
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
  trigger,
  onAddNode,
  onAddTrigger,
  onConnectNodes,
  onDeleteNode,
  onDeleteTrigger,
  onMoveNode,
  onMoveTrigger,
  onOpenPythonScript,
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

    const tool = event.dataTransfer.getData("application/papliba-node");

    if (tool !== "rectangle" && tool !== "python") {
      return;
    }

    const canvasRect = canvasRef.current?.getBoundingClientRect();

    if (!canvasRect) {
      return;
    }

    const stepType = tool === "python" ? "python" : undefined;
    const nodeSize = getNodeSize(stepType);

    onAddNode(
      {
        x: event.clientX - canvasRect.left - nodeSize.width / 2,
        y: event.clientY - canvasRect.top - nodeSize.height / 2,
      },
      stepType,
    );
  }

  function allowDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function startDragTool(
    event: DragEvent<HTMLButtonElement>,
    stepType?: WorkflowNodeStepType,
  ) {
    event.dataTransfer.setData(
      "application/papliba-node",
      stepType === "python" ? "python" : "rectangle",
    );
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

  function clearNodeSelection(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;

    if (target.closest(".workflow-node, .workflow-node-panel")) {
      return;
    }

    setOpenNodeId("");
  }

  return (
    <section className="workflow-canvas-panel">
      <div
        className="workflow-toolbar"
        onPointerDown={() => setOpenNodeId("")}
      >
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
          data-tooltip="Undo"
          disabled={!canUndo}
          onClick={onUndo}
          type="button"
        >
          <UndoIcon />
        </button>
        <button
          aria-label="Add manual trigger"
          className="workflow-tool-button"
          data-tooltip="Manual trigger"
          disabled={trigger !== null}
          onClick={onAddTrigger}
          type="button"
        >
          <TriggerToolIcon />
        </button>
        <button
          aria-label="Add node"
          className="workflow-tool-button"
          data-tooltip="Add node"
          draggable
          onClick={() => onAddNode()}
          onDragStart={startDragTool}
          type="button"
        >
          <RectangleToolIcon />
        </button>
        <button
          aria-label="Add Python script"
          className="workflow-tool-button workflow-python-tool-button"
          data-tooltip="Python script"
          draggable
          onClick={() => onAddNode(undefined, "python")}
          onDragStart={(event) => startDragTool(event, "python")}
          type="button"
        >
          <PythonToolIcon />
        </button>
      </div>

      <div
        className="workflow-canvas"
        onDragOver={allowDrop}
        onDrop={dropNode}
        onPointerDown={clearNodeSelection}
        ref={canvasRef}
      >
        <svg aria-hidden="true" className="workflow-connections">
          {firstNode && trigger && (
            <path
              className="workflow-trigger-connection"
              d={getTriggerConnectionPath(firstNode, trigger)}
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

        {trigger && (
          <WorkflowTriggerBlock
            isRunning={isRunning}
            onDelete={onDeleteTrigger}
            onMove={onMoveTrigger}
            onStartMove={onStartNodeMove}
            trigger={trigger}
          />
        )}

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
            onOpenPythonScript={onOpenPythonScript}
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
  onOpenPythonScript: (nodeId: string) => Promise<void>;
  onStartMove: () => void;
  onStartConnection: (nodeId: string) => void;
};

type WorkflowTriggerBlockProps = {
  isRunning: boolean;
  onDelete: () => void;
  onMove: (x: number, y: number) => void;
  onStartMove: () => void;
  trigger: WorkflowTrigger;
};

function WorkflowTriggerBlock({
  isRunning,
  onDelete,
  onMove,
  onStartMove,
  trigger,
}: WorkflowTriggerBlockProps) {
  function dragTrigger(event: ReactPointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement;

    if (target.closest("button")) {
      return;
    }

    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const startTriggerX = trigger.x;
    const startTriggerY = trigger.y;
    let hasStartedMoving = false;

    function moveTrigger(pointerEvent: PointerEvent) {
      if (!hasStartedMoving) {
        onStartMove();
        hasStartedMoving = true;
      }

      onMove(
        Math.max(12, startTriggerX + pointerEvent.clientX - startX),
        Math.max(12, startTriggerY + pointerEvent.clientY - startY),
      );
    }

    function stopMovingTrigger() {
      window.removeEventListener("pointermove", moveTrigger);
      window.removeEventListener("pointerup", stopMovingTrigger);
    }

    window.addEventListener("pointermove", moveTrigger);
    window.addEventListener("pointerup", stopMovingTrigger);
  }

  return (
    <article
      aria-label="Manual trigger"
      className="workflow-trigger-node"
      data-running={isRunning}
      onPointerDown={dragTrigger}
      style={{ left: trigger.x, top: trigger.y }}
    >
      <button
        aria-label="Delete manual trigger"
        className="workflow-delete-button"
        onClick={onDelete}
        type="button"
      >
        <TrashIcon />
      </button>
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
  onOpenPythonScript,
  onStartMove,
  onStartConnection,
}: WorkflowNodeViewProps) {
  const size = getNodeSize(node.stepType);
  const [isOpeningScript, setIsOpeningScript] = useState(false);
  const [openScriptError, setOpenScriptError] = useState("");

  async function openScript() {
    setIsOpeningScript(true);
    setOpenScriptError("");

    try {
      await onOpenPythonScript(node.id);
    } catch (error) {
      setOpenScriptError(
        error instanceof Error ? error.message : "Could not open the script.",
      );
    } finally {
      setIsOpeningScript(false);
    }
  }

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
        aria-label={`Delete ${node.name}`}
        className="workflow-delete-button"
        onClick={() => onDelete(node.id)}
        type="button"
      >
        <TrashIcon />
      </button>
      <button
        aria-label={`Connect to ${node.name}`}
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
        {node.stepType === "python" && (
          <button
            className="workflow-open-code-button"
            disabled={isOpeningScript}
            onClick={openScript}
            title={openScriptError || "Open this script in Visual Studio Code"}
            type="button"
          >
            <CodeEditorIcon />
            {isOpeningScript ? "Opening…" : "Open in VS Code"}
          </button>
        )}
      </div>
      <button
        aria-label={`Connect from ${node.name}`}
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
        <strong>{node.stepType === "python" ? "Python script" : "AI step"}</strong>
        <button
          aria-label={`Close ${node.name}`}
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

function getNodeSize(stepType?: WorkflowNodeStepType) {
  return { height: stepType === "python" ? 118 : 86, width: 150 };
}

function getTriggerConnectionPath(
  node: WorkflowNode,
  trigger: WorkflowTrigger,
) {
  const triggerWidth = 150;
  const triggerHeight = 70;
  const nodeSize = getNodeSize(node.stepType);
  const startX = trigger.x + triggerWidth;
  const startY = trigger.y + triggerHeight / 2;
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

  const fromSize = getNodeSize(fromNode.stepType);
  const toSize = getNodeSize(toNode.stepType);
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

function RenameIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="m4 16-1 5 5-1L19 9l-4-4Z" />
      <path d="m13 7 4 4" />
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

function PythonToolIcon() {
  return (
    <svg
      aria-hidden="true"
      className="workflow-tool-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M9 6H7l-4 6 4 6h2" />
      <path d="M15 6h2l4 6-4 6h-2" />
      <path d="m13 5-2 14" />
    </svg>
  );
}

function CodeEditorIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="m9 7-5 5 5 5" />
      <path d="m15 7 5 5-5 5" />
    </svg>
  );
}

function TriggerToolIcon() {
  return (
    <svg
      aria-hidden="true"
      className="workflow-tool-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="m13 2-8 12h7l-1 8 8-12h-7Z" />
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
