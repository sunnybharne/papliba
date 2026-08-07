import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  getCodexAuthStatus,
  startCodexLogin,
  type CodexAuthState,
  type PythonOpenTarget,
} from "@/lib/papliba-api";

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
type CreatableWorkflowNodeStepType = "codex" | "claude-code";

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
  onAddWorkflowTrigger: (position?: { x: number; y: number }) => void;
  onApplyPythonScriptCode: (nodeId: string, code: string) => Promise<void>;
  onAskPythonScriptCode: (nodeId: string, message: string) => Promise<string>;
  onBackToProject: () => void;
  onConnectWorkflowNodes: (fromNodeId: string, toNodeId: string) => void;
  onCreateWorkflow: () => void;
  onOpenDeleteWorkflowDialog: (workflowName: string) => void;
  onDeleteWorkflowNodes: (nodeIds: string[]) => Promise<boolean>;
  onDeleteWorkflowTrigger: () => void;
  onMoveWorkflowNode: (nodeId: string, x: number, y: number) => void;
  onMoveWorkflowTrigger: (x: number, y: number) => void;
  onLoadPythonScript: (nodeId: string) => Promise<string>;
  onOpenPythonScript: (
    nodeId: string,
    target: PythonOpenTarget,
  ) => Promise<void>;
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
  onApplyPythonScriptCode,
  onAskPythonScriptCode,
  onBackToProject,
  onConnectWorkflowNodes,
  onCreateWorkflow,
  onOpenDeleteWorkflowDialog,
  onDeleteWorkflowNodes,
  onDeleteWorkflowTrigger,
  onMoveWorkflowNode,
  onMoveWorkflowTrigger,
  onLoadPythonScript,
  onOpenPythonScript,
  onRenameWorkflow,
  onRunWorkflowDemo,
  onSelectWorkflow,
  onStartWorkflowNodeMove,
  onUndoWorkflowEdit,
  onUpdateWorkflowNode,
  workspaceSaveStatus,
}: WorkspacePanelProps) {
  const [defaultOpenTarget, setDefaultOpenTarget] =
    useState<PythonOpenTarget>("vscode");

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
            defaultOpenTarget={defaultOpenTarget}
            isRunning={isWorkflowRunning}
            nodes={activeItem?.nodes ?? []}
            trigger={
              activeItem?.trigger === undefined
                ? defaultWorkflowTriggerPosition
                : activeItem.trigger
            }
            onAddNode={onAddWorkflowNode}
            onAddTrigger={onAddWorkflowTrigger}
            onApplyPythonScriptCode={onApplyPythonScriptCode}
            onAskPythonScriptCode={onAskPythonScriptCode}
            onConnectNodes={onConnectWorkflowNodes}
            onDeleteNodes={onDeleteWorkflowNodes}
            onDeleteTrigger={onDeleteWorkflowTrigger}
            onLoadPythonScript={onLoadPythonScript}
            onMoveNode={onMoveWorkflowNode}
            onMoveTrigger={onMoveWorkflowTrigger}
            onOpenPythonScript={onOpenPythonScript}
            onRun={onRunWorkflowDemo}
            onSelectDefaultOpenTarget={setDefaultOpenTarget}
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

  function handleRenameKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
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
  defaultOpenTarget: PythonOpenTarget;
  isRunning: boolean;
  nodes: WorkflowNode[];
  trigger: WorkflowTrigger | null;
  onAddNode: (
    position?: { x: number; y: number },
    stepType?: WorkflowNodeStepType,
  ) => void;
  onAddTrigger: (position?: { x: number; y: number }) => void;
  onApplyPythonScriptCode: (nodeId: string, code: string) => Promise<void>;
  onAskPythonScriptCode: (nodeId: string, message: string) => Promise<string>;
  onConnectNodes: (fromNodeId: string, toNodeId: string) => void;
  onDeleteNodes: (nodeIds: string[]) => Promise<boolean>;
  onDeleteTrigger: () => void;
  onLoadPythonScript: (nodeId: string) => Promise<string>;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
  onMoveTrigger: (x: number, y: number) => void;
  onOpenPythonScript: (
    nodeId: string,
    target: PythonOpenTarget,
  ) => Promise<void>;
  onRun: () => void;
  onSelectDefaultOpenTarget: (target: PythonOpenTarget) => void;
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
  defaultOpenTarget,
  isRunning,
  nodes,
  trigger,
  onAddNode,
  onAddTrigger,
  onApplyPythonScriptCode,
  onAskPythonScriptCode,
  onConnectNodes,
  onDeleteNodes,
  onDeleteTrigger,
  onLoadPythonScript,
  onMoveNode,
  onMoveTrigger,
  onOpenPythonScript,
  onRun,
  onSelectDefaultOpenTarget,
  onStartNodeMove,
  onUndo,
  onUpdateNode,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [connectingFromNodeId, setConnectingFromNodeId] = useState("");
  const [connectionPointer, setConnectionPointer] = useState<{
    x: number;
    y: number;
  }>();
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectionRectangle, setSelectionRectangle] = useState<{
    height: number;
    width: number;
    x: number;
    y: number;
  }>();
  const [openNodeId, setOpenNodeId] = useState("");
  const openNode = nodes.find((node) => node.id === openNodeId);
  const hasPythonNode = nodes.some((node) => node.stepType === "python");
  const firstNode = [...nodes].sort((first, second) => first.x - second.x)[0];

  useEffect(() => {
    function deleteSelectedNodes(event: KeyboardEvent) {
      const existingNodeIds = new Set(nodes.map((node) => node.id));
      const selectedExistingNodeIds = selectedNodeIds.filter((nodeId) =>
        existingNodeIds.has(nodeId),
      );

      if (
        (event.key !== "Delete" && event.key !== "Backspace") ||
        selectedExistingNodeIds.length === 0 ||
        isWorkflowTextInput(event.target)
      ) {
        return;
      }

      event.preventDefault();
      const nodeIdsToDelete = selectedExistingNodeIds;

      void onDeleteNodes(nodeIdsToDelete).then((didDelete) => {
        if (didDelete) {
          setSelectedNodeIds([]);
          setOpenNodeId((nodeId) =>
            nodeIdsToDelete.includes(nodeId) ? "" : nodeId,
          );
        }
      });
    }

    window.addEventListener("keydown", deleteSelectedNodes);
    return () => window.removeEventListener("keydown", deleteSelectedNodes);
  }, [nodes, onDeleteNodes, selectedNodeIds]);

  function dropNode(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const tool = event.dataTransfer.getData("application/papliba-node");

    if (
      tool !== "codex" &&
      tool !== "claude-code" &&
      tool !== "manual-trigger"
    ) {
      return;
    }

    const canvasRect = canvasRef.current?.getBoundingClientRect();

    if (!canvasRect) {
      return;
    }

    if (tool === "manual-trigger") {
      onAddTrigger({
        x: event.clientX - canvasRect.left - 75,
        y: event.clientY - canvasRect.top - 35,
      });
      return;
    }

    const stepType = tool as CreatableWorkflowNodeStepType;
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
    stepType: CreatableWorkflowNodeStepType,
  ) {
    event.dataTransfer.setData("application/papliba-node", stepType);
  }

  function startDragTrigger(event: DragEvent<HTMLButtonElement>) {
    event.dataTransfer.setData(
      "application/papliba-node",
      "manual-trigger",
    );
  }

  function startConnection(
    nodeId: string,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const sourceNode = nodes.find((node) => node.id === nodeId);

    if (!canvasRect || !sourceNode) {
      return;
    }

    const sourceSize = getNodeSize(sourceNode.stepType);
    const canvasLeft = canvasRect.left;
    const canvasTop = canvasRect.top;

    setConnectingFromNodeId(nodeId);
    setConnectionPointer({
      x: sourceNode.x + sourceSize.width,
      y: sourceNode.y + sourceSize.height / 2,
    });

    function moveConnection(pointerEvent: PointerEvent) {
      setConnectionPointer({
        x: pointerEvent.clientX - canvasLeft,
        y: pointerEvent.clientY - canvasTop,
      });
    }

    function stopConnection(pointerEvent: PointerEvent) {
      const dropTarget = document
        .elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)
        ?.closest<HTMLElement>(".workflow-port-input");
      const targetNodeId = dropTarget?.dataset.nodeId;

      if (targetNodeId && targetNodeId !== nodeId) {
        onConnectNodes(nodeId, targetNodeId);
      }

      finishConnectionDrag();
    }

    function cancelConnection(event: KeyboardEvent) {
      if (event.key === "Escape") {
        finishConnectionDrag();
      }
    }

    function finishConnectionDrag() {
      window.removeEventListener("pointermove", moveConnection);
      window.removeEventListener("pointerup", stopConnection);
      window.removeEventListener("pointercancel", finishConnectionDrag);
      window.removeEventListener("keydown", cancelConnection);
      setConnectingFromNodeId("");
      setConnectionPointer(undefined);
    }

    window.addEventListener("pointermove", moveConnection);
    window.addEventListener("pointerup", stopConnection);
    window.addEventListener("pointercancel", finishConnectionDrag);
    window.addEventListener("keydown", cancelConnection);
  }

  function startSelectionRectangle(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;

    if (
      event.button !== 0 ||
      target.closest(
        ".workflow-node, .workflow-node-panel, .workflow-trigger-node, button",
      )
    ) {
      return;
    }

    setOpenNodeId("");
    const canvasRect = canvasRef.current?.getBoundingClientRect();

    if (!canvasRect) {
      return;
    }

    const startX = event.clientX - canvasRect.left;
    const startY = event.clientY - canvasRect.top;
    const canvasLeft = canvasRect.left;
    const canvasTop = canvasRect.top;
    const existingNodeIds = new Set(nodes.map((node) => node.id));
    const initialNodeIds = event.shiftKey
      ? selectedNodeIds.filter((nodeId) => existingNodeIds.has(nodeId))
      : [];
    let isSelecting = false;

    function updateSelection(pointerEvent: PointerEvent) {
      const currentX = pointerEvent.clientX - canvasLeft;
      const currentY = pointerEvent.clientY - canvasTop;
      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      if (!isSelecting && width < 3 && height < 3) {
        return;
      }

      isSelecting = true;
      setSelectionRectangle({ height, width, x, y });

      const intersectingNodeIds = nodes
        .filter((node) => {
          const nodeSize = getNodeSize(node.stepType);

          return (
            node.x < x + width &&
            node.x + nodeSize.width > x &&
            node.y < y + height &&
            node.y + nodeSize.height > y
          );
        })
        .map((node) => node.id);

      setSelectedNodeIds([
        ...new Set([...initialNodeIds, ...intersectingNodeIds]),
      ]);
    }

    function finishSelection() {
      window.removeEventListener("pointermove", updateSelection);
      window.removeEventListener("pointerup", finishSelection);
      window.removeEventListener("pointercancel", finishSelection);

      if (!isSelecting && !event.shiftKey) {
        setSelectedNodeIds([]);
      }

      setSelectionRectangle(undefined);
    }

    window.addEventListener("pointermove", updateSelection);
    window.addEventListener("pointerup", finishSelection);
    window.addEventListener("pointercancel", finishSelection);
  }

  return (
    <section className="workflow-canvas-panel">
      <div
        className="workflow-toolbar"
        onPointerDown={() => setOpenNodeId("")}
      >
        <button
          className="workflow-run-button"
          disabled={isRunning || nodes.length === 0 || trigger === null}
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
          draggable={trigger === null}
          onClick={() => onAddTrigger()}
          onDragStart={startDragTrigger}
          type="button"
        >
          <TriggerToolIcon />
        </button>
        <button
          aria-label="Add Codex node"
          className="workflow-tool-button workflow-codex-tool-button"
          data-tooltip="Codex node"
          draggable
          onClick={() => onAddNode(undefined, "codex")}
          onDragStart={(event) => startDragTool(event, "codex")}
          type="button"
        >
          <CodexToolIcon />
        </button>
        <button
          aria-label="Add Claude Code node"
          className="workflow-tool-button workflow-claude-tool-button"
          data-tooltip="Claude Code node"
          draggable
          onClick={() => onAddNode(undefined, "claude-code")}
          onDragStart={(event) => startDragTool(event, "claude-code")}
          type="button"
        >
          <ClaudeCodeToolIcon />
        </button>
      </div>

      <div
        className={`workflow-canvas-layout${
          hasPythonNode ? "" : " workflow-canvas-layout-full"
        }`}
      >
        <div
          className="workflow-canvas"
          data-connecting={connectingFromNodeId.length > 0}
          onDragOver={allowDrop}
          onDrop={dropNode}
          onPointerDown={startSelectionRectangle}
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
            {connectingFromNodeId &&
              connectionPointer &&
              nodes.find((node) => node.id === connectingFromNodeId) && (
                <>
                  <path
                    className="workflow-draft-connection"
                    d={getDraftConnectionPath(
                      nodes.find((node) => node.id === connectingFromNodeId)!,
                      connectionPointer,
                    )}
                  />
                  <circle
                    className="workflow-draft-connection-end"
                    cx={connectionPointer.x}
                    cy={connectionPointer.y}
                    r="4"
                  />
                </>
              )}
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

          {trigger === null && (
            <div className="workflow-trigger-empty" role="status">
              <TriggerToolIcon />
              <strong>No trigger selected</strong>
              <span>Drag a trigger from the toolbar to get started.</span>
            </div>
          )}

          {selectionRectangle && (
            <div
              aria-hidden="true"
              className="workflow-selection-rectangle"
              style={selectionRectangle}
            />
          )}

          {nodes.map((node) => (
            <WorkflowNodeView
              connectingFromNodeId={connectingFromNodeId}
              defaultOpenTarget={defaultOpenTarget}
              isOpen={openNodeId === node.id}
              isSelected={selectedNodeIds.includes(node.id)}
              key={node.id}
              node={node}
              onDelete={(nodeId) => void onDeleteNodes([nodeId])}
              onMoveNode={onMoveNode}
              onOpen={setOpenNodeId}
              onOpenPythonScript={onOpenPythonScript}
              onSelectDefaultOpenTarget={onSelectDefaultOpenTarget}
              onStartMove={onStartNodeMove}
              onStartConnection={startConnection}
            />
          ))}

          {openNode && (
            <WorkflowNodePanel
              key={`${openNode.id}-${openNode.stepType}`}
              node={openNode}
              onClose={() => setOpenNodeId("")}
              onLoadPythonScript={onLoadPythonScript}
              onUpdate={onUpdateNode}
            />
          )}

        </div>

        {hasPythonNode && (
          <PythonScriptChatPanel
            node={openNode?.stepType === "python" ? openNode : undefined}
            onApply={onApplyPythonScriptCode}
            onAsk={onAskPythonScriptCode}
          />
        )}
      </div>
    </section>
  );
}

