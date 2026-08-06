import type { FormEvent } from "react";

type DeleteOrganizationDialogProps = {
  canDeleteOrganization: boolean;
  confirmationText: string;
  organizationName: string;
  onCancel: () => void;
  onConfirmationChange: (confirmationText: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function DeleteOrganizationDialog({
  canDeleteOrganization,
  confirmationText,
  organizationName,
  onCancel,
  onConfirmationChange,
  onSubmit,
}: DeleteOrganizationDialogProps) {
  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <section
        aria-modal="true"
        aria-labelledby="delete-organization-dialog-title"
        className="dialog-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 id="delete-organization-dialog-title">Delete organization</h2>
        <p>
          This will delete <strong>{organizationName}</strong> and its local
          projects.
        </p>

        <form className="dialog-form" onSubmit={onSubmit}>
          <label
            className="delete-confirmation-label"
            htmlFor="delete-organization-confirmation"
          >
            Type <strong>{organizationName}</strong> to confirm.
          </label>
          <input
            autoFocus
            aria-label="Organization name confirmation"
            id="delete-organization-confirmation"
            onChange={(event) => onConfirmationChange(event.target.value)}
            placeholder={organizationName}
            spellCheck="false"
            type="text"
            value={confirmationText}
          />

          <div className="dialog-actions">
            <button className="ghost-button" onClick={onCancel} type="button">
              Cancel
            </button>
            <button
              className="danger-button"
              disabled={!canDeleteOrganization}
              type="submit"
            >
              Delete
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
