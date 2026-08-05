"use client";

import { FormEvent, useRef, useState } from "react";

const themeStorageKey = "papliba-theme";

const themeOptions = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
] as const;

const userName = "Sunny Bharne";
const userInitials = "SB";
const organizationNameHelp =
  "Use 3-30 lowercase letters, numbers, or hyphens. No spaces.";
const organizationNameErrorMessage = "Enter a valid organization name.";
const organizationNamePattern = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

type ThemeMode = (typeof themeOptions)[number]["value"];

type Organization = {
  details: string;
  isPinned: boolean;
  name: string;
  projects: string[];
};

type OrganizationActionsProps = {
  isOpen: boolean;
  onRequestDelete: (organizationName: string) => void;
  onToggle: (organizationName: string) => void;
  organizationName: string;
};

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function applyThemeMode(themeMode: ThemeMode) {
  if (themeMode === "system") {
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.removeItem(themeStorageKey);
    return;
  }

  document.documentElement.dataset.theme = themeMode;
  window.localStorage.setItem(themeStorageKey, themeMode);
}

function MarkdownPreview({ markdown }: { markdown: string }) {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return (
      <div className="organization-markdown-preview">
        <p className="muted-copy">No organization details yet.</p>
      </div>
    );
  }

  return (
    <div className="organization-markdown-preview">
      {lines.map((line, index) => {
        if (line.startsWith("### ")) {
          return <h4 key={index}>{line.slice(4)}</h4>;
        }

        if (line.startsWith("## ")) {
          return <h3 key={index}>{line.slice(3)}</h3>;
        }

        if (line.startsWith("# ")) {
          return <h2 key={index}>{line.slice(2)}</h2>;
        }

        if (line.startsWith("- ")) {
          return (
            <p className="markdown-list-item" key={index}>
              <span aria-hidden="true" className="markdown-bullet" />
              {line.slice(2)}
            </p>
          );
        }

        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}

function OrganizationActions({
  isOpen,
  onRequestDelete,
  onToggle,
  organizationName,
}: OrganizationActionsProps) {
  return (
    <div className="organization-actions">
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Open ${organizationName} actions`}
        className="organization-more-button"
        onClick={() => onToggle(organizationName)}
        type="button"
      >
        <span aria-hidden="true">...</span>
      </button>

      {isOpen && (
        <div className="organization-action-menu" role="menu">
          <button
            className="danger-menu-item"
            onClick={() => onRequestDelete(organizationName)}
            role="menuitem"
            type="button"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

type UserMenuProps = {
  onThemeChange: (themeMode: ThemeMode) => void;
  themeMode: ThemeMode;
};

function UserMenu({ onThemeChange, themeMode }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  function changeTheme(nextThemeMode: ThemeMode) {
    onThemeChange(nextThemeMode);
    setIsOpen(false);
  }

  return (
    <div className="user-menu">
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open account menu"
        className="account-button"
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
        type="button"
      >
        <span className="avatar">{userInitials}</span>
        <span>
          <strong>{userName}</strong>
        </span>
      </button>

      {isOpen && (
        <div className="theme-menu" role="menu">
          <strong>Theme</strong>

          {themeOptions.map((option) => (
            <button
              aria-checked={themeMode === option.value}
              className="theme-option"
              data-active={themeMode === option.value}
              key={option.value}
              onClick={() => changeTheme(option.value)}
              role="menuitemradio"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const composerInputRef = useRef<HTMLInputElement>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const savedTheme = window.localStorage.getItem(themeStorageKey);

    return isThemeMode(savedTheme) ? savedTheme : "system";
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganizationName, setActiveOrganizationName] = useState("");
  const [draftOrganizationName, setDraftOrganizationName] = useState("");
  const [organizationSearch, setOrganizationSearch] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isOrganizationMenuOpen, setIsOrganizationMenuOpen] = useState(false);
  const [isOrganizationDialogOpen, setIsOrganizationDialogOpen] =
    useState(false);
  const [openOrganizationActionsName, setOpenOrganizationActionsName] =
    useState("");
  const [deleteOrganizationName, setDeleteOrganizationName] = useState("");
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [organizationNameError, setOrganizationNameError] = useState("");

  const activeOrganization = organizations.find(
    (organization) => organization.name === activeOrganizationName,
  );
  const hasOrganization = activeOrganization !== undefined;
  const activeOrganizationDisplayName = activeOrganization?.name ?? "";
  const activeOrganizationDetails = activeOrganization?.details ?? "";
  const activeProjects = activeOrganization?.projects ?? [];
  const appShellClassName = isSidebarOpen
    ? "app-shell"
    : "app-shell sidebar-collapsed";
  const visibleProjects = projectSearch.trim()
    ? activeProjects.filter((project) =>
        project.toLowerCase().includes(projectSearch.trim().toLowerCase()),
      )
    : activeProjects;
  const selectableOrganizations = organizations.filter(
    (organization) => organization.name !== activeOrganizationName,
  );
  const matchingOrganizations = organizationSearch.trim()
    ? selectableOrganizations.filter((organization) =>
        organization.name
          .toLowerCase()
          .includes(organizationSearch.trim().toLowerCase()),
      )
    : selectableOrganizations;
  const visibleOrganizations = [
    ...matchingOrganizations.filter((organization) => organization.isPinned),
    ...matchingOrganizations.filter((organization) => !organization.isPinned),
  ];
  const canDeleteOrganization =
    deleteOrganizationName.length > 0 &&
    deleteConfirmationText === deleteOrganizationName;

  function changeThemeMode(nextThemeMode: ThemeMode) {
    setThemeMode(nextThemeMode);
    applyThemeMode(nextThemeMode);
  }

  function openOrganizationDialog() {
    setDraftOrganizationName("");
    setOrganizationSearch("");
    setOpenOrganizationActionsName("");
    setDeleteOrganizationName("");
    setDeleteConfirmationText("");
    setOrganizationNameError("");
    setIsOrganizationMenuOpen(false);
    setIsOrganizationDialogOpen(true);
  }

  function toggleOrganizationMenu() {
    setOrganizationSearch("");
    setOpenOrganizationActionsName("");
    setIsOrganizationMenuOpen((currentIsOrganizationMenuOpen) => {
      return !currentIsOrganizationMenuOpen;
    });
  }

  function toggleOrganizationActions(organizationName: string) {
    setOpenOrganizationActionsName((currentOrganizationName) => {
      return currentOrganizationName === organizationName ? "" : organizationName;
    });
  }

  function openDeleteOrganizationDialog(organizationName: string) {
    setDeleteOrganizationName(organizationName);
    setDeleteConfirmationText("");
    setOpenOrganizationActionsName("");
  }

  function closeDeleteOrganizationDialog() {
    setDeleteOrganizationName("");
    setDeleteConfirmationText("");
  }

  function createOrganizationFromInput() {
    const nextOrganizationName = draftOrganizationName.trim();

    if (!organizationNamePattern.test(nextOrganizationName)) {
      setOrganizationNameError(organizationNameErrorMessage);
      return;
    }

    if (
      organizations.some(
        (organization) => organization.name === nextOrganizationName,
      )
    ) {
      setOrganizationNameError("An organization with this name already exists.");
      return;
    }

    setOrganizations((currentOrganizations) => [
      ...currentOrganizations,
      { details: "", isPinned: false, name: nextOrganizationName, projects: [] },
    ]);
    setActiveOrganizationName(nextOrganizationName);
    setDraftOrganizationName("");
    setOrganizationNameError("");
    setIsOrganizationDialogOpen(false);
    setIsOrganizationMenuOpen(false);
    setOpenOrganizationActionsName("");
    setOrganizationSearch("");
    setProjectSearch("");
  }

  function createOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createOrganizationFromInput();
  }

  function createProjectFromInput() {
    const nextProjectName = projectName.trim();

    if (!nextProjectName) {
      composerInputRef.current?.focus();
      return;
    }

    if (!activeOrganizationName) {
      return;
    }

    setOrganizations((currentOrganizations) =>
      currentOrganizations.map((organization) => {
        if (organization.name !== activeOrganizationName) {
          return organization;
        }

        return {
          ...organization,
          projects: [...organization.projects, nextProjectName],
        };
      }),
    );
    setProjectName("");
  }

  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createProjectFromInput();
  }

  function updateOrganizationDetails(nextDetails: string) {
    if (!activeOrganizationName) {
      return;
    }

    setOrganizations((currentOrganizations) =>
      currentOrganizations.map((organization) => {
        if (organization.name !== activeOrganizationName) {
          return organization;
        }

        return { ...organization, details: nextDetails };
      }),
    );
  }

  function toggleOrganizationPin(organizationName: string) {
    setOrganizations((currentOrganizations) =>
      currentOrganizations.map((organization) => {
        if (organization.name !== organizationName) {
          return organization;
        }

        return { ...organization, isPinned: !organization.isPinned };
      }),
    );
  }

  function deleteOrganization(organizationName: string) {
    const remainingOrganizations = organizations.filter((organization) => {
      return organization.name !== organizationName;
    });

    setOrganizations(remainingOrganizations);
    setOpenOrganizationActionsName("");
    setDeleteOrganizationName("");
    setDeleteConfirmationText("");
    setIsOrganizationMenuOpen(false);
    setOrganizationSearch("");
    setProjectName("");
    setProjectSearch("");

    if (organizationName === activeOrganizationName) {
      setActiveOrganizationName(remainingOrganizations[0]?.name ?? "");
    }
  }

  function confirmDeleteOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canDeleteOrganization) {
      return;
    }

    deleteOrganization(deleteOrganizationName);
  }

  return (
    <main className="shell">
      <section className={appShellClassName} aria-label="Papliba app">
          <aside
            aria-hidden={!isSidebarOpen}
            className="sidebar"
            data-open={isSidebarOpen}
            aria-label="Papliba sidebar"
          >
            <div className="brand-row">
              <div className="brand-name">
                <strong>Papliba</strong>
                <span>alpha</span>
              </div>
              <button
                aria-label="Collapse sidebar"
                className="sidebar-toggle"
                onClick={() => setIsSidebarOpen(false)}
                type="button"
              >
                ‹
              </button>
            </div>

            <div className="search-box">
              <input
                aria-label="Search projects"
                onChange={(event) => setProjectSearch(event.target.value)}
                placeholder="Search"
                type="search"
                value={projectSearch}
              />
              <kbd>⌘K</kbd>
            </div>

            <section className="sidebar-section">
              <div className="section-title">
                <span>Organization</span>
                <button
                  aria-label="Create organization"
                  className="icon-button"
                  onClick={openOrganizationDialog}
                  type="button"
                >
                  +
                </button>
              </div>

              <div className="organization-pill">
                {organizations.length === 0 ? (
                  <div className="organization-empty">
                    <span className="project-icon">P</span>
                    <div>
                      <strong>No organization</strong>
                      <small>Create one</small>
                    </div>
                  </div>
                ) : (
                  <div className="organization-select">
                    {activeOrganization && (
                      <div className="organization-active-row">
                        <button
                          aria-expanded={isOrganizationMenuOpen}
                          className="organization-item organization-active"
                          onClick={toggleOrganizationMenu}
                          type="button"
                        >
                          <span className="project-icon">P</span>
                          <span className="organization-text">
                            <strong>{activeOrganization.name}</strong>
                          </span>
                          <span
                            aria-hidden="true"
                            className="organization-arrow"
                          />
                        </button>

                        <button
                          aria-label={
                            activeOrganization.isPinned
                              ? "Unpin organization"
                              : "Pin organization"
                          }
                          aria-pressed={activeOrganization.isPinned}
                          className="pin-button"
                          data-pinned={activeOrganization.isPinned}
                          onClick={() =>
                            toggleOrganizationPin(activeOrganization.name)
                          }
                          type="button"
                        >
                          <span aria-hidden="true" className="pin-icon" />
                        </button>

                        <OrganizationActions
                          isOpen={
                            openOrganizationActionsName === activeOrganization.name
                          }
                          onRequestDelete={openDeleteOrganizationDialog}
                          onToggle={toggleOrganizationActions}
                          organizationName={activeOrganization.name}
                        />
                      </div>
                    )}

                    {isOrganizationMenuOpen && (
                      <div className="organization-list">
                        <input
                          aria-label="Search organizations"
                          className="organization-search"
                          onChange={(event) =>
                            setOrganizationSearch(event.target.value)
                          }
                          placeholder="Search organizations"
                          type="search"
                          value={organizationSearch}
                        />

                        {visibleOrganizations.length === 0 ? (
                          <p className="muted-copy">
                            {organizationSearch.trim()
                              ? "No organizations found."
                              : "No other organizations."}
                          </p>
                        ) : (
                          visibleOrganizations.map((organization) => (
                            <div
                              className="organization-menu-row"
                              key={organization.name}
                            >
                              <button
                                aria-label={
                                  organization.isPinned
                                    ? `${organization.name}, pinned`
                                    : organization.name
                                }
                                className="organization-item organization-menu-item"
                                data-active={
                                  organization.name === activeOrganizationName
                                }
                                data-pinned={organization.isPinned}
                                onClick={() => {
                                  setActiveOrganizationName(organization.name);
                                  setIsOrganizationMenuOpen(false);
                                  setOpenOrganizationActionsName("");
                                  setOrganizationSearch("");
                                  setProjectName("");
                                  setProjectSearch("");
                                }}
                                type="button"
                              >
                                <span className="project-icon">P</span>
                                <span className="organization-text">
                                  <strong>{organization.name}</strong>
                                </span>
                                {organization.isPinned && (
                                  <span
                                    aria-hidden="true"
                                    className="pinned-marker"
                                  >
                                    <span className="pin-icon" />
                                  </span>
                                )}
                              </button>

                              <OrganizationActions
                                isOpen={
                                  openOrganizationActionsName ===
                                  organization.name
                                }
                                onRequestDelete={openDeleteOrganizationDialog}
                                onToggle={toggleOrganizationActions}
                                organizationName={organization.name}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {hasOrganization && (
              <section className="sidebar-section project-section">
                <div className="section-title">
                  <span>Projects</span>
                  <button
                    aria-label="Create project"
                    className="icon-button"
                    onClick={createProjectFromInput}
                    type="button"
                  >
                    +
                  </button>
                </div>

                {visibleProjects.length === 0 ? (
                  <p className="muted-copy">No projects yet.</p>
                ) : (
                  <div className="thread-list">
                    {visibleProjects.map((project) => (
                      <button
                        className="thread-item"
                        key={project}
                        type="button"
                      >
                        <span className="status-dot complete" />
                        <span>
                          <strong>{project}</strong>
                          <small>Completed · just now</small>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            <div className="sidebar-footer">
              <UserMenu onThemeChange={changeThemeMode} themeMode={themeMode} />
            </div>
          </aside>

        <section className="workspace-panel">
          <header className="workspace-header">
            <div className="workspace-title-row">
              {!isSidebarOpen && (
                <button
                  aria-label="Open sidebar"
                  className="sidebar-toggle"
                  onClick={() => setIsSidebarOpen(true)}
                  type="button"
                >
                  <span aria-hidden="true" className="sidebar-open-icon" />
                </button>
              )}
              <div className="workspace-title-text">
                <span>
                  {hasOrganization ? "Organization" : "No active organization"}
                </span>
                <strong>
                  {hasOrganization
                    ? activeOrganizationDisplayName
                    : "Create an organization"}
                </strong>
              </div>
            </div>
          </header>

          <div className="content-area">
            {!hasOrganization ? (
              <section className="empty-card">
                <h1>No organization yet</h1>
                <p>Use the + button in the sidebar to create an organization.</p>
              </section>
            ) : (
              <>
                <section className="organization-details-panel">
                  <div className="organization-details-editor">
                    <div className="details-heading">
                      <span>Organization details</span>
                      <strong>Markdown</strong>
                    </div>

                    <textarea
                      aria-label="Organization details"
                      maxLength={2000}
                      onChange={(event) =>
                        updateOrganizationDetails(event.target.value)
                      }
                      placeholder={`# About this organization

Write goals, notes, or links here.

- First note
- Second note`}
                      value={activeOrganizationDetails}
                    />
                  </div>

                  <div className="organization-details-preview">
                    <div className="details-heading">
                      <span>Preview</span>
                      <strong>{activeOrganizationDisplayName}</strong>
                    </div>

                    <MarkdownPreview markdown={activeOrganizationDetails} />
                  </div>
                </section>

                {activeProjects.length === 0 ? (
                  <section className="empty-card">
                    <h1>No projects yet</h1>
                    <p>
                      Create your first project and it will appear in the
                      sidebar.
                    </p>
                  </section>
                ) : (
                  <section className="activity-list">
                    {visibleProjects.map((project) => (
                      <article className="activity-card" key={project}>
                        <div className="activity-heading">
                          <span className="status-dot complete" />
                          <div>
                            <strong>{project}</strong>
                            <small>
                              Project created in {activeOrganizationDisplayName}
                            </small>
                          </div>
                        </div>

                        <div className="summary-box">
                          <p>Ready for the next workflow step.</p>
                          <span>Local project</span>
                        </div>
                      </article>
                    ))}
                  </section>
                )}
              </>
            )}
          </div>

          {hasOrganization && (
            <form
              className="composer"
              id="create-project-form"
              onSubmit={createProject}
            >
              <input
                aria-label="Project name"
                ref={composerInputRef}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="Create a new project..."
                type="text"
                value={projectName}
              />
            </form>
          )}
        </section>
      </section>

      {isOrganizationDialogOpen && (
        <div className="dialog-backdrop">
          <section
            aria-labelledby="organization-dialog-title"
            className="dialog-panel"
            role="dialog"
          >
            <h2 id="organization-dialog-title">Create organization</h2>
            <p id="organization-name-help">{organizationNameHelp}</p>

            <form className="dialog-form" onSubmit={createOrganization}>
              <input
                autoFocus
                aria-label="Organization name"
                aria-describedby="organization-name-help"
                aria-invalid={organizationNameError.length > 0}
                maxLength={30}
                onChange={(event) => {
                  setDraftOrganizationName(event.target.value.toLowerCase());
                  setOrganizationNameError("");
                }}
                placeholder="my-organization"
                spellCheck="false"
                type="text"
                value={draftOrganizationName}
              />
              {organizationNameError && (
                <p className="dialog-error">
                  {organizationNameError}
                </p>
              )}

              <div className="dialog-actions">
                <button
                  className="ghost-button"
                  onClick={() => setIsOrganizationDialogOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  Create
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteOrganizationName && (
        <div className="dialog-backdrop">
          <section
            aria-labelledby="delete-organization-dialog-title"
            className="dialog-panel"
            role="dialog"
          >
            <h2 id="delete-organization-dialog-title">Delete organization</h2>
            <p>
              This will delete <strong>{deleteOrganizationName}</strong> and its
              local projects.
            </p>

            <form className="dialog-form" onSubmit={confirmDeleteOrganization}>
              <label
                className="delete-confirmation-label"
                htmlFor="delete-organization-confirmation"
              >
                Type <strong>{deleteOrganizationName}</strong> to confirm.
              </label>
              <input
                autoFocus
                aria-label="Organization name confirmation"
                id="delete-organization-confirmation"
                onChange={(event) =>
                  setDeleteConfirmationText(event.target.value)
                }
                placeholder={deleteOrganizationName}
                spellCheck="false"
                type="text"
                value={deleteConfirmationText}
              />

              <div className="dialog-actions">
                <button
                  className="ghost-button"
                  onClick={closeDeleteOrganizationDialog}
                  type="button"
                >
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
      )}
    </main>
  );
}
