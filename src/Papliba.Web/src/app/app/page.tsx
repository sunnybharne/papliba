"use client";

import { type FormEvent, useRef, useState } from "react";

import { CreateOrganizationDialog } from "./_components/CreateOrganizationDialog";
import { DeleteOrganizationDialog } from "./_components/DeleteOrganizationDialog";
import { Sidebar } from "./_components/Sidebar";
import { WorkspacePanel } from "./_components/WorkspacePanel";
import {
  organizationNameErrorMessage,
  organizationNamePattern,
  themeStorageKey,
} from "./constants";
import type { Organization, ThemeMode } from "./types";

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

function getVisibleOrganizations(
  organizations: Organization[],
  activeOrganizationName: string,
  organizationSearch: string,
) {
  const searchText = organizationSearch.trim().toLowerCase();
  const matchingOrganizations = organizations
    .filter((organization) => organization.name !== activeOrganizationName)
    .filter((organization) => {
      return (
        searchText.length === 0 ||
        organization.name.toLowerCase().includes(searchText)
      );
    });

  return [
    ...matchingOrganizations.filter((organization) => organization.isPinned),
    ...matchingOrganizations.filter((organization) => !organization.isPinned),
  ];
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isOrganizationMenuOpen, setIsOrganizationMenuOpen] = useState(false);
  const [isOrganizationDialogOpen, setIsOrganizationDialogOpen] =
    useState(false);
  const [openOrganizationActionsName, setOpenOrganizationActionsName] =
    useState("");
  const [deleteOrganizationName, setDeleteOrganizationName] = useState("");
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [organizationNameError, setOrganizationNameError] = useState("");

  const activeOrganization = organizations.find((organization) => {
    return organization.name === activeOrganizationName;
  });
  const hasOrganization = activeOrganization !== undefined;
  const activeOrganizationDetails = activeOrganization?.details ?? "";
  const activeProjects = activeOrganization?.projects ?? [];
  const appShellClassName = isSidebarOpen
    ? "app-shell"
    : "app-shell sidebar-collapsed";
  const visibleOrganizations = getVisibleOrganizations(
    organizations,
    activeOrganizationName,
    organizationSearch,
  );
  const canDeleteOrganization =
    deleteOrganizationName.length > 0 &&
    deleteConfirmationText === deleteOrganizationName;

  function changeThemeMode(nextThemeMode: ThemeMode) {
    setThemeMode(nextThemeMode);
    applyThemeMode(nextThemeMode);
  }

  function toggleSidebar() {
    setIsSidebarOpen((currentIsSidebarOpen) => !currentIsSidebarOpen);
  }

  function openSidebar() {
    setIsSidebarOpen(true);
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

  function closeOrganizationDialog() {
    setIsOrganizationDialogOpen(false);
  }

  function updateDraftOrganizationName(organizationName: string) {
    setDraftOrganizationName(organizationName.toLowerCase());
    setOrganizationNameError("");
  }

  function toggleOrganizationMenu() {
    setOrganizationSearch("");
    setOpenOrganizationActionsName("");
    setIsOrganizationMenuOpen((currentIsOrganizationMenuOpen) => {
      return !currentIsOrganizationMenuOpen;
    });
  }

  function openSidebarOrToggleOrganizationMenu() {
    if (!isSidebarOpen) {
      openSidebar();
      return;
    }

    toggleOrganizationMenu();
  }

  function selectOrganization(organizationName: string) {
    setActiveOrganizationName(organizationName);
    setIsOrganizationMenuOpen(false);
    setOpenOrganizationActionsName("");
    setOrganizationSearch("");
    setProjectName("");
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

    if (organizations.some((org) => org.name === nextOrganizationName)) {
      setOrganizationNameError("An organization with this name already exists.");
      return;
    }

    setOrganizations((currentOrganizations) => [
      ...currentOrganizations,
      {
        details: "",
        isPinned: false,
        name: nextOrganizationName,
        projects: [],
      },
    ]);
    setActiveOrganizationName(nextOrganizationName);
    setDraftOrganizationName("");
    setOrganizationNameError("");
    setIsOrganizationDialogOpen(false);
    setIsOrganizationMenuOpen(false);
    setOpenOrganizationActionsName("");
    setOrganizationSearch("");
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
        <Sidebar
          activeOrganization={activeOrganization}
          activeProjects={activeProjects}
          isOrganizationMenuOpen={isOrganizationMenuOpen}
          isSidebarOpen={isSidebarOpen}
          onCreateOrganization={openOrganizationDialog}
          onCreateProject={createProjectFromInput}
          onOpenDeleteOrganizationDialog={openDeleteOrganizationDialog}
          onOpenSidebar={openSidebar}
          onOrganizationSearchChange={setOrganizationSearch}
          onSelectOrganization={selectOrganization}
          onThemeChange={changeThemeMode}
          onToggleOrganizationActions={toggleOrganizationActions}
          onToggleOrganizationMenu={openSidebarOrToggleOrganizationMenu}
          onToggleOrganizationPin={toggleOrganizationPin}
          onToggleSidebar={toggleSidebar}
          openOrganizationActionsName={openOrganizationActionsName}
          organizationSearch={organizationSearch}
          organizations={organizations}
          themeMode={themeMode}
          visibleOrganizations={visibleOrganizations}
        />

        <WorkspacePanel
          activeOrganizationDetails={activeOrganizationDetails}
          activeOrganizationName={activeOrganizationName}
          activeProjects={activeProjects}
          hasOrganization={hasOrganization}
          onProjectNameChange={setProjectName}
          onProjectSubmit={createProject}
          onUpdateOrganizationDetails={updateOrganizationDetails}
          projectInputRef={composerInputRef}
          projectName={projectName}
        />
      </section>

      {isOrganizationDialogOpen && (
        <CreateOrganizationDialog
          draftOrganizationName={draftOrganizationName}
          error={organizationNameError}
          onCancel={closeOrganizationDialog}
          onNameChange={updateDraftOrganizationName}
          onSubmit={createOrganization}
        />
      )}

      {deleteOrganizationName && (
        <DeleteOrganizationDialog
          canDeleteOrganization={canDeleteOrganization}
          confirmationText={deleteConfirmationText}
          organizationName={deleteOrganizationName}
          onCancel={closeDeleteOrganizationDialog}
          onConfirmationChange={setDeleteConfirmationText}
          onSubmit={confirmDeleteOrganization}
        />
      )}
    </main>
  );
}
