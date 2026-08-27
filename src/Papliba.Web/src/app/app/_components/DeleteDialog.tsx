import type { FormEvent } from "react";

type DeleteDialogProps = {
  canDelete: boolean;
  confirmationText: string;
  description: string;
  itemName: string;
  label: string;
  onCancel: () => void;
  onConfirmationChange: (confirmationText: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function DeleteDialog({
  canDelete,
  confirmationText,
  description,
  itemName,
  label,
  onCancel,
  onConfirmationChange,
  onSubmit,
}: DeleteDialogProps) {
  const inputId = `delete-${label}-confirmation`;
  const titleId = `delete-${label}-dialog-title`;

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <section
        aria-modal="true"
        aria-labelledby={titleId}
        className="dialog-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 id={titleId}>Delete {label}</h2>
        <p>{description}</p>

        <form className="dialog-form" onSubmit={onSubmit}>
          <label className="delete-confirmation-label" htmlFor={inputId}>
            Type <strong>{itemName}</strong> to confirm.
          </label>
          <input
            autoFocus
            aria-label={`${label} name confirmation`}
            id={inputId}
            onChange={(event) => onConfirmationChange(event.target.value)}
            placeholder={itemName}
            spellCheck="false"
            type="text"
            value={confirmationText}
          />

          <div className="dialog-actions">
            <button className="ghost-button" onClick={onCancel} type="button">
              Cancel
            </button>
            <button className="danger-button" disabled={!canDelete} type="submit">
              Delete
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
