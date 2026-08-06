import type { ThemeMode } from "./types";

export const themeStorageKey = "papliba-theme";

export const workspaceSchemaVersion = 1;

export const defaultWorkflowTriggerPosition = { x: 24, y: 26 };

export const themeOptions: { label: string; value: ThemeMode }[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export const userName = "Sunny Bharne";
export const userInitials = "SB";

export const projectNameHelp =
  "Use 3-30 lowercase letters, numbers, or hyphens. No spaces.";
export const projectNameErrorMessage = "Enter a valid project name.";
export const projectNamePattern = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export const workflowNameHelp = projectNameHelp;
export const workflowNameErrorMessage = "Enter a valid workflow name.";
export const workflowNamePattern = projectNamePattern;
