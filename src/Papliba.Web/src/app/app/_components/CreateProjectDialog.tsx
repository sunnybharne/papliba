import type { FormEvent } from "react";

import { projectNameHelp } from "../constants";

type CreateProjectDialogProps = {
  draftProjectName: string;
  error: string;
  onCancel: () => void;
  onNameChange: (projectName: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CreateProjectDialog({
  draftProjectName,
  error,
  onCancel,
  onNameChange,
  onSubmit,
}: CreateProjectDialogProps) {
  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <section
        aria-modal="true"
        aria-labelledby="project-dialog-title"
        className="dialog-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 id="project-dialog-title">Create project</h2>
        <p id="project-name-help">{projectNameHelp}</p>

        <form className="dialog-form" onSubmit={onSubmit}>
          <input
            autoFocus
            aria-describedby="project-name-help"
            aria-invalid={error.length > 0}
            aria-label="Project name"
            maxLength={30}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="my-project"
            spellCheck="false"
            type="text"
            value={draftProjectName}
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
