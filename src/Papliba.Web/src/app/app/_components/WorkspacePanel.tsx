import { useState, type FormEvent, type RefObject } from "react";

import { MarkdownPreview } from "./MarkdownPreview";

type WorkspacePanelProps = {
  activeOrganizationDetails: string;
  activeOrganizationName: string;
  activeProjects: string[];
  hasOrganization: boolean;
  onProjectNameChange: (projectName: string) => void;
  onProjectSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateOrganizationDetails: (details: string) => void;
  projectInputRef: RefObject<HTMLInputElement | null>;
  projectName: string;
};

export function WorkspacePanel({
  activeOrganizationDetails,
  activeOrganizationName,
  activeProjects,
  hasOrganization,
  onProjectNameChange,
  onProjectSubmit,
  onUpdateOrganizationDetails,
  projectInputRef,
  projectName,
}: WorkspacePanelProps) {
  return (
    <section className="workspace-panel">
      <WorkspaceHeader
        activeOrganizationName={activeOrganizationName}
        hasOrganization={hasOrganization}
      />

      <div className={hasOrganization ? "content-area" : "content-area empty"}>
        {!hasOrganization ? (
          <section className="empty-card organization-empty-card">
            <h1>Create organization</h1>
            <p>Click the + button to create your first organization.</p>
          </section>
        ) : (
          <>
            <OrganizationDetails
              details={activeOrganizationDetails}
              key={activeOrganizationName}
              onChange={onUpdateOrganizationDetails}
            />

            <ProjectsList
              organizationName={activeOrganizationName}
              projects={activeProjects}
            />
          </>
        )}
      </div>

      {hasOrganization && (
        <form
          className="composer"
          id="create-project-form"
          onSubmit={onProjectSubmit}
        >
          <input
            aria-label="Project name"
            onChange={(event) => onProjectNameChange(event.target.value)}
            placeholder="Create a new project..."
            ref={projectInputRef}
            type="text"
            value={projectName}
          />
        </form>
      )}
    </section>
  );
}

type WorkspaceHeaderProps = {
  activeOrganizationName: string;
  hasOrganization: boolean;
};

function WorkspaceHeader({
  activeOrganizationName,
  hasOrganization,
}: WorkspaceHeaderProps) {
  return (
    <header className="workspace-header">
      {hasOrganization && (
        <div className="workspace-title-row">
          <WorkspaceFolderIcon />
          <strong>{activeOrganizationName}</strong>
        </div>
      )}
    </header>
  );
}

function WorkspaceFolderIcon() {
  return (
    <svg
      aria-hidden="true"
      className="workspace-title-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M4 7h6l2 2h8v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

type OrganizationDetailsProps = {
  details: string;
  onChange: (details: string) => void;
};

function OrganizationDetails({
  details,
  onChange,
}: OrganizationDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftDetails, setDraftDetails] = useState(details);

  function startEditing() {
    setDraftDetails(details);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraftDetails(details);
    setIsEditing(false);
  }

  function saveDetails() {
    onChange(draftDetails);
    setIsEditing(false);
  }

  return (
    <section className="organization-details-panel">
      <div className="organization-details-card">
        <div className="details-header">
          <div className="details-heading">
            <span>README</span>
          </div>

          {isEditing ? (
            <div className="details-actions">
              <button
                className="ghost-button"
                onClick={cancelEditing}
                type="button"
              >
                Cancel
              </button>
              <button
                className="primary-button"
                onClick={saveDetails}
                type="button"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              aria-label="Edit organization details"
              className="details-icon-button"
              onClick={startEditing}
              type="button"
            >
              <EditIcon />
            </button>
          )}
        </div>

        {isEditing ? (
          <textarea
            aria-label="Organization README"
            maxLength={2000}
            onChange={(event) => setDraftDetails(event.target.value)}
            placeholder={`# organization-name

Write notes, goals, or links here.

- First note
- Second note`}
            value={draftDetails}
          />
        ) : (
          <MarkdownPreview markdown={details} />
        )}
      </div>
    </section>
  );
}

function EditIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="m14.5 5.5 4 4L8 20H4v-4L14.5 5.5Z" />
      <path d="m13 7 4 4" />
    </svg>
  );
}

type ProjectsListProps = {
  organizationName: string;
  projects: string[];
};

function ProjectsList({ organizationName, projects }: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <section className="empty-card">
        <h1>No projects yet</h1>
        <p>Create your first project and it will appear in the sidebar.</p>
      </section>
    );
  }

  return (
    <section className="activity-list">
      {projects.map((project) => (
        <article className="activity-card" key={project}>
          <div className="activity-heading">
            <span className="status-dot complete" />
            <div>
              <strong>{project}</strong>
              <small>Project created in {organizationName}</small>
            </div>
          </div>

          <div className="summary-box">
            <p>Ready for the next workflow step.</p>
            <span>Local project</span>
          </div>
        </article>
      ))}
    </section>
  );
}
