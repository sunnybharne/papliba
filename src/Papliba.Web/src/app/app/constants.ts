import type { ThemeMode } from "./types";

export const themeStorageKey = "papliba-theme";

export const themeOptions: { label: string; value: ThemeMode }[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export const userName = "Sunny Bharne";
export const userInitials = "SB";

export const organizationNameHelp =
  "Use 3-30 lowercase letters, numbers, or hyphens. No spaces.";
export const organizationNameErrorMessage = "Enter a valid organization name.";
export const organizationNamePattern = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
