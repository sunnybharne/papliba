import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
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

type ActiveItem = {
  connections?: WorkflowConnection[];
  name: string;
  nodes?: WorkflowNode[];
  trigger?: WorkflowTrigger | null;
  triggers?: WorkflowTrigger[];
  workflows?: Workflow[];
};

type ActiveItemType = "project" | "workflow";
type CreatableWorkflowNodeStepType = "codex" | "claude-code" | "python";
const workflowTriggerHeight = 70;
const workflowTriggerWidth = 150;
const workflowClipboardMimeType = "application/x-papliba-workflow";

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
  onDeleteWorkflowConnection: (
    fromNodeId: string,
    toNodeId: string,
  ) => void;
  onReconnectWorkflowConnection: (
    fromNodeId: string,
    previousToNodeId: string,
    nextToNodeId: string,
  ) => void;
  onCreateWorkflow: () => void;
  onOpenDeleteWorkflowDialog: (workflowName: string) => void;
  onDeleteWorkflowNodes: (nodeIds: string[]) => Promise<boolean>;
  onDeleteWorkflowTrigger: (triggerId: string) => void;
  onMoveWorkflowNode: (nodeId: string, x: number, y: number) => void;
  onMoveWorkflowNodes: (
    positions: Array<{ nodeId: string; x: number; y: number }>,
  ) => void;
  onMoveWorkflowTrigger: (triggerId: string, x: number, y: number) => void;
  onPasteWorkflowSelection: (
    nodes: WorkflowNode[],
    triggers: WorkflowTrigger[],
    connections: WorkflowConnection[],
    offset: number,
  ) => { nodeIds: string[]; triggerIds: string[] };
  onRenameWorkflowPythonScript: (
    nodeId: string,
    name: string,
  ) => Promise<string>;
  onRenameWorkflowTrigger: (triggerId: string, name: string) => void;
  onLoadPythonScript: (nodeId: string) => Promise<string>;
  onOpenPythonScript: (
    nodeId: string,
    target: PythonOpenTarget,
  ) => Promise<void>;
  onRenameWorkflow: (workflowName: string, nextName: string) => string;
  onRunWorkflowDemo: (triggerId: string) => void;
  onSelectWorkflow: (workflowName: string) => void;
  onStartWorkflowNodeMove: () => void;
  onUndoWorkflowEdit: () => void;
  onUpdatePythonLogRetention: (nodeId: string, retention: number) => void;
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
  onDeleteWorkflowConnection,
  onReconnectWorkflowConnection,
  onCreateWorkflow,
  onOpenDeleteWorkflowDialog,
  onDeleteWorkflowNodes,
  onDeleteWorkflowTrigger,
  onMoveWorkflowNode,
  onMoveWorkflowNodes,
  onMoveWorkflowTrigger,
  onPasteWorkflowSelection,
  onRenameWorkflowPythonScript,
  onRenameWorkflowTrigger,
  onLoadPythonScript,
  onOpenPythonScript,
  onRenameWorkflow,
  onRunWorkflowDemo,
  onSelectWorkflow,
  onStartWorkflowNodeMove,
  onUndoWorkflowEdit,
  onUpdatePythonLogRetention,
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
            triggers={activeItem?.triggers ?? []}
            onAddNode={onAddWorkflowNode}
            onAddTrigger={onAddWorkflowTrigger}
            onApplyPythonScriptCode={onApplyPythonScriptCode}
            onAskPythonScriptCode={onAskPythonScriptCode}
            onConnectNodes={onConnectWorkflowNodes}
            onDeleteConnection={onDeleteWorkflowConnection}
            onReconnectConnection={onReconnectWorkflowConnection}
            onDeleteNodes={onDeleteWorkflowNodes}
            onDeleteTrigger={onDeleteWorkflowTrigger}
            onLoadPythonScript={onLoadPythonScript}
            onMoveNode={onMoveWorkflowNode}
            onMoveNodes={onMoveWorkflowNodes}
            onMoveTrigger={onMoveWorkflowTrigger}
            onPasteSelection={onPasteWorkflowSelection}
            onRenamePythonScript={onRenameWorkflowPythonScript}
            onRenameTrigger={onRenameWorkflowTrigger}
            onOpenPythonScript={onOpenPythonScript}
            onRun={onRunWorkflowDemo}
            onSelectDefaultOpenTarget={setDefaultOpenTarget}
            onStartNodeMove={onStartWorkflowNodeMove}
            onUndo={onUndoWorkflowEdit}
            onUpdatePythonLogRetention={onUpdatePythonLogRetention}
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
  triggers: WorkflowTrigger[];
  onAddNode: (
    position?: { x: number; y: number },
    stepType?: WorkflowNodeStepType,
  ) => void;
  onAddTrigger: (position?: { x: number; y: number }) => void;
  onApplyPythonScriptCode: (nodeId: string, code: string) => Promise<void>;
  onAskPythonScriptCode: (nodeId: string, message: string) => Promise<string>;
  onConnectNodes: (fromNodeId: string, toNodeId: string) => void;
  onDeleteConnection: (fromNodeId: string, toNodeId: string) => void;
  onReconnectConnection: (
    fromNodeId: string,
    previousToNodeId: string,
    nextToNodeId: string,
  ) => void;
  onDeleteNodes: (nodeIds: string[]) => Promise<boolean>;
  onDeleteTrigger: (triggerId: string) => void;
  onLoadPythonScript: (nodeId: string) => Promise<string>;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
  onMoveNodes: (
    positions: Array<{ nodeId: string; x: number; y: number }>,
  ) => void;
  onMoveTrigger: (triggerId: string, x: number, y: number) => void;
  onPasteSelection: (
    nodes: WorkflowNode[],
    triggers: WorkflowTrigger[],
    connections: WorkflowConnection[],
    offset: number,
  ) => { nodeIds: string[]; triggerIds: string[] };
  onRenamePythonScript: (nodeId: string, name: string) => Promise<string>;
  onRenameTrigger: (triggerId: string, name: string) => void;
  onOpenPythonScript: (
    nodeId: string,
    target: PythonOpenTarget,
  ) => Promise<void>;
  onRun: (triggerId: string) => void;
  onSelectDefaultOpenTarget: (target: PythonOpenTarget) => void;
  onStartNodeMove: () => void;
  onUndo: () => void;
  onUpdatePythonLogRetention: (nodeId: string, retention: number) => void;
};

