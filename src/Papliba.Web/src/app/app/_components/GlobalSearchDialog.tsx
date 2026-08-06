"use client";

import type { KeyboardEvent, ReactNode } from "react";

import type { Organization } from "../types";

type GlobalSearchDialogProps = {
  activeOrganizationName: string;
  onClose: () => void;
  onCreateOrganization: () => void;
  onQueryChange: (query: string) => void;
  onSelectOrganization: (organizationName: string) => void;
  organizations: Organization[];
  query: string;
};

type SearchAction = {
  icon: "folder" | "search" | "settings" | "write";
  label: string;
  shortcut: string;
};

const searchActions: SearchAction[] = [
  { icon: "write", label: "Create organization", shortcut: "⌘N" },
  { icon: "folder", label: "Open project", shortcut: "⌘O" },
  { icon: "search", label: "Search files", shortcut: "⌘P" },
  { icon: "settings", label: "General", shortcut: "⌘," },
];

export function GlobalSearchDialog({
  activeOrganizationName,
  onClose,
  onCreateOrganization,
  onQueryChange,
  onSelectOrganization,
  organizations,
  query,
}: GlobalSearchDialogProps) {
  const searchText = query.trim().toLowerCase();
  const visibleOrganizations = organizations.filter((organization) => {
    return (
      searchText.length === 0 ||
      organization.name.toLowerCase().includes(searchText)
    );
  });
  const visibleActions = searchActions.filter((action) => {
    return (
      searchText.length === 0 ||
      action.label.toLowerCase().includes(searchText)
    );
  });
  const hasOrganizationResults = visibleOrganizations.length > 0;

  function closeOnEscape(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      onClose();
    }
  }

  function createOrganization() {
    onClose();
    onCreateOrganization();
  }

  function selectOrganization(organizationName: string) {
    onSelectOrganization(organizationName);
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

        {visibleOrganizations.length > 0 && (
          <SearchGroup title="Organizations">
            {visibleOrganizations.map((organization, index) => (
              <button
                className="search-row"
                data-active={index === 0}
                key={organization.name}
                onClick={() => selectOrganization(organization.name)}
                type="button"
              >
                <SearchIcon name="folder" />
                <span>{organization.name}</span>
                <small>
                  {organization.name === activeOrganizationName
                    ? "current"
                    : "organization"}
                </small>
              </button>
            ))}
          </SearchGroup>
        )}

        <SearchGroup title="Suggested">
          {visibleActions.map((action, index) => (
            <button
              className="search-row"
              data-active={!hasOrganizationResults && index === 0}
              key={action.label}
              onClick={
                action.label === "Create organization"
                  ? createOrganization
                  : onClose
              }
              type="button"
            >
              <SearchIcon name={action.icon} />
              <span>{action.label}</span>
              <kbd>{action.shortcut}</kbd>
            </button>
          ))}
        </SearchGroup>
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
      {name === "search" && (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m16 16 4 4" />
        </>
      )}
      {name === "settings" && (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M19.8 7.5 17.2 9M6.8 15l-2.6 1.5" />
        </>
      )}
    </svg>
  );
}
