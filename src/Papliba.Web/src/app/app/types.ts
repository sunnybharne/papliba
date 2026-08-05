export type ThemeMode = "system" | "light" | "dark";

export type Organization = {
  details: string;
  isPinned: boolean;
  name: string;
  projects: string[];
};
