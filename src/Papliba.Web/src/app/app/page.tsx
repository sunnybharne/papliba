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
  name: string;
  projects: string[];
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
  const [organizationNameError, setOrganizationNameError] = useState("");

  const activeOrganization = organizations.find(
    (organization) => organization.name === activeOrganizationName,
  );
  const hasOrganization = activeOrganization !== undefined;
  const activeOrganizationDisplayName = activeOrganization?.name ?? "";
  const activeProjects = activeOrganization?.projects ?? [];
  const appShellClassName = isSidebarOpen
    ? "app-shell"
    : "app-shell sidebar-collapsed";
  const visibleProjects = projectSearch.trim()
    ? activeProjects.filter((project) =>
        project.toLowerCase().includes(projectSearch.trim().toLowerCase()),
      )
    : activeProjects;
  const visibleOrganizations = organizationSearch.trim()
    ? organizations.filter((organization) =>
        organization.name
          .toLowerCase()
          .includes(organizationSearch.trim().toLowerCase()),
      )
    : organizations;

  function changeThemeMode(nextThemeMode: ThemeMode) {
    setThemeMode(nextThemeMode);
    applyThemeMode(nextThemeMode);
  }

  function openOrganizationDialog() {
    setDraftOrganizationName("");
    setOrganizationSearch("");
    setOrganizationNameError("");
    setIsOrganizationMenuOpen(false);
    setIsOrganizationDialogOpen(true);
  }

  function toggleOrganizationMenu() {
    setOrganizationSearch("");
    setIsOrganizationMenuOpen((currentIsOrganizationMenuOpen) => {
      return !currentIsOrganizationMenuOpen;
    });
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
      { name: nextOrganizationName, projects: [] },
    ]);
    setActiveOrganizationName(nextOrganizationName);
    setDraftOrganizationName("");
    setOrganizationNameError("");
    setIsOrganizationDialogOpen(false);
    setIsOrganizationMenuOpen(false);
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

  return (
    <main className="shell">
      <section className={appShellClassName} aria-label="Papliba app">
        {isSidebarOpen && (
          <aside className="sidebar" aria-label="Papliba sidebar">
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
                        <span className="organization-arrow">⌄</span>
                      </button>
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
                          <p className="muted-copy">No organizations found.</p>
                        ) : (
                          visibleOrganizations.map((organization) => (
                            <button
                              className="organization-item"
                              data-active={
                                organization.name === activeOrganizationName
                              }
                              key={organization.name}
                              onClick={() => {
                                setActiveOrganizationName(organization.name);
                                setIsOrganizationMenuOpen(false);
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
                            </button>
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
        )}

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
                  ☰
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
            ) : activeProjects.length === 0 ? (
              <section className="empty-card">
                <h1>No projects yet</h1>
                <p>Create your first project and it will appear in the sidebar.</p>
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
    </main>
  );
}
