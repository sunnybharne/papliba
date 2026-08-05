"use client";

import { useState } from "react";

import { themeOptions, userInitials, userName } from "../constants";
import type { ThemeMode } from "../types";

type UserMenuProps = {
  onThemeChange: (themeMode: ThemeMode) => void;
  themeMode: ThemeMode;
};

type SettingsSection = "account" | "appearance";

export function UserMenu({ onThemeChange, themeMode }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] =
    useState<SettingsSection>("account");

  const activeThemeLabel =
    themeOptions.find((option) => option.value === themeMode)?.label ?? "System";

  function changeTheme(nextThemeMode: ThemeMode) {
    onThemeChange(nextThemeMode);
    setIsThemeMenuOpen(false);
    setIsOpen(false);
  }

  function openSettings(nextSettingsSection: SettingsSection) {
    setSettingsSection(nextSettingsSection);
    setIsOpen(false);
    setIsThemeMenuOpen(false);
    setIsSettingsOpen(true);
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
        <div className="account-menu" role="menu">
          <button
            className="account-menu-user"
            onClick={() => openSettings("account")}
            role="menuitem"
            type="button"
          >
            <span className="avatar">{userInitials}</span>
            <span>
              <strong>{userName}</strong>
              <small>Local profile</small>
            </span>
          </button>

          <button
            aria-expanded={isThemeMenuOpen}
            aria-haspopup="menu"
            className="account-menu-item"
            onClick={() =>
              setIsThemeMenuOpen(
                (currentIsThemeMenuOpen) => !currentIsThemeMenuOpen,
              )
            }
            role="menuitem"
            type="button"
          >
            <span>Theme</span>
            <small>{activeThemeLabel}</small>
            <span aria-hidden="true" className="menu-chevron">
              ›
            </span>
          </button>

          {isThemeMenuOpen && (
            <div className="theme-choice-list">
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

          <button
            className="account-menu-item"
            onClick={() => openSettings("account")}
            role="menuitem"
            type="button"
          >
            <span>Settings</span>
            <span aria-hidden="true" className="menu-chevron">
              ›
            </span>
          </button>
        </div>
      )}

      {isSettingsOpen && (
        <div className="dialog-backdrop">
          <section
            aria-modal="true"
            aria-labelledby="settings-dialog-title"
            className="settings-window"
            role="dialog"
          >
            <aside className="settings-sidebar" aria-label="Settings sections">
              <div className="settings-user-card">
                <span className="avatar">{userInitials}</span>
                <span>
                  <strong>{userName}</strong>
                  <small>Local profile</small>
                </span>
              </div>

              <button
                className="settings-nav-item"
                data-active={settingsSection === "account"}
                onClick={() => setSettingsSection("account")}
                type="button"
              >
                Account
              </button>
              <button
                className="settings-nav-item"
                data-active={settingsSection === "appearance"}
                onClick={() => setSettingsSection("appearance")}
                type="button"
              >
                Appearance
              </button>
            </aside>

            <section className="settings-content">
              <header className="settings-titlebar">
                <div>
                  <span>Settings</span>
                  <h2 id="settings-dialog-title">
                    {settingsSection === "account" ? "Account" : "Appearance"}
                  </h2>
                </div>
                <button
                  aria-label="Close settings"
                  className="settings-close-button"
                  onClick={() => setIsSettingsOpen(false)}
                  type="button"
                >
                  ×
                </button>
              </header>

              {settingsSection === "account" ? (
                <div className="settings-panel">
                  <div className="settings-row">
                    <span>Name</span>
                    <strong>{userName}</strong>
                  </div>
                  <div className="settings-row">
                    <span>Profile type</span>
                    <strong>Local profile</strong>
                  </div>
                </div>
              ) : (
                <div className="settings-panel">
                  <div className="settings-row">
                    <span>Theme</span>
                    <strong>{activeThemeLabel}</strong>
                  </div>
                  <div className="settings-theme-grid">
                    {themeOptions.map((option) => (
                      <button
                        className="settings-theme-option"
                        data-active={themeMode === option.value}
                        key={option.value}
                        onClick={() => onThemeChange(option.value)}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </section>
        </div>
      )}
    </div>
  );
}
