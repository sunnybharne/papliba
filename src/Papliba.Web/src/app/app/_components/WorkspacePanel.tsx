import type { FormEvent, RefObject } from "react";

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
              name={activeOrganizationName}
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
  name: string;
  onChange: (details: string) => void;
};

function OrganizationDetails({
  details,
  name,
  onChange,
}: OrganizationDetailsProps) {
  return (
    <section className="organization-details-panel">
      <div className="organization-details-editor">
        <div className="details-heading">
          <span>Organization details</span>
          <strong>Markdown</strong>
        </div>

        <textarea
          aria-label="Organization details"
          maxLength={2000}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`# About this organization

Write goals, notes, or links here.

- First note
- Second note`}
          value={details}
        />
      </div>

      <div className="organization-details-preview">
        <div className="details-heading">
          <span>Preview</span>
          <strong>{name}</strong>
        </div>

        <MarkdownPreview markdown={details} />
      </div>
    </section>
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
