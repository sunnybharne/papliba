import type { FormEvent } from "react";

import { workflowNameHelp } from "../constants";

type CreateWorkflowDialogProps = {
  draftWorkflowName: string;
  error: string;
  onCancel: () => void;
  onNameChange: (workflowName: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CreateWorkflowDialog({
  draftWorkflowName,
  error,
  onCancel,
  onNameChange,
  onSubmit,
}: CreateWorkflowDialogProps) {
  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <section
        aria-modal="true"
        aria-labelledby="workflow-dialog-title"
        className="dialog-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 id="workflow-dialog-title">Create workflow</h2>
        <p id="workflow-name-help">{workflowNameHelp}</p>

        <form className="dialog-form" onSubmit={onSubmit}>
          <input
            autoFocus
            aria-describedby="workflow-name-help"
            aria-invalid={error.length > 0}
            aria-label="Workflow name"
            maxLength={30}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="daily-review"
            spellCheck="false"
            type="text"
            value={draftWorkflowName}
          />
          {error && <p className="dialog-error">{error}</p>}

          <div className="dialog-actions">
            <button className="ghost-button" onClick={onCancel} type="button">
              Cancel
            </button>
            <button className="primary-button" type="submit">
              Create
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