type WorkflowNodeViewProps = {
  connectingFromNodeId: string;
  defaultOpenTarget: PythonOpenTarget;
  isOpen: boolean;
  isSelected: boolean;
  node: WorkflowNode;
  onDelete: (nodeId: string) => void;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
  onOpen: (nodeId: string) => void;
  onOpenPythonScript: (
    nodeId: string,
    target: PythonOpenTarget,
  ) => Promise<void>;
  onSelectDefaultOpenTarget: (target: PythonOpenTarget) => void;
  onStartMove: () => void;
  onStartConnection: (
    nodeId: string,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => void;
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
  defaultOpenTarget,
  isOpen,
  isSelected,
  node,
  onDelete,
  onMoveNode,
  onOpen,
  onOpenPythonScript,
  onSelectDefaultOpenTarget,
  onStartMove,
  onStartConnection,
}: WorkflowNodeViewProps) {
  const size = getNodeSize(node.stepType);
  const defaultOpenOption =
    pythonOpenTargets.find((option) => option.target === defaultOpenTarget) ??
    pythonOpenTargets[0];
  const openMenuRef = useRef<HTMLDivElement>(null);
  const [isOpenMenuVisible, setIsOpenMenuVisible] = useState(false);
  const [openingTarget, setOpeningTarget] = useState<PythonOpenTarget>();
  const [openScriptError, setOpenScriptError] = useState("");

  useEffect(() => {
    if (!isOpenMenuVisible) {
      return;
    }

    function closeOpenMenu(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !openMenuRef.current?.contains(event.target)
      ) {
        setIsOpenMenuVisible(false);
      }
    }

    window.addEventListener("pointerdown", closeOpenMenu);
    return () => window.removeEventListener("pointerdown", closeOpenMenu);
  }, [isOpenMenuVisible]);

  async function openScript(target: PythonOpenTarget) {
    setOpeningTarget(target);
    setOpenScriptError("");
    setIsOpenMenuVisible(false);

    try {
      await onOpenPythonScript(node.id, target);
    } catch (error) {
      setOpenScriptError(
        error instanceof Error ? error.message : "Could not open the script.",
      );
    } finally {
      setOpeningTarget(undefined);
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
      window.removeEventListener("pointermove", moveNode);
      window.removeEventListener("pointerup", stopMovingNode);
    }

    window.addEventListener("pointermove", moveNode);
    window.addEventListener("pointerup", stopMovingNode);
  }

  return (
    <article
      className={`workflow-node workflow-node-${node.kind}`}
      data-menu-open={isOpenMenuVisible}
      data-open={isOpen}
      data-selected={isSelected}
      onPointerDown={dragNode}
      style={{
        height: size.height,
        left: node.x,
        top: node.y,
        width: size.width,
      }}
    >
      <button
        aria-label={`Open details for ${node.name}`}
        className="workflow-node-details-button"
        onClick={() => onOpen(node.id)}
        type="button"
      >
        <MoreIcon />
      </button>
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
        data-available={
          connectingFromNodeId.length > 0 && connectingFromNodeId !== node.id
        }
        data-node-id={node.id}
        type="button"
      />
      <div className="workflow-node-content">
        <span className="workflow-node-type">{getStepTypeLabel(node.stepType)}</span>
        <strong>{node.name}</strong>
        <span className="workflow-node-status" data-status={node.status}>
          {getStatusLabel(node.status)}
        </span>
        {node.stepType === "python" && (
          <div className="workflow-open-menu" ref={openMenuRef}>
            <div className="workflow-open-split-button">
              <button
                className="workflow-open-code-button"
                disabled={openingTarget !== undefined}
                onClick={() => void openScript(defaultOpenTarget)}
                title={
                  openScriptError || `Open this script in ${defaultOpenOption.label}`
                }
                type="button"
              >
                <ApplicationIcon target={defaultOpenTarget} />
                {openingTarget ? "Opening…" : "Open in"}
              </button>
              <button
                aria-expanded={isOpenMenuVisible}
                aria-haspopup="menu"
                aria-label="Choose another application"
                className="workflow-open-menu-toggle"
                disabled={openingTarget !== undefined}
                onClick={() => setIsOpenMenuVisible((isVisible) => !isVisible)}
                title="Choose another application"
                type="button"
              >
                <ChevronDownIcon />
              </button>
            </div>

            {isOpenMenuVisible && (
              <div className="workflow-open-menu-popover" role="menu">
                {pythonOpenTargets.map((option) => (
                  <button
                    aria-checked={option.target === defaultOpenTarget}
                    key={option.target}
                    onClick={() => {
                      onSelectDefaultOpenTarget(option.target);
                      void openScript(option.target);
                    }}
                    role="menuitemradio"
                    type="button"
                  >
                    <ApplicationIcon target={option.target} />
                    <span>{option.label}</span>
                    {option.target === defaultOpenTarget && <CheckIcon />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <button
        aria-label={`Connect from ${node.name}`}
        className="workflow-port workflow-port-output"
        data-active={connectingFromNodeId === node.id}
        onPointerDown={(event) => onStartConnection(node.id, event)}
        type="button"
      />
    </article>
  );
}

const pythonOpenTargets: Array<{
  label: string;
  target: PythonOpenTarget;
}> = [
  { label: "VS Code", target: "vscode" },
  { label: "Cursor", target: "cursor" },
  { label: "Finder", target: "finder" },
  { label: "Terminal", target: "terminal" },
  { label: "Ghostty", target: "ghostty" },
  { label: "Xcode", target: "xcode" },
];

function getStepTypeLabel(stepType: WorkflowNodeStepType) {
  if (stepType === "codex") {
    return "Codex";
  }

  if (stepType === "claude-code") {
    return "Claude Code";
  }

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
  onLoadPythonScript: (nodeId: string) => Promise<string>;
  onUpdate: (
    nodeId: string,
    updateNode: { name?: string; stepType?: WorkflowNodeStepType },
  ) => void;
};

function WorkflowNodePanel({
  node,
  onClose,
  onLoadPythonScript,
  onUpdate,
}: WorkflowNodePanelProps) {
  const loadPythonScriptRef = useRef(onLoadPythonScript);
  const [pythonCode, setPythonCode] = useState("");
  const [pythonCodeError, setPythonCodeError] = useState("");
  const [isLoadingPythonCode, setIsLoadingPythonCode] = useState(
    node.stepType === "python",
  );

  useEffect(() => {
    loadPythonScriptRef.current = onLoadPythonScript;
  }, [onLoadPythonScript]);

  useEffect(() => {
    let isActive = true;

    if (node.stepType !== "python") {
      return;
    }

    void loadPythonScriptRef
      .current(node.id)
      .then((code) => {
        if (isActive) {
          setPythonCode(code);
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setPythonCodeError(
            error instanceof Error
              ? error.message
              : "Could not load the Python script.",
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingPythonCode(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [node.id, node.stepType]);

  return (
    <aside className="workflow-node-panel">
      <div className="workflow-node-panel-header">
        <strong>{getStepTypeLabel(node.stepType)}</strong>
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
          {(node.stepType === "python" || node.stepType === "ai") && (
            <option value={node.stepType}>
              {getStepTypeLabel(node.stepType)} (legacy)
            </option>
          )}
          <option value="codex">Codex</option>
          <option value="claude-code">Claude Code</option>
        </select>
      </label>

      {node.stepType === "python" && (
        <div className="workflow-node-panel-code">
          <span>File content</span>
          {isLoadingPythonCode ? (
            <p>Loading script…</p>
          ) : pythonCodeError ? (
            <p data-error="true">{pythonCodeError}</p>
          ) : (
            <pre>{pythonCode}</pre>
          )}
        </div>
      )}

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

type ChatMessage = {
  code?: string;
  id: string;
  isApplied?: boolean;
  role: "user" | "assistant" | "error";
  text: string;
};

type PythonScriptChatPanelProps = {
  node: WorkflowNode | undefined;
  onApply: (nodeId: string, code: string) => Promise<void>;
  onAsk: (nodeId: string, message: string) => Promise<string>;
};

function PythonScriptChatPanel({
  node,
  onApply,
  onAsk,
}: PythonScriptChatPanelProps) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [applyingMessageId, setApplyingMessageId] = useState("");
  const [codexAuth, setCodexAuth] = useState<CodexAuthState>();
  const [isStartingLogin, setIsStartingLogin] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    void getCodexAuthStatus(controller.signal)
      .then(setCodexAuth)
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setCodexAuth({
          authenticated: false,
          available: false,
          error:
            error instanceof Error
              ? error.message
              : "Could not check the Codex sign-in status.",
          method: null,
        });
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isStartingLogin) {
      return;
    }

    let isActive = true;
    let attempts = 0;
    const pollAuthStatus = window.setInterval(() => {
      attempts += 1;

      void getCodexAuthStatus()
        .then((authState) => {
          if (!isActive) {
            return;
          }

          setCodexAuth(authState);

          if (authState.authenticated) {
            setIsStartingLogin(false);
            setLoginError("");
            return;
          }

          if (!authState.available || attempts >= 80) {
            setIsStartingLogin(false);
            setLoginError(
              authState.error ??
                "Sign-in was not completed. You can try again.",
            );
          }
        })
        .catch((error: unknown) => {
          if (!isActive) {
            return;
          }

          setIsStartingLogin(false);
          setLoginError(
            error instanceof Error
              ? error.message
              : "Could not check whether sign-in completed.",
          );
        });
    }, 1500);

    return () => {
      isActive = false;
      window.clearInterval(pollAuthStatus);
    };
  }, [isStartingLogin]);

  useEffect(() => {
    setDraft("");
    setMessages([]);
    setIsAsking(false);
    setApplyingMessageId("");
  }, [node?.id]);

  async function beginCodexLogin() {
    if (isStartingLogin) {
      return;
    }

    setLoginError("");

    try {
      await startCodexLogin();
      setIsStartingLogin(true);
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : "Could not start Codex sign-in.",
      );
    }
  }

  async function askForCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = draft.trim();

    if (!codexAuth?.authenticated || !node || !message || isAsking) {
      return;
    }

    setDraft("");
    setIsAsking(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: message,
      },
    ]);

    try {
      const code = await onAsk(node.id, message);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          code,
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: "Review this change before applying it.",
        },
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `error-${Date.now()}`,
          role: "error",
          text:
            error instanceof Error
              ? error.message
              : "Could not get a suggestion.",
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  }

  async function applyCode(message: ChatMessage) {
    if (!node || !message.code || message.isApplied || applyingMessageId) {
      return;
    }

    setApplyingMessageId(message.id);

    try {
      await onApply(node.id, message.code);

      setMessages((currentMessages) =>
        currentMessages.map((currentMessage) => {
          if (currentMessage.id !== message.id) {
            return currentMessage;
          }

          return {
            ...currentMessage,
            isApplied: true,
            text: "Applied to python-script.py.",
          };
        }),
      );
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `error-${Date.now()}`,
          role: "error",
          text:
            error instanceof Error
              ? error.message
              : "Could not update the Python script.",
        },
      ]);
    } finally {
      setApplyingMessageId("");
    }
  }

  return (
    <aside
      className="workflow-chat-panel"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="workflow-chat-header">
        <div>
          <strong>Codex</strong>
          <span>
            {!codexAuth
              ? "Checking sign-in"
              : !codexAuth.authenticated
                ? "Sign in required"
                : node
                  ? `${node.scriptName ?? node.name}.py`
                  : "No script selected"}
          </span>
        </div>
      </div>

      <div className="workflow-chat-messages">
        {!codexAuth && (
          <p className="workflow-chat-empty">Checking Codex sign-in…</p>
        )}

        {codexAuth && !codexAuth.authenticated && (
          <section className="workflow-chat-auth" aria-live="polite">
            <strong>Sign in to use Codex</strong>
            <p>
              {isStartingLogin
                ? "Complete sign-in in the browser window that opened."
                : codexAuth.available
                  ? "Connect your ChatGPT account to generate Python changes."
                  : codexAuth.error ?? "Codex CLI is not available."}
            </p>
            {loginError && (
              <p className="workflow-chat-auth-error">{loginError}</p>
            )}
            {codexAuth.available && (
              <button
                disabled={isStartingLogin}
                onClick={() => void beginCodexLogin()}
                type="button"
              >
                {isStartingLogin
                  ? "Waiting for sign-in"
                  : "Sign in with ChatGPT"}
              </button>
            )}
          </section>
        )}

        {codexAuth?.authenticated && !node && (
          <p className="workflow-chat-empty">Select a Python script node.</p>
        )}

        {codexAuth?.authenticated && node && messages.length === 0 && (
          <p className="workflow-chat-empty">Ask Codex to update this script.</p>
        )}

        {codexAuth?.authenticated &&
          messages.map((message) => (
            <article
              className="workflow-chat-message"
              data-role={message.role}
              key={message.id}
            >
              <p>{message.text}</p>
              {message.code && (
                <>
                  <pre>{message.code}</pre>
                  <button
                    disabled={
                      message.isApplied || applyingMessageId === message.id
                    }
                    onClick={() => void applyCode(message)}
                    type="button"
                  >
                    {message.isApplied
                      ? "Applied"
                      : applyingMessageId === message.id
                        ? "Applying"
                        : "Apply"}
                  </button>
                </>
              )}
            </article>
          ))}
      </div>

      <form className="workflow-chat-form" onSubmit={askForCode}>
        <textarea
          disabled={!codexAuth?.authenticated || !node || isAsking}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask Codex"
          rows={3}
          value={draft}
        />
        <button
          disabled={
            !codexAuth?.authenticated || !node || !draft.trim() || isAsking
          }
          type="submit"
        >
          {isAsking ? "Working" : "Send"}
        </button>
      </form>
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

function getDraftConnectionPath(
  fromNode: WorkflowNode,
  pointer: { x: number; y: number },
) {
  const fromSize = getNodeSize(fromNode.stepType);
  const startX = fromNode.x + fromSize.width;
  const startY = fromNode.y + fromSize.height / 2;
  const curve = Math.max(48, Math.abs(pointer.x - startX) / 2);

  return `M ${startX} ${startY} C ${startX + curve} ${startY} ${
    pointer.x - curve
  } ${pointer.y} ${pointer.x} ${pointer.y}`;
}

function isWorkflowTextInput(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.matches("input, textarea, select") ||
      target.isContentEditable ||
      target.closest("[contenteditable='true']") !== null)
  );
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

function MoreIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
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

function CodexToolIcon() {
  return (
    <svg
      aria-hidden="true"
      className="workflow-tool-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="m12 3 7.8 4.5v9L12 21l-7.8-4.5v-9Z" />
      <path d="m9.3 9.2 5.4 5.6" />
      <path d="m14.7 9.2-5.4 5.6" />
    </svg>
  );
}

function ClaudeCodeToolIcon() {
  return (
    <svg
      aria-hidden="true"
      className="workflow-tool-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M9 6H7l-4 6 4 6h2" />
      <path d="M15 6h2l4 6-4 6h-2" />
      <path d="M14.5 8.5a4.5 4.5 0 1 0 0 7" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="workflow-open-chevron"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="workflow-open-check"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="m6 12.5 3.6 3.6L18 7.8" />
    </svg>
  );
}

function ApplicationIcon({ target }: { target: PythonOpenTarget }) {
  const iconPaths: Record<PythonOpenTarget, string> = {
    cursor: "/application-icons/cursor.png",
    finder: "/application-icons/finder.png",
    ghostty: "/application-icons/ghostty.png",
    terminal: "/application-icons/terminal.png",
    vscode: "/application-icons/vscode.png",
    xcode: "/application-icons/xcode.png",
  };

  return (
    <Image
      alt=""
      aria-hidden="true"
      className="workflow-application-icon"
      data-target={target}
      height={13}
      src={iconPaths[target]}
      width={13}
    />
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
