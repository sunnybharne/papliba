"use client";

import type { KeyboardEvent, ReactNode } from "react";

import type { Project } from "../types";

type GlobalSearchDialogProps = {
  activeProjectName: string;
  onClose: () => void;
  onCreateProject: () => void;
  onQueryChange: (query: string) => void;
  onSelectProject: (projectName: string) => void;
  projects: Project[];
  query: string;
};

type SearchAction = {
  icon: "folder" | "write";
  label: string;
  shortcut: string;
};

const searchActions: SearchAction[] = [
  { icon: "write", label: "Create project", shortcut: "⌘N" },
];

export function GlobalSearchDialog({
  activeProjectName,
  onClose,
  onCreateProject,
  onQueryChange,
  onSelectProject,
  projects,
  query,
}: GlobalSearchDialogProps) {
  const searchText = query.trim().toLowerCase();
  const visibleProjects = projects.filter((project) => {
    return (
      searchText.length === 0 ||
      project.name.toLowerCase().includes(searchText)
    );
  });
  const visibleActions = searchActions.filter((action) => {
    return (
      searchText.length === 0 ||
      action.label.toLowerCase().includes(searchText)
    );
  });
  const hasProjectResults = visibleProjects.length > 0;

  function closeOnEscape(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      onClose();
    }
  }

  function createProject() {
    onClose();
    onCreateProject();
  }

  function selectProject(projectName: string) {
    onSelectProject(projectName);
    onClose();
  }

  return (
    <div
      className="search-backdrop"
      onKeyDown={closeOnEscape}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        aria-label="Global search"
        aria-modal="true"
        className="search-panel"
        role="dialog"
      >
        <input
          autoFocus
          aria-label="Search Papliba"
          className="global-search-input"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search Papliba"
          type="search"
          value={query}
        />

        {visibleProjects.length > 0 && (
          <SearchGroup title="Projects">
            {visibleProjects.map((project, index) => (
              <button
                className="search-row"
                data-active={index === 0}
                key={project.name}
                onClick={() => selectProject(project.name)}
                type="button"
              >
                <SearchIcon name="folder" />
                <span>{project.name}</span>
                <small>
                  {project.name === activeProjectName ? "current" : "project"}
                </small>
              </button>
            ))}
          </SearchGroup>
        )}

        {visibleActions.length > 0 && (
          <SearchGroup title="Suggested">
            {visibleActions.map((action, index) => (
              <button
                className="search-row"
                data-active={!hasProjectResults && index === 0}
                key={action.label}
                onClick={
                  action.label === "Create project" ? createProject : onClose
                }
                type="button"
              >
                <SearchIcon name={action.icon} />
                <span>{action.label}</span>
                <kbd>{action.shortcut}</kbd>
              </button>
            ))}
          </SearchGroup>
        )}
      </section>
    </div>
  );
}

type SearchGroupProps = {
  children: ReactNode;
  title: string;
};

function SearchGroup({ children, title }: SearchGroupProps) {
  return (
    <div className="search-group">
      <p>{title}</p>
      <div>{children}</div>
    </div>
  );
}

function SearchIcon({ name }: { name: SearchAction["icon"] }) {
  return (
    <svg
      aria-hidden="true"
      className="search-row-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      {name === "write" && (
        <>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </>
      )}
      {name === "folder" && (
        <path d="M4 7h6l2 2h8v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
      )}
    </svg>
  );
}