function WorkflowCanvas({
  canUndo,
  connections,
  defaultOpenTarget,
  isRunning,
  nodes,
  triggers,
  onAddNode,
  onAddTrigger,
  onApplyPythonScriptCode,
  onAskPythonScriptCode,
  onConnectNodes,
  onDeleteConnection,
  onReconnectConnection,
  onDeleteNodes,
  onDeleteTrigger,
  onLoadPythonScript,
  onMoveNode,
  onMoveNodes,
  onMoveTrigger,
  onPasteSelection,
  onRenamePythonScript,
  onRenameTrigger,
  onOpenPythonScript,
  onRun,
  onSelectDefaultOpenTarget,
  onStartNodeMove,
  onUndo,
  onUpdatePythonLogRetention,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const copiedSelectionRef = useRef<{
    connections: WorkflowConnection[];
    nodes: WorkflowNode[];
    pasteCount: number;
    triggers: WorkflowTrigger[];
  } | null>(null);
  const [connectingFromNodeId, setConnectingFromNodeId] = useState("");
  const [reconnectingConnectionKey, setReconnectingConnectionKey] =
    useState("");
  const [connectionPointer, setConnectionPointer] = useState<{
    x: number;
    y: number;
  }>();
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedConnectionKey, setSelectedConnectionKey] = useState("");
  const [selectedTriggerId, setSelectedTriggerId] = useState("");
  const [triggerPulseId, setTriggerPulseId] = useState("");
  const [codeChangedNodeId, setCodeChangedNodeId] = useState("");
  const [pythonCodeRevisions, setPythonCodeRevisions] = useState<
    Record<string, number>
  >({});
  const [selectionRectangle, setSelectionRectangle] = useState<{
    height: number;
    width: number;
    x: number;
    y: number;
  }>();
  const [openNodeId, setOpenNodeId] = useState("");
  const [chatNodeId, setChatNodeId] = useState("");
  const openNode = nodes.find((node) => node.id === openNodeId);
  const chatNode = nodes.find(
    (node) => node.id === chatNodeId && node.stepType === "python",
  );
  const reachableNodeIds = getReachableWorkflowNodeIds(
    connections,
    triggers,
  );

  useEffect(() => {
    function deleteSelectedNodes(event: KeyboardEvent) {
      const existingNodeIds = new Set(nodes.map((node) => node.id));
      const selectedExistingNodeIds = selectedNodeIds.filter((nodeId) =>
        existingNodeIds.has(nodeId),
      );
      const selectedConnection = connections.find(
        (connection) =>
          getConnectionKey(connection) === selectedConnectionKey,
      );

      if (
        (event.key !== "Delete" && event.key !== "Backspace") ||
        (selectedExistingNodeIds.length === 0 && !selectedConnection) ||
        isWorkflowTextInput(event.target)
      ) {
        return;
      }

      event.preventDefault();
      if (selectedExistingNodeIds.length === 0 && selectedConnection) {
        onDeleteConnection(
          selectedConnection.fromNodeId,
          selectedConnection.toNodeId,
        );
        setSelectedConnectionKey("");
        return;
      }

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
  }, [
    connections,
    nodes,
    onDeleteConnection,
    onDeleteNodes,
    selectedConnectionKey,
    selectedNodeIds,
  ]);

  useEffect(() => {
    function copySelectedNodes(event: ClipboardEvent) {
      if (isWorkflowTextInput(event.target)) {
        return;
      }

      const selectedNodeIdSet = new Set(selectedNodeIds);
      const selectedTriggerIdSet = new Set(
        selectedTriggerId ? [selectedTriggerId] : [],
      );
      const copiedNodes = nodes
        .filter((node) => selectedNodeIdSet.has(node.id))
        .map((node) => ({ ...node }));
      const copiedTriggers = triggers
        .filter((trigger) => selectedTriggerIdSet.has(trigger.id))
        .map((trigger) => ({ ...trigger }));

      if (copiedNodes.length === 0 && copiedTriggers.length === 0) {
        return;
      }

      const copiedItemIds = new Set([
        ...copiedNodes.map((node) => node.id),
        ...copiedTriggers.map((trigger) => trigger.id),
      ]);

      event.preventDefault();
      event.clipboardData?.setData(workflowClipboardMimeType, "selection");
      event.clipboardData?.setData("text/plain", "Papliba workflow selection");
      copiedSelectionRef.current = {
        connections: connections
          .filter(
            (connection) =>
              copiedItemIds.has(connection.fromNodeId) &&
              copiedItemIds.has(connection.toNodeId),
          )
          .map((connection) => ({ ...connection, status: "idle" })),
        nodes: copiedNodes,
        pasteCount: 0,
        triggers: copiedTriggers,
      };
    }

    function pasteSelectedNodes(event: ClipboardEvent) {
      if (
        isWorkflowTextInput(event.target) ||
        !copiedSelectionRef.current ||
        event.clipboardData?.getData(workflowClipboardMimeType) !== "selection"
      ) {
        return;
      }

      event.preventDefault();
      copiedSelectionRef.current.pasteCount += 1;
      const pastedSelection = onPasteSelection(
        copiedSelectionRef.current.nodes,
        copiedSelectionRef.current.triggers,
        copiedSelectionRef.current.connections,
        copiedSelectionRef.current.pasteCount * 24,
      );

      setOpenNodeId("");
      setChatNodeId("");
      setSelectedConnectionKey("");
      setSelectedNodeIds(pastedSelection.nodeIds);
      setSelectedTriggerId(pastedSelection.triggerIds[0] ?? "");
    }

    window.addEventListener("copy", copySelectedNodes);
    window.addEventListener("paste", pasteSelectedNodes);
    return () => {
      window.removeEventListener("copy", copySelectedNodes);
      window.removeEventListener("paste", pasteSelectedNodes);
    };
  }, [
    connections,
    nodes,
    onPasteSelection,
    selectedNodeIds,
    selectedTriggerId,
    triggers,
  ]);

  function dropNode(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const tool = event.dataTransfer.getData("application/papliba-node");

    if (
      tool !== "codex" &&
      tool !== "claude-code" &&
      tool !== "python" &&
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
        x: event.clientX - canvasRect.left - workflowTriggerWidth / 2,
        y: event.clientY - canvasRect.top - workflowTriggerHeight / 2,
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
    connectionToReplace?: WorkflowConnection,
  ) {
    event.preventDefault();
    event.stopPropagation();

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const sourceAnchor = getConnectionSourceAnchor(nodeId, nodes, triggers);

    if (!canvasRect || !sourceAnchor) {
      return;
    }

    const canvasLeft = canvasRect.left;
    const canvasTop = canvasRect.top;

    setConnectingFromNodeId(nodeId);
    setReconnectingConnectionKey(
      connectionToReplace ? getConnectionKey(connectionToReplace) : "",
    );
    setConnectionPointer({
      x: sourceAnchor.x,
      y: sourceAnchor.y,
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
        if (
          connectionToReplace &&
          targetNodeId !== connectionToReplace.toNodeId
        ) {
          onReconnectConnection(
            connectionToReplace.fromNodeId,
            connectionToReplace.toNodeId,
            targetNodeId,
          );
        } else if (!connectionToReplace) {
          onConnectNodes(nodeId, targetNodeId);
        }
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
      setReconnectingConnectionKey("");
      setConnectionPointer(undefined);
    }

    window.addEventListener("pointermove", moveConnection);
    window.addEventListener("pointerup", stopConnection);
    window.addEventListener("pointercancel", finishConnectionDrag);
    window.addEventListener("keydown", cancelConnection);
  }

  function startConnectionFromInput(
    targetNodeId: string,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    const incomingConnection = [...connections]
      .reverse()
      .find((connection) => connection.toNodeId === targetNodeId);

    if (!incomingConnection) {
      return;
    }

    startConnection(incomingConnection.fromNodeId, event, incomingConnection);
  }

  async function applyPythonCodeAndRefresh(nodeId: string, code: string) {
    await onApplyPythonScriptCode(nodeId, code);
    setPythonCodeRevisions((currentRevisions) => ({
      ...currentRevisions,
      [nodeId]: (currentRevisions[nodeId] ?? 0) + 1,
    }));
    setCodeChangedNodeId("");
    window.requestAnimationFrame(() => setCodeChangedNodeId(nodeId));
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
    setChatNodeId("");
    setSelectedConnectionKey("");
    setSelectedTriggerId("");
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
        setSelectedTriggerId("");
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
        onPointerDown={() => {
          setOpenNodeId("");
          setChatNodeId("");
          setSelectedConnectionKey("");
          setSelectedTriggerId("");
        }}
      >
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
          className="workflow-tool-button workflow-trigger-tool-button"
          data-tooltip="Manual trigger"
          draggable
          onClick={() => onAddTrigger()}
          onDragStart={startDragTrigger}
          type="button"
        >
          <TriggerToolIcon />
        </button>
        <button
          aria-label="Add OpenAI node"
          className="workflow-tool-button workflow-codex-tool-button"
          data-tooltip="OpenAI node"
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
        <button
          aria-label="Add python-script"
          className="workflow-tool-button workflow-python-tool-button"
          data-tooltip="python-script"
          draggable
          onClick={() => onAddNode(undefined, "python")}
          onDragStart={(event) => startDragTool(event, "python")}
          type="button"
        >
          <PythonToolIcon />
        </button>
      </div>

      <div
        className={`workflow-canvas-layout${
          chatNode ? "" : " workflow-canvas-layout-full"
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
          <svg className="workflow-connections">
            {connections.map((connection) => {
              if (
                getConnectionKey(connection) === reconnectingConnectionKey
              ) {
                return null;
              }

              const path = getConnectionPath(connection, nodes, triggers);

              if (!path) {
                return null;
              }

              const connectionKey = getConnectionKey(connection);

              return (
                <g key={connectionKey}>
                  <path
                    className="workflow-connection-line"
                    data-selected={selectedConnectionKey === connectionKey}
                    data-status={connection.status ?? "idle"}
                    d={path}
                  />
                  {connection.status === "running" && (
                    <WorkflowConnectionParticle path={path} />
                  )}
                  <path
                    aria-label="Select workflow connection"
                    className="workflow-connection-hit-area"
                    d={path}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedNodeIds([]);
                      setSelectedTriggerId("");
                      setSelectedConnectionKey(connectionKey);
                    }}
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      onDeleteConnection(
                        connection.fromNodeId,
                        connection.toNodeId,
                      );
                      setSelectedConnectionKey("");
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                    role="button"
                  />
                </g>
              );
            })}
            {connectingFromNodeId &&
              connectionPointer &&
              getConnectionSourceAnchor(
                connectingFromNodeId,
                nodes,
                triggers,
              ) && (
                <>
                  <path
                    className="workflow-draft-connection"
                    d={getDraftConnectionPath(
                      connectingFromNodeId,
                      nodes,
                      triggers,
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

          {triggers.map((trigger) => (
            <WorkflowTriggerBlock
              canRun={getReachableNodeIdsFromSource(
                trigger.id,
                connections,
              ).size > 0}
              connectingFromNodeId={connectingFromNodeId}
              isSelected={selectedTriggerId === trigger.id}
              isTriggered={triggerPulseId === trigger.id}
              isWorkflowRunning={isRunning}
              key={trigger.id}
              onDelete={() => {
                setSelectedTriggerId("");
                onDeleteTrigger(trigger.id);
              }}
              onMove={(x, y) => onMoveTrigger(trigger.id, x, y)}
              onRename={(name) => onRenameTrigger(trigger.id, name)}
              onRun={() => {
                setTriggerPulseId(trigger.id);
                onRun(trigger.id);
              }}
              onSelect={() => {
                setOpenNodeId("");
                setChatNodeId("");
                setSelectedConnectionKey("");
                setSelectedNodeIds([]);
                setSelectedTriggerId(trigger.id);
              }}
              onStartMove={onStartNodeMove}
              onStartConnection={startConnection}
              onTriggerAnimationEnd={() => setTriggerPulseId("")}
              trigger={trigger}
            />
          ))}

          {triggers.length === 0 && (
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
              style={{
                height: selectionRectangle.height,
                left: selectionRectangle.x,
                top: selectionRectangle.y,
                width: selectionRectangle.width,
              }}
            />
          )}

          {nodes.map((node) => (
            <WorkflowNodeView
              connectingFromNodeId={connectingFromNodeId}
              defaultOpenTarget={defaultOpenTarget}
              isOpen={openNodeId === node.id}
              isChatActive={chatNodeId === node.id}
              isCodeChanged={codeChangedNodeId === node.id}
              isDisconnected={!reachableNodeIds.has(node.id)}
              isSelected={selectedNodeIds.includes(node.id)}
              hasIncomingConnection={connections.some(
                (connection) => connection.toNodeId === node.id,
              )}
              key={node.id}
              node={node}
              onDelete={(nodeId) => void onDeleteNodes([nodeId])}
              onMoveNode={onMoveNode}
              onMoveNodes={onMoveNodes}
              onOpen={(nodeId) => {
                setOpenNodeId(nodeId);
                setChatNodeId(
                  nodes.find((candidate) => candidate.id === nodeId)
                    ?.stepType === "python"
                    ? nodeId
                    : "",
                );
              }}
              onOpenPythonScript={onOpenPythonScript}
              onRenamePythonScript={onRenamePythonScript}
              onSelectDefaultOpenTarget={onSelectDefaultOpenTarget}
              selectedNodes={nodes.filter((candidate) =>
                selectedNodeIds.includes(candidate.id),
              )}
              onSelectNode={(selectedNode, additive) => {
                setSelectedConnectionKey("");
                setSelectedTriggerId("");
                setSelectedNodeIds((currentNodeIds) => {
                  if (additive) {
                    return currentNodeIds.includes(selectedNode.id)
                      ? currentNodeIds.filter(
                          (nodeId) => nodeId !== selectedNode.id,
                        )
                      : [...currentNodeIds, selectedNode.id];
                  }

                  return currentNodeIds.includes(selectedNode.id)
                    ? currentNodeIds
                    : [selectedNode.id];
                });
                setChatNodeId(
                  selectedNode.stepType === "python" ? selectedNode.id : "",
                );
              }}
              onStartMove={onStartNodeMove}
              onStartConnection={startConnection}
              onStartReconnect={startConnectionFromInput}
              onCodeChangeAnimationEnd={() => setCodeChangedNodeId("")}
            />
          ))}

          {openNode && (
            <WorkflowNodePanel
              key={`${openNode.id}-${openNode.stepType}`}
              node={openNode}
              onClose={() => setOpenNodeId("")}
              onLoadPythonScript={onLoadPythonScript}
              onUpdateLogRetention={onUpdatePythonLogRetention}
              pythonCodeRevision={pythonCodeRevisions[openNode.id] ?? 0}
            />
          )}

        </div>

        {chatNode && (
          <PythonScriptChatPanel
            node={chatNode}
            onApply={applyPythonCodeAndRefresh}
            onAsk={onAskPythonScriptCode}
            onClose={() => setChatNodeId("")}
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
  isChatActive: boolean;
  isCodeChanged: boolean;
  isDisconnected: boolean;
  hasIncomingConnection: boolean;
  isSelected: boolean;
  node: WorkflowNode;
  onDelete: (nodeId: string) => void;
  onCodeChangeAnimationEnd: () => void;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
  onMoveNodes: (
    positions: Array<{ nodeId: string; x: number; y: number }>,
  ) => void;
  onOpen: (nodeId: string) => void;
  onOpenPythonScript: (
    nodeId: string,
    target: PythonOpenTarget,
  ) => Promise<void>;
  onRenamePythonScript: (nodeId: string, name: string) => Promise<string>;
  onSelectDefaultOpenTarget: (target: PythonOpenTarget) => void;
  onSelectNode: (node: WorkflowNode, additive: boolean) => void;
  selectedNodes: WorkflowNode[];
  onStartMove: () => void;
  onStartConnection: (
    nodeId: string,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => void;
  onStartReconnect: (
    nodeId: string,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => void;
};

type WorkflowTriggerBlockProps = {
  canRun: boolean;
  connectingFromNodeId: string;
  isSelected: boolean;
  isTriggered: boolean;
  isWorkflowRunning: boolean;
  onDelete: () => void;
  onMove: (x: number, y: number) => void;
  onRename: (name: string) => void;
  onRun: () => void;
  onSelect: () => void;
  onStartMove: () => void;
  onStartConnection: (
    triggerId: string,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => void;
  onTriggerAnimationEnd: () => void;
  trigger: WorkflowTrigger;
};

function WorkflowTriggerBlock({
  canRun,
  connectingFromNodeId,
  isSelected,
  isTriggered,
  isWorkflowRunning,
  onDelete,
  onMove,
  onRename,
  onRun,
  onSelect,
  onStartMove,
  onStartConnection,
  onTriggerAnimationEnd,
  trigger,
}: WorkflowTriggerBlockProps) {
  const triggerName = trigger.name?.trim() || "Manual trigger";
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(triggerName);

  function startRenaming(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    setNameDraft(triggerName);
    setIsRenaming(true);
  }

  function cancelRenaming() {
    setNameDraft(triggerName);
    setIsRenaming(false);
  }

  function saveName() {
    const nextName = nameDraft.trim();

    if (nextName.length === 0) {
      cancelRenaming();
      return;
    }

    if (nextName !== triggerName) {
      onRename(nextName);
    }

    setIsRenaming(false);
  }

  function handleNameKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveName();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelRenaming();
    }
  }

  function dragTrigger(event: ReactPointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement;

    if (target.closest("button, input")) {
      return;
    }

    onSelect();
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
      aria-label={triggerName}
      className="workflow-trigger-node"
      data-selected={isSelected}
      data-triggered={isTriggered}
      onAnimationEnd={(event) => {
        if (event.animationName === "workflow-trigger-border-flow") {
          onTriggerAnimationEnd();
        }
      }}
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
      <span>Manual Trigger</span>
      {isRenaming ? (
        <input
          aria-label="Trigger name"
          autoFocus
          className="workflow-trigger-name-input"
          maxLength={60}
          onBlur={saveName}
          onChange={(event) => setNameDraft(event.target.value)}
          onKeyDown={handleNameKeyDown}
          value={nameDraft}
        />
      ) : (
        <strong
          onDoubleClick={startRenaming}
          title="Double-click to rename"
        >
          {triggerName}
        </strong>
      )}
      <button
        aria-label={isWorkflowRunning ? "Workflow is running" : "Run workflow"}
        className="workflow-trigger-run-button"
        disabled={!canRun || isWorkflowRunning}
        onClick={onRun}
        title={isWorkflowRunning ? "Workflow is running" : "Run workflow"}
        type="button"
      >
        <PlayIcon />
      </button>
      <button
        aria-label={`Connect from ${triggerName}`}
        className="workflow-port workflow-port-output"
        data-active={connectingFromNodeId === trigger.id}
        onPointerDown={(event) => onStartConnection(trigger.id, event)}
        type="button"
      />
    </article>
  );
}

function WorkflowNodeView({
  connectingFromNodeId,
  defaultOpenTarget,
  isOpen,
  isChatActive,
  isCodeChanged,
  isDisconnected,
  hasIncomingConnection,
  isSelected,
  node,
  onDelete,
  onCodeChangeAnimationEnd,
  onMoveNode,
  onMoveNodes,
  onOpen,
  onOpenPythonScript,
  onRenamePythonScript,
  onSelectDefaultOpenTarget,
  onSelectNode,
  selectedNodes,
  onStartMove,
  onStartConnection,
  onStartReconnect,
}: WorkflowNodeViewProps) {
  const size = getNodeSize(node.stepType);
  const defaultOpenOption =
    pythonOpenTargets.find((option) => option.target === defaultOpenTarget) ??
    pythonOpenTargets[0];
  const openMenuRef = useRef<HTMLDivElement>(null);
  const [isOpenMenuVisible, setIsOpenMenuVisible] = useState(false);
  const [openingTarget, setOpeningTarget] = useState<PythonOpenTarget>();
  const [openScriptError, setOpenScriptError] = useState("");
  const [isRenamingPythonScript, setIsRenamingPythonScript] = useState(false);
  const [pythonScriptNameDraft, setPythonScriptNameDraft] = useState("");
  const [pythonScriptNameError, setPythonScriptNameError] = useState("");

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

  function startRenamingPythonScript(event: ReactMouseEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    setPythonScriptNameDraft(node.scriptName ?? node.name);
    setPythonScriptNameError("");
    setIsRenamingPythonScript(true);
  }

  async function savePythonScriptName() {
    const error = await onRenamePythonScript(node.id, pythonScriptNameDraft);

    if (error) {
      setPythonScriptNameError(error);
      return;
    }

    setPythonScriptNameError("");
    setIsRenamingPythonScript(false);
  }

  function cancelPythonScriptRename() {
    setPythonScriptNameError("");
    setIsRenamingPythonScript(false);
  }

  function handlePythonScriptNameKeyDown(
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      void savePythonScriptName();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelPythonScriptRename();
    }
  }

  function openPythonScriptDetails(event: ReactMouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement;

    if (
      node.stepType !== "python" ||
      target.closest("button, input")
    ) {
      return;
    }

    event.preventDefault();
    onOpen(node.id);
  }

  function dragNode(event: ReactPointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement;

    if (target.closest("button, input")) {
      return;
    }

    onSelectNode(node, event.shiftKey);
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const nodesToMove =
      isSelected || event.shiftKey
        ? [
            ...selectedNodes,
            ...(selectedNodes.some((candidate) => candidate.id === node.id)
              ? []
              : [node]),
          ]
        : [node];
    const startPositions = nodesToMove.map((candidate) => ({
      nodeId: candidate.id,
      x: candidate.x,
      y: candidate.y,
    }));
    const minimumStartX = Math.min(
      ...startPositions.map((position) => position.x),
    );
    const minimumStartY = Math.min(
      ...startPositions.map((position) => position.y),
    );
    let hasStartedMoving = false;

    function moveNode(pointerEvent: PointerEvent) {
      if (!hasStartedMoving) {
        onStartMove();
        hasStartedMoving = true;
      }

      const deltaX = Math.max(
        pointerEvent.clientX - startX,
        12 - minimumStartX,
      );
      const deltaY = Math.max(
        pointerEvent.clientY - startY,
        12 - minimumStartY,
      );

      if (startPositions.length === 1) {
        onMoveNode(
          node.id,
          startPositions[0].x + deltaX,
          startPositions[0].y + deltaY,
        );
        return;
      }

      onMoveNodes(
        startPositions.map((position) => ({
          nodeId: position.nodeId,
          x: position.x + deltaX,
          y: position.y + deltaY,
        })),
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
      data-chat-active={isChatActive}
      data-code-changed={isCodeChanged}
      data-disconnected={isDisconnected}
      data-selected={isSelected}
      data-status={node.status}
      onAnimationEnd={(event) => {
        if (event.animationName === "workflow-node-code-change") {
          onCodeChangeAnimationEnd();
        }
      }}
      onDoubleClick={openPythonScriptDetails}
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
        aria-label={
          hasIncomingConnection
            ? `Reconnect incoming connection for ${node.name}`
            : `Connection input for ${node.name}`
        }
        className="workflow-port workflow-port-input"
        data-available={
          connectingFromNodeId.length > 0 && connectingFromNodeId !== node.id
        }
        data-connected={hasIncomingConnection}
        data-node-id={node.id}
        onPointerDown={(event) => onStartReconnect(node.id, event)}
        title={
          hasIncomingConnection
            ? "Drag to reconnect this input"
            : "Connection input"
        }
        type="button"
      />
      <div className="workflow-node-content">
        <span className="workflow-node-type">{getStepTypeLabel(node.stepType)}</span>
        {node.stepType === "python" && isRenamingPythonScript ? (
          <input
            aria-invalid={pythonScriptNameError.length > 0}
            aria-label="Python script name"
            autoFocus
            className="workflow-node-name-input"
            maxLength={63}
            onBlur={() => void savePythonScriptName()}
            onChange={(event) => {
              setPythonScriptNameDraft(event.target.value.toLowerCase());
              setPythonScriptNameError("");
            }}
            onFocus={(event) => event.currentTarget.select()}
            onKeyDown={handlePythonScriptNameKeyDown}
            title={pythonScriptNameError}
            value={pythonScriptNameDraft}
          />
        ) : (
          <strong
            onDoubleClick={
              node.stepType === "python"
                ? startRenamingPythonScript
                : undefined
            }
            title={
              node.stepType === "python"
                ? "Double-click to rename the Python file"
                : undefined
            }
          >
            {node.name}
          </strong>
        )}
        <span
          className="workflow-node-status"
          data-disconnected={isDisconnected}
          data-status={node.status}
        >
          {isDisconnected ? "Disconnected" : getStatusLabel(node.status)}
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
    return "OpenAI";
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
  onUpdateLogRetention: (nodeId: string, retention: number) => void;
  pythonCodeRevision: number;
};

function WorkflowNodePanel({
  node,
  onClose,
  onLoadPythonScript,
  onUpdateLogRetention,
  pythonCodeRevision,
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

    void Promise.resolve()
      .then(() => {
        if (isActive) {
          setIsLoadingPythonCode(true);
          setPythonCodeError("");
        }

        return loadPythonScriptRef.current(node.id);
      })
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
  }, [node.id, node.stepType, pythonCodeRevision]);

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

      {node.stepType === "python" && (
        <>
          <label className="workflow-node-panel-field">
            <span>Run logs to keep</span>
            <input
              aria-label="Run logs to keep"
              max="100"
              min="1"
              onChange={(event) => {
                onUpdateLogRetention(node.id, event.target.valueAsNumber);
              }}
              type="number"
              value={node.logRetention ?? 10}
            />
          </label>

          <div className="workflow-node-panel-code">
            <span>File content</span>
            {isLoadingPythonCode ? (
              <p>Loading script…</p>
            ) : pythonCodeError ? (
              <p data-error="true">{pythonCodeError}</p>
            ) : (
              <PythonCodePreview code={pythonCode} />
            )}
          </div>
        </>
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

const pythonTokenPattern =
  /(\#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(@[A-Za-z_]\w*)|(\b(?:and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b)|(\b(?:True|False|None)\b)|(\b(?:abs|all|any|bool|dict|enumerate|filter|float|input|int|len|list|map|max|min|open|print|range|reversed|set|sorted|str|sum|super|tuple|type|zip)\b)|(\b(?:0[xob][\da-f]+|\d+(?:\.\d+)?)\b)|(\b[A-Za-z_]\w*(?=\s*\())/gim;
const pythonTokenTypes = [
  "comment",
  "string",
  "decorator",
  "keyword",
  "constant",
  "builtin",
  "number",
  "function",
];

function PythonCodePreview({ code }: { code: string }) {
  const tokens: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of code.matchAll(pythonTokenPattern)) {
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      tokens.push(code.slice(lastIndex, matchIndex));
    }

    const tokenType = pythonTokenTypes[
      match.slice(1).findIndex((value) => value !== undefined)
    ];

    tokens.push(
      <span
        className={tokenType ? `python-token-${tokenType}` : undefined}
        key={`${matchIndex}-${match[0]}`}
      >
        {match[0]}
      </span>,
    );
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < code.length) {
    tokens.push(code.slice(lastIndex));
  }

  return (
    <pre>
      <code>{tokens}</code>
    </pre>
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
  onClose: () => void;
};

function PythonScriptChatPanel({
  node,
  onApply,
  onAsk,
  onClose,
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

  function handleChatDraftKeyDown(
    event: ReactKeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
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
                  ? `${node.scriptName ?? node.name}/main.py`
                  : "No script selected"}
          </span>
        </div>
        <button
          aria-label="Close Codex chat"
          className="workflow-chat-close"
          onClick={onClose}
          type="button"
        >
          <CloseIcon />
        </button>
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
        <div className="workflow-chat-context-bar">
          <span title={node ? `${node.scriptName ?? node.name}/main.py` : "No script selected"}>
            <ContextFileIcon />
            {node ? `${node.scriptName ?? node.name}/main.py` : "No script selected"}
          </span>
          <div>
            <span className="workflow-chat-steer-label">Steer</span>
            <button
              aria-label="Clear conversation"
              disabled={messages.length === 0 && draft.length === 0}
              onClick={() => {
                setDraft("");
                setMessages([]);
              }}
              title="Clear conversation"
              type="button"
            >
              <TrashIcon />
            </button>
            <button
              aria-label="More prompt options (coming soon)"
              disabled
              title="More prompt options coming soon"
              type="button"
            >
              <MoreIcon />
            </button>
          </div>
        </div>

        <div className="workflow-chat-composer">
          <textarea
            aria-label="Ask Codex"
            disabled={!codexAuth?.authenticated || !node || isAsking}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleChatDraftKeyDown}
            placeholder="Ask Codex"
            rows={3}
            value={draft}
          />

          <div className="workflow-chat-composer-toolbar">
            <div>
              <button
                aria-label="Attach files (coming soon)"
                className="workflow-chat-icon-button"
                disabled
                title="File attachments coming soon"
                type="button"
              >
                <PlusIcon />
              </button>
              <span className="workflow-chat-access" title="Codex runs with read-only workspace access">
                <AccessIcon />
                Read only
              </span>
            </div>

            <div>
              <span className="workflow-chat-model" title="Uses the default model configured by Codex">
                <ModelIcon />
                Codex default
                <ChevronDownIcon />
              </span>
              <button
                aria-label="Voice input (coming soon)"
                className="workflow-chat-icon-button"
                disabled
                title="Voice input coming soon"
                type="button"
              >
                <MicrophoneIcon />
              </button>
              <button
                aria-label={isAsking ? "Codex is working" : "Send message"}
                className="workflow-chat-send-button"
                disabled={
                  !codexAuth?.authenticated ||
                  !node ||
                  !draft.trim() ||
                  isAsking
                }
                title={isAsking ? "Codex is working" : "Send message"}
                type="submit"
              >
                <ArrowUpIcon />
              </button>
            </div>
          </div>
        </div>
      </form>
    </aside>
  );
}

function getNodeSize(stepType?: WorkflowNodeStepType) {
  return { height: stepType === "python" ? 118 : 86, width: 150 };
}

function getConnectionPath(
  connection: WorkflowConnection,
  nodes: WorkflowNode[],
  triggers: WorkflowTrigger[],
) {
  const sourceAnchor = getConnectionSourceAnchor(
    connection.fromNodeId,
    nodes,
    triggers,
  );
  const toNode = nodes.find((node) => node.id === connection.toNodeId);

  if (!sourceAnchor || !toNode) {
    return "";
  }

  const toSize = getNodeSize(toNode.stepType);
  const startX = sourceAnchor.x;
  const startY = sourceAnchor.y;
  const endX = toNode.x;
  const endY = toNode.y + toSize.height / 2;
  const curve = Math.max(60, Math.abs(endX - startX) / 2);

  return `M ${startX} ${startY} C ${startX + curve} ${startY} ${
    endX - curve
  } ${endY} ${endX} ${endY}`;
}

function getDraftConnectionPath(
  sourceId: string,
  nodes: WorkflowNode[],
  triggers: WorkflowTrigger[],
  pointer: { x: number; y: number },
) {
  const sourceAnchor = getConnectionSourceAnchor(sourceId, nodes, triggers);

  if (!sourceAnchor) {
    return "";
  }

  const startX = sourceAnchor.x;
  const startY = sourceAnchor.y;
  const curve = Math.max(48, Math.abs(pointer.x - startX) / 2);

  return `M ${startX} ${startY} C ${startX + curve} ${startY} ${
    pointer.x - curve
  } ${pointer.y} ${pointer.x} ${pointer.y}`;
}

function getConnectionSourceAnchor(
  sourceId: string,
  nodes: WorkflowNode[],
  triggers: WorkflowTrigger[],
) {
  const sourceNode = nodes.find((node) => node.id === sourceId);

  if (sourceNode) {
    const sourceSize = getNodeSize(sourceNode.stepType);

    return {
      x: sourceNode.x + sourceSize.width,
      y: sourceNode.y + sourceSize.height / 2,
    };
  }

  const sourceTrigger = triggers.find((trigger) => trigger.id === sourceId);

  if (!sourceTrigger) {
    return undefined;
  }

  return {
    x: sourceTrigger.x + workflowTriggerWidth,
    y: sourceTrigger.y + workflowTriggerHeight / 2,
  };
}

function getConnectionKey(connection: WorkflowConnection) {
  return `${connection.fromNodeId}->${connection.toNodeId}`;
}

function getReachableNodeIdsFromSource(
  sourceId: string,
  connections: WorkflowConnection[],
) {
  const reachableNodeIds = new Set<string>();
  const pendingSourceIds = [sourceId];

  while (pendingSourceIds.length > 0) {
    const currentSourceId = pendingSourceIds.shift();

    if (!currentSourceId) {
      continue;
    }

    for (const connection of connections) {
      if (
        connection.fromNodeId !== currentSourceId ||
        reachableNodeIds.has(connection.toNodeId)
      ) {
        continue;
      }

      reachableNodeIds.add(connection.toNodeId);
      pendingSourceIds.push(connection.toNodeId);
    }
  }

  return reachableNodeIds;
}

function getReachableWorkflowNodeIds(
  connections: WorkflowConnection[],
  triggers: WorkflowTrigger[],
) {
  const reachableNodeIds = new Set<string>();

  for (const trigger of triggers) {
    for (const nodeId of getReachableNodeIdsFromSource(
      trigger.id,
      connections,
    )) {
      reachableNodeIds.add(nodeId);
    }
  }

  return reachableNodeIds;
}

function WorkflowConnectionParticle({ path }: { path: string }) {
  const pathValues = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number);
  const startX = pathValues?.[0] ?? 0;
  const startY = pathValues?.[1] ?? 0;
  const [segment, setSegment] = useState({
    x1: startX,
    x2: startX,
    y1: startY,
    y2: startY,
  });

  useEffect(() => {
    const animatedPathValues = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number);

    if (!animatedPathValues || animatedPathValues.length < 8) {
      return;
    }

    const [x0, y0, x1, y1, x2, y2, x3, y3] = animatedPathValues;
    const startedAt = performance.now();
    const duration = 190;
    let animationFrame = 0;

    function moveParticle(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const remaining = 1 - progress;
      const x =
        remaining ** 3 * x0 +
        3 * remaining ** 2 * progress * x1 +
        3 * remaining * progress ** 2 * x2 +
        progress ** 3 * x3;
      const y =
        remaining ** 3 * y0 +
        3 * remaining ** 2 * progress * y1 +
        3 * remaining * progress ** 2 * y2 +
        progress ** 3 * y3;
      const tangentX =
        3 * remaining ** 2 * (x1 - x0) +
        6 * remaining * progress * (x2 - x1) +
        3 * progress ** 2 * (x3 - x2);
      const tangentY =
        3 * remaining ** 2 * (y1 - y0) +
        6 * remaining * progress * (y2 - y1) +
        3 * progress ** 2 * (y3 - y2);
      const tangentLength = Math.hypot(tangentX, tangentY) || 1;
      const halfPulseLength = 5;
      const pulseX = (tangentX / tangentLength) * halfPulseLength;
      const pulseY = (tangentY / tangentLength) * halfPulseLength;

      setSegment({
        x1: x - pulseX,
        x2: x + pulseX,
        y1: y - pulseY,
        y2: y + pulseY,
      });

      if (progress < 1) {
        animationFrame = requestAnimationFrame(moveParticle);
      }
    }

    animationFrame = requestAnimationFrame(moveParticle);

    return () => cancelAnimationFrame(animationFrame);
  }, [path]);

  return (
    <line
      className="workflow-connection-electricity"
      x1={segment.x1}
      x2={segment.x2}
      y1={segment.y1}
      y2={segment.y2}
    />
  );
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

function ContextFileIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M5.5 3.5v13M8.5 6.5h6M8.5 10h4.5" />
    </svg>
  );
}

function AccessIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M10 2.8 15 5v4.2c0 3.4-2 6.3-5 8-3-1.7-5-4.6-5-8V5l5-2.2Z" />
      <path d="M8.2 9.7 9.5 11l2.7-3" />
    </svg>
  );
}

function ModelIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="m10 2 .8 3.2L14 6l-3.2.8L10 10l-.8-3.2L6 6l3.2-.8L10 2Z" />
      <path d="m5 11 .6 2.4L8 14l-2.4.6L5 17l-.6-2.4L2 14l2.4-.6L5 11Zm10-1 .5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5.5-2Z" />
    </svg>
  );
}

function MicrophoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <rect height="9" rx="3" width="5.5" x="7.25" y="2.5" />
      <path d="M4.8 9.5a5.2 5.2 0 0 0 10.4 0M10 14.7v2.8M7.5 17.5h5" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="m5.5 9 4.5-4.5L14.5 9M10 4.8v10.7" />
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

function PlayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m8 5 11 7-11 7Z" />
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
    <span
      aria-hidden="true"
      className="workflow-openai-tool-icon"
    />
  );
}

function ClaudeCodeToolIcon() {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className="workflow-agent-tool-icon"
      height={21}
      src="/tool-icons/claude-code.png"
      width={21}
    />
  );
}

function PythonToolIcon() {
  return (
    <span
      aria-hidden="true"
      className="workflow-python-tool-icon"
    />
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
