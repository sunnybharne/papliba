import type { Organization, ThemeMode } from "../types";
import { UserMenu } from "./UserMenu";

type SidebarProps = {
  activeOrganization: Organization | undefined;
  activeProjects: string[];
  isOrganizationMenuOpen: boolean;
  isSidebarOpen: boolean;
  onCreateOrganization: () => void;
  onCreateProject: () => void;
  onOpenDeleteOrganizationDialog: (organizationName: string) => void;
  onOpenSidebar: () => void;
  onOrganizationSearchChange: (value: string) => void;
  onSelectOrganization: (organizationName: string) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  onToggleOrganizationActions: (organizationName: string) => void;
  onToggleOrganizationMenu: () => void;
  onToggleOrganizationPin: (organizationName: string) => void;
  onToggleSidebar: () => void;
  openOrganizationActionsName: string;
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
  onOpenDeleteOrganizationDialog,
  onOpenSidebar,
  onOrganizationSearchChange,
  onSelectOrganization,
  onThemeChange,
  onToggleOrganizationActions,
  onToggleOrganizationMenu,
  onToggleOrganizationPin,
  onToggleSidebar,
  openOrganizationActionsName,
  organizationSearch,
  organizations,
  themeMode,
  visibleOrganizations,
}: SidebarProps) {
  return (
    <aside
      aria-label="Papliba sidebar"
      className="sidebar"
      data-open={isSidebarOpen}
    >
      <div className="brand-row">
        <div className="brand-name">
          <strong>Papliba</strong>
          <span>alpha</span>
        </div>
        <button
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Open sidebar"}
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          type="button"
        >
          <SidebarToggleIcon isOpen={isSidebarOpen} />
        </button>
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
            <div className="organization-select">
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

                  <PinButton
                    isPinned={activeOrganization.isPinned}
                    organizationName={activeOrganization.name}
                    onToggle={onToggleOrganizationPin}
                  />

                  <OrganizationActions
                    isOpen={
                      openOrganizationActionsName === activeOrganization.name
                    }
                    onRequestDelete={onOpenDeleteOrganizationDialog}
                    onToggle={onToggleOrganizationActions}
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
                        isActionsOpen={
                          openOrganizationActionsName === organization.name
                        }
                        key={organization.name}
                        onOpenDeleteDialog={onOpenDeleteOrganizationDialog}
                        onSelect={onSelectOrganization}
                        onToggleActions={onToggleOrganizationActions}
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
        aria-label="Open sidebar"
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
  isActionsOpen: boolean;
  onOpenDeleteDialog: (organizationName: string) => void;
  onSelect: (organizationName: string) => void;
  onToggleActions: (organizationName: string) => void;
  organization: Organization;
};

function OrganizationMenuRow({
  isActionsOpen,
  onOpenDeleteDialog,
  onSelect,
  onToggleActions,
  organization,
}: OrganizationMenuRowProps) {
  const label = organization.isPinned
    ? `${organization.name}, pinned`
    : organization.name;

  return (
    <div className="organization-menu-row">
      <button
        aria-label={label}
        className="organization-item organization-menu-item"
        data-pinned={organization.isPinned}
        onClick={() => onSelect(organization.name)}
        type="button"
      >
        <SidebarItemIcon name="organization" />
        <span className="organization-text">
          <strong>{organization.name}</strong>
        </span>
        {organization.isPinned && (
          <span aria-hidden="true" className="pinned-marker">
            <FavoriteIcon />
          </span>
        )}
      </button>

      <OrganizationActions
        isOpen={isActionsOpen}
        onRequestDelete={onOpenDeleteDialog}
        onToggle={onToggleActions}
        organizationName={organization.name}
      />
    </div>
  );
}

type PinButtonProps = {
  isPinned: boolean;
  onToggle: (organizationName: string) => void;
  organizationName: string;
};

function PinButton({ isPinned, onToggle, organizationName }: PinButtonProps) {
  return (
    <button
      aria-label={isPinned ? "Unpin organization" : "Pin organization"}
      aria-pressed={isPinned}
      className="pin-button"
      data-pinned={isPinned}
      onClick={() => onToggle(organizationName)}
      type="button"
    >
      <FavoriteIcon />
    </button>
  );
}

type OrganizationActionsProps = {
  isOpen: boolean;
  onRequestDelete: (organizationName: string) => void;
  onToggle: (organizationName: string) => void;
  organizationName: string;
};

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

function FavoriteIcon() {
  return (
    <svg
      aria-hidden="true"
      className="favorite-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
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

type SidebarItemIconName = "organization" | "project";

function SidebarItemIcon({ name }: { name: SidebarItemIconName }) {
  return (
    <svg
      aria-hidden="true"
      className="sidebar-item-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      {name === "organization" && (
        <>
          <rect height="14" rx="2.5" width="14" x="5" y="5" />
          <path d="M9 9h6M9 13h6M9 17h3" />
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
