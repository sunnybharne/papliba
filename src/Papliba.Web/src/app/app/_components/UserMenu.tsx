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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] =
    useState<SettingsSection>("account");

  const activeThemeLabel =
    themeOptions.find((option) => option.value === themeMode)?.label ?? "System";

  function openSettings(nextSettingsSection: SettingsSection) {
    setSettingsSection(nextSettingsSection);
    setIsOpen(false);
    setIsSettingsOpen(true);
  }

  return (
    <div className="user-menu">
      <div className="account-footer-row">
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
        <button aria-label="Help" className="help-button" type="button">
          ?
        </button>
      </div>

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
            </span>
          </button>

          <div className="account-menu-divider" />

          <AccountMenuItem icon="usage" label="Usage remaining" />
          <AccountMenuItem icon="pet" label="Show pet" />
          <AccountMenuItem icon="invite" label="Invite a friend" />

          <button
            className="account-menu-item"
            onClick={() => openSettings("account")}
            role="menuitem"
            type="button"
          >
            <MenuIcon name="settings" />
            <span>Settings</span>
            <span aria-hidden="true" className="menu-shortcut">
              ⌘,
            </span>
            <span aria-hidden="true" className="menu-chevron">
              ›
            </span>
          </button>

          <AccountMenuItem icon="logout" label="Log out" />
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

type AccountMenuItemProps = {
  icon: MenuIconName;
  label: string;
};

function AccountMenuItem({ icon, label }: AccountMenuItemProps) {
  return (
    <button className="account-menu-item" role="menuitem" type="button">
      <MenuIcon name={icon} />
      <span>{label}</span>
      {icon === "usage" && (
        <span aria-hidden="true" className="menu-chevron">
          ›
        </span>
      )}
    </button>
  );
}

type MenuIconName = "invite" | "logout" | "pet" | "settings" | "usage";

function MenuIcon({ name }: { name: MenuIconName }) {
  return (
    <svg
      aria-hidden="true"
      className="account-menu-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      {name === "usage" && (
        <>
          <path d="M4 13a8 8 0 0 1 16 0" />
          <path d="M12 13l4-4" />
        </>
      )}
      {name === "pet" && (
        <>
          <circle cx="7" cy="10" r="2" />
          <circle cx="12" cy="7" r="2" />
          <circle cx="17" cy="10" r="2" />
          <path d="M8 17c1.4-3 6.6-3 8 0 1 2.2-1 4-4 4s-5-1.8-4-4Z" />
        </>
      )}
      {name === "invite" && (
        <>
          <path d="M21 3 3 11l7 3 3 7 8-18Z" />
          <path d="m10 14 4-4" />
        </>
      )}
      {name === "settings" && (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M19.8 7.5 17.2 9M6.8 15l-2.6 1.5" />
        </>
      )}
      {name === "logout" && (
        <>
          <path d="M10 6H5v12h5" />
          <path d="M14 8l4 4-4 4" />
          <path d="M8 12h10" />
        </>
      )}
    </svg>
  );
}
