"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

import type { Project, ThemeMode } from "../types";
import { UserMenu } from "./UserMenu";

type SidebarProps = {
  activeProjectName: string;
  isSidebarOpen: boolean;
  onCreateProject: () => void;
  onOpenDeleteProjectDialog: (projectName: string) => void;
  onOpenGlobalSearch: () => void;
  onOpenSidebar: () => void;
  onResizeSidebar: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onRenameProject: (projectName: string, nextName: string) => string;
  onSelectProject: (projectName: string) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  onToggleSidebar: () => void;
  projects: Project[];
  themeMode: ThemeMode;
};

export function Sidebar({
  activeProjectName,
  isSidebarOpen,
  onCreateProject,
  onOpenDeleteProjectDialog,
  onOpenGlobalSearch,
  onOpenSidebar,
  onResizeSidebar,
  onRenameProject,
  onSelectProject,
  onThemeChange,
  onToggleSidebar,
  projects,
  themeMode,
}: SidebarProps) {
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [renameProjectName, setRenameProjectName] = useState("");
  const [renameDraft, setRenameDraft] = useState("");
  const [renameError, setRenameError] = useState("");

  useEffect(() => {
    if (!renameProjectName) {
      return;
    }

    renameInputRef.current?.focus();
    renameInputRef.current?.select();
  }, [renameProjectName]);

  function startRename(projectName: string) {
    if (!isSidebarOpen) {
      onOpenSidebar();
      return;
    }

    setRenameProjectName(projectName);
    setRenameDraft(projectName);
    setRenameError("");
  }

  function cancelRename() {
    setRenameProjectName("");
    setRenameDraft("");
    setRenameError("");
  }

  function saveRename() {
    if (!renameProjectName) {
      return;
    }

    const error = onRenameProject(renameProjectName, renameDraft.trim());

    if (error) {
      setRenameError(error);
      renameInputRef.current?.focus();
      return;
    }

    cancelRename();
  }

  function saveRenameOnBlur() {
    if (!renameProjectName) {
      return;
    }

    const error = onRenameProject(renameProjectName, renameDraft.trim());

    if (error) {
      cancelRename();
      return;
    }

    cancelRename();
  }

  function handleRenameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveRename();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelRename();
    }
  }

  function updateRenameDraft(value: string) {
    setRenameDraft(value.toLowerCase());
    setRenameError("");
  }

  function selectProjectFromRow(projectName: string) {
    if (!isSidebarOpen) {
      onOpenSidebar();
    }

    onSelectProject(projectName);
  }

  return (
    <aside
      aria-label="Papliba sidebar"
      className="sidebar"
      data-open={isSidebarOpen}
    >
      <div className="brand-row">
        <div className="brand-name">
          <WorkflowMark />
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

        <div className="sidebar-list">
          {projects.length === 0 ? (
            <EmptyProjectRow
              isSidebarOpen={isSidebarOpen}
              onOpenSidebar={onOpenSidebar}
            />
          ) : (
            <div className="project-list">
              {projects.map((project) => (
                <ProjectRow
                  isActive={project.name === activeProjectName}
                  isRenaming={renameProjectName === project.name}
                  key={project.name}
                  onOpenDeleteDialog={onOpenDeleteProjectDialog}
                  onRenameStart={startRename}
                  onSelect={selectProjectFromRow}
                  project={project}
                  renameError={renameError}
                  renameInputRef={renameInputRef}
                  renameValue={renameDraft}
                  onRenameBlur={saveRenameOnBlur}
                  onRenameChange={updateRenameDraft}
                  onRenameKeyDown={handleRenameKeyDown}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="sidebar-footer">
        <UserMenu onThemeChange={onThemeChange} themeMode={themeMode} />
      </div>

      <div className="sidebar-resize-handle" onPointerDown={onResizeSidebar} />
    </aside>
  );
}

type RenameInputProps = {
  error: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onBlur: () => void;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  value: string;
};

function RenameInput({
  error,
  inputRef,
  onBlur,
  onChange,
  onKeyDown,
  value,
}: RenameInputProps) {
  return (
    <input
      aria-invalid={error.length > 0}
      aria-label="Rename project"
      className="rename-input"
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onKeyDown={onKeyDown}
      ref={inputRef}
      title={error}
      value={value}
    />
  );
}

type EmptyProjectRowProps = {
  isSidebarOpen: boolean;
  onOpenSidebar: () => void;
};

function EmptyProjectRow({ isSidebarOpen, onOpenSidebar }: EmptyProjectRowProps) {
  if (!isSidebarOpen) {
    return (
      <button
        aria-label="Open projects"
        className="sidebar-empty"
        onClick={onOpenSidebar}
        type="button"
      >
        <SidebarItemIcon />
      </button>
    );
  }

  return (
    <div className="sidebar-empty">
      <SidebarItemIcon />
      <div>
        <strong>No project</strong>
      </div>
    </div>
  );
}

type ProjectRowProps = {
  isActive: boolean;
  isRenaming: boolean;
  onOpenDeleteDialog: (projectName: string) => void;
  onRenameBlur: () => void;
  onRenameChange: (projectName: string) => void;
  onRenameKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onRenameStart: (projectName: string) => void;
  onSelect: (projectName: string) => void;
  project: Project;
  renameError: string;
  renameInputRef: RefObject<HTMLInputElement | null>;
  renameValue: string;
};

function ProjectRow({
  isActive,
  isRenaming,
  onOpenDeleteDialog,
  onRenameBlur,
  onRenameChange,
  onRenameKeyDown,
  onRenameStart,
  onSelect,
  project,
  renameError,
  renameInputRef,
  renameValue,
}: ProjectRowProps) {
  return (
    <div className="sidebar-menu-row" data-active={isActive}>
      {isRenaming ? (
        <div className="sidebar-item project-item rename-item">
          <SidebarItemIcon />
          <span className="sidebar-item-text">
            <RenameInput
              error={renameError}
              inputRef={renameInputRef}
              onBlur={onRenameBlur}
              onChange={onRenameChange}
              onKeyDown={onRenameKeyDown}
              value={renameValue}
            />
          </span>
        </div>
      ) : (
        <button
          aria-current={isActive ? "page" : undefined}
          aria-label={project.name}
          className="sidebar-item project-item"
          onClick={() => onSelect(project.name)}
          onDoubleClick={() => onRenameStart(project.name)}
          type="button"
        >
          <SidebarItemIcon />
          <span className="sidebar-item-text">
            <strong>{project.name}</strong>
          </span>
        </button>
      )}

      <DeleteItemButton
        itemName={project.name}
        onRequestDelete={onOpenDeleteDialog}
      />
    </div>
  );
}

type DeleteItemButtonProps = {
  itemName: string;
  onRequestDelete: (itemName: string) => void;
};

function DeleteItemButton({
  itemName,
  onRequestDelete,
}: DeleteItemButtonProps) {
  return (
    <div className="sidebar-item-actions">
      <button
        aria-label={`Delete ${itemName}`}
        className="sidebar-delete-button"
        onClick={() => onRequestDelete(itemName)}
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
      className="sidebar-delete-icon"
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

function WorkflowMark() {
  return (
    <svg aria-hidden="true" className="app-brand-mark" viewBox="0 0 28 28">
      <path d="M9 14c5 0 5-7 11-7M9 14c5 0 5 7 11 7" />
      <rect
        className="app-brand-mark-trigger"
        height="8"
        rx="2"
        width="8"
        x="3"
        y="10"
      />
      <rect
        className="app-brand-mark-step"
        height="7"
        rx="2"
        width="7"
        x="19"
        y="4"
      />
      <rect
        className="app-brand-mark-step"
        height="7"
        rx="2"
        width="7"
        x="19"
        y="17"
      />
    </svg>
  );
}

function SidebarItemIcon() {
  return (
    <svg
      aria-hidden="true"
      className="sidebar-item-icon sidebar-item-icon-project"
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect height="14" rx="3" width="16" x="4" y="6" />
      <path d="M9 6V4h6v2" />
      <path d="M4 11h16" />
    </svg>
  );
}
