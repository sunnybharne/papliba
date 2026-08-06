"use client";

import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { Organization, ThemeMode } from "../types";
import { UserMenu } from "./UserMenu";

type SidebarProps = {
  activeOrganization: Organization | undefined;
  activeProjects: string[];
  isOrganizationMenuOpen: boolean;
  isSidebarOpen: boolean;
  onCreateOrganization: () => void;
  onCreateProject: () => void;
  onCloseOrganizationMenu: () => void;
  onOpenGlobalSearch: () => void;
  onOpenDeleteOrganizationDialog: (organizationName: string) => void;
  onOpenSidebar: () => void;
  onOrganizationSearchChange: (value: string) => void;
  onResizeSidebar: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onSelectOrganization: (organizationName: string) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  onToggleOrganizationMenu: () => void;
  onToggleSidebar: () => void;
  organizationSearch: string;
  organizations: Organization[];
  themeMode: ThemeMode;
  visibleOrganizations: Organization[];
};

export function Sidebar({
  activeOrganization,
  activeProjects,
  isOrganizationMenuOpen,
  isSidebarOpen,
  onCreateOrganization,
  onCreateProject,
  onCloseOrganizationMenu,
  onOpenGlobalSearch,
  onOpenDeleteOrganizationDialog,
  onOpenSidebar,
  onOrganizationSearchChange,
  onResizeSidebar,
  onSelectOrganization,
  onThemeChange,
  onToggleOrganizationMenu,
  onToggleSidebar,
  organizationSearch,
  organizations,
  themeMode,
  visibleOrganizations,
}: SidebarProps) {
  const organizationSelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOrganizationMenuOpen) {
      return;
    }

    function closeWhenClickingAway(event: PointerEvent) {
      if (!organizationSelectRef.current?.contains(event.target as Node)) {
        onCloseOrganizationMenu();
      }
    }

    window.addEventListener("pointerdown", closeWhenClickingAway);

    return () => {
      window.removeEventListener("pointerdown", closeWhenClickingAway);
    };
  }, [isOrganizationMenuOpen, onCloseOrganizationMenu]);

  return (
    <aside
      aria-label="Papliba sidebar"
      className="sidebar"
      data-open={isSidebarOpen}
    >
      <div className="brand-row">
        <div className="brand-name">
          <strong>Papliba</strong>
        </div>
        <div className="brand-actions">
          <button
            aria-haspopup="dialog"
            aria-label="Global search"
            className="brand-icon-button"
            onClick={onOpenGlobalSearch}
            type="button"
          >
            <SearchIcon />
          </button>
          <button
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Open sidebar"}
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            type="button"
          >
            <SidebarToggleIcon isOpen={isSidebarOpen} />
          </button>
        </div>
      </div>

      <section className="sidebar-section">
        <div className="section-title">
          <span>Organization</span>
          <button
            aria-label="Create organization"
            className="icon-button"
            onClick={onCreateOrganization}
            type="button"
          >
            +
          </button>
        </div>

        <div className="organization-pill">
          {organizations.length === 0 ? (
            <EmptyOrganizationRow
              isSidebarOpen={isSidebarOpen}
              onOpenSidebar={onOpenSidebar}
            />
          ) : (
            <div className="organization-select" ref={organizationSelectRef}>
              {activeOrganization && (
                <div className="organization-active-row">
                  <button
                    aria-expanded={isSidebarOpen && isOrganizationMenuOpen}
                    className="organization-item organization-active"
                    onClick={onToggleOrganizationMenu}
                    type="button"
                  >
                    <SidebarItemIcon name="organization" />
                    <span className="organization-text">
                      <strong>{activeOrganization.name}</strong>
                    </span>
                    <span aria-hidden="true" className="organization-arrow" />
                  </button>

                  <DeleteOrganizationButton
                    onRequestDelete={onOpenDeleteOrganizationDialog}
                    organizationName={activeOrganization.name}
                  />
                </div>
              )}

              {isSidebarOpen && isOrganizationMenuOpen && (
                <div className="organization-list">
                  <input
                    aria-label="Search organizations"
                    className="organization-search"
                    onChange={(event) =>
                      onOrganizationSearchChange(event.target.value)
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
                      <OrganizationMenuRow
                        key={organization.name}
                        onOpenDeleteDialog={onOpenDeleteOrganizationDialog}
                        onSelect={onSelectOrganization}
                        organization={organization}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {activeOrganization && (
        <section className="sidebar-section project-section">
          <div className="section-title">
            <span>Projects</span>
            <button
              aria-label="Create project"
              className="icon-button"
              onClick={onCreateProject}
              type="button"
            >
              +
            </button>
          </div>

          {activeProjects.length === 0 ? (
            <p className="muted-copy">No projects yet.</p>
          ) : (
            <div className="thread-list">
              {activeProjects.map((project) => (
                <button className="thread-item" key={project} type="button">
                  <SidebarItemIcon name="project" />
                  <span>
                    <strong>{project}</strong>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="sidebar-footer">
        <UserMenu onThemeChange={onThemeChange} themeMode={themeMode} />
      </div>

      <div className="sidebar-resize-handle" onPointerDown={onResizeSidebar} />
    </aside>
  );
}

type EmptyOrganizationRowProps = {
  isSidebarOpen: boolean;
  onOpenSidebar: () => void;
};

function EmptyOrganizationRow({
  isSidebarOpen,
  onOpenSidebar,
}: EmptyOrganizationRowProps) {
  if (!isSidebarOpen) {
    return (
      <button
        aria-label="Open organizations"
        className="organization-empty"
        onClick={onOpenSidebar}
        type="button"
      >
        <SidebarItemIcon name="organization" />
      </button>
    );
  }

  return (
    <div className="organization-empty">
      <SidebarItemIcon name="organization" />
      <div>
        <strong>No organization</strong>
      </div>
    </div>
  );
}

type OrganizationMenuRowProps = {
  onOpenDeleteDialog: (organizationName: string) => void;
  onSelect: (organizationName: string) => void;
  organization: Organization;
};

function OrganizationMenuRow({
  onOpenDeleteDialog,
  onSelect,
  organization,
}: OrganizationMenuRowProps) {
  return (
    <div className="organization-menu-row">
      <button
        aria-label={organization.name}
        className="organization-item organization-menu-item"
        onClick={() => onSelect(organization.name)}
        type="button"
      >
        <SidebarItemIcon name="organization" />
        <span className="organization-text">
          <strong>{organization.name}</strong>
        </span>
      </button>

      <DeleteOrganizationButton
        onRequestDelete={onOpenDeleteDialog}
        organizationName={organization.name}
      />
    </div>
  );
}

type DeleteOrganizationButtonProps = {
  onRequestDelete: (organizationName: string) => void;
  organizationName: string;
};

function DeleteOrganizationButton({
  onRequestDelete,
  organizationName,
}: DeleteOrganizationButtonProps) {
  return (
    <div className="organization-actions">
      <button
        aria-label={`Delete ${organizationName}`}
        className="organization-delete-button"
        onClick={() => onRequestDelete(organizationName)}
        type="button"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="organization-delete-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

function SidebarToggleIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="sidebar-layout-icon"
      data-open={isOpen}
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect height="14" rx="3" width="18" x="3" y="5" />
      <rect
        className="sidebar-layout-icon-pane"
        height="10"
        rx="1.5"
        width="4"
        x="5.5"
        y="7"
      />
      <path className="sidebar-layout-icon-divider" d="M9 5v14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="brand-action-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

type SidebarItemIconName = "organization" | "project";

function SidebarItemIcon({ name }: { name: SidebarItemIconName }) {
  return (
    <svg
      aria-hidden="true"
      className={`sidebar-item-icon sidebar-item-icon-${name}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      {name === "organization" && (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M4 12h16" />
          <path d="M12 4a12 12 0 0 1 0 16" />
          <path d="M12 4a12 12 0 0 0 0 16" />
        </>
      )}
      {name === "project" && (
        <>
          <path d="M5 6h6l2 2h6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
          <path d="M8 13h8" />
        </>
      )}
    </svg>
  );
}
