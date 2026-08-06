import type { FormEvent } from "react";

import { organizationNameHelp } from "../constants";

type CreateOrganizationDialogProps = {
  draftOrganizationName: string;
  error: string;
  onCancel: () => void;
  onNameChange: (organizationName: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CreateOrganizationDialog({
  draftOrganizationName,
  error,
  onCancel,
  onNameChange,
  onSubmit,
}: CreateOrganizationDialogProps) {
  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <section
        aria-modal="true"
        aria-labelledby="organization-dialog-title"
        className="dialog-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 id="organization-dialog-title">Create organization</h2>
        <p id="organization-name-help">{organizationNameHelp}</p>

        <form className="dialog-form" onSubmit={onSubmit}>
          <input
            autoFocus
            aria-describedby="organization-name-help"
            aria-invalid={error.length > 0}
            aria-label="Organization name"
            maxLength={30}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="my-organization"
            spellCheck="false"
            type="text"
            value={draftOrganizationName}
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
