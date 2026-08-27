"use client";

import { useEffect, useRef, useState } from "react";

import { themeOptions, userInitials, userName } from "../constants";
import type { ThemeMode } from "../types";

type UserMenuProps = {
  onThemeChange: (themeMode: ThemeMode) => void;
  themeMode: ThemeMode;
};

type SettingsSection = "account" | "appearance";

export function UserMenu({ onThemeChange, themeMode }: UserMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] =
    useState<SettingsSection>("account");

  const activeThemeLabel =
    themeOptions.find((option) => option.value === themeMode)?.label ?? "System";

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }

    function closeWhenClickingAway(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", closeWhenClickingAway);

    return () => {
      window.removeEventListener("pointerdown", closeWhenClickingAway);
    };
  }, [isAccountMenuOpen]);

  function openSettings(nextSettingsSection: SettingsSection) {
    setSettingsSection(nextSettingsSection);
    setIsAccountMenuOpen(false);
    setIsSettingsOpen(true);
  }

  function toggleAccountMenu() {
    setIsAccountMenuOpen((currentIsOpen) => !currentIsOpen);
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <div className="account-footer-row">
        <button
          aria-expanded={isAccountMenuOpen}
          aria-haspopup="menu"
          aria-label="Open account menu"
          className="account-button"
          onClick={toggleAccountMenu}
          type="button"
        >
          <span className="avatar">{userInitials}</span>
          <span>
            <strong>{userName}</strong>
          </span>
        </button>
      </div>

      {isAccountMenuOpen && (
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

          <button
            className="account-menu-item"
            onClick={() => openSettings("account")}
            role="menuitem"
            type="button"
          >
            <MenuIcon name="settings" />
            <span>Settings</span>
            <span aria-hidden="true" className="menu-chevron">
              ›
            </span>
          </button>

          <button className="account-menu-item" role="menuitem" type="button">
            <MenuIcon name="logout" />
            <span>Log out</span>
          </button>
        </div>
      )}

      {isSettingsOpen && (
        <div
          className="dialog-backdrop"
          onClick={() => setIsSettingsOpen(false)}
        >
          <section
            aria-modal="true"
            aria-labelledby="settings-dialog-title"
            className="settings-window"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <aside className="settings-sidebar" aria-label="Settings sections">
              <div className="settings-user-card">
                <span className="avatar">{userInitials}</span>
                <span>
                  <strong>{userName}</strong>
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
                <h2 id="settings-dialog-title">
                  {settingsSection === "account" ? "Account" : "Appearance"}
                </h2>
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
                  <section className="settings-section">
                    <h3>Profile</h3>
                    <div className="settings-list">
                      <div className="settings-list-row">
                        <span className="settings-list-copy">
                          <strong>Name</strong>
                        </span>
                        <span className="settings-value">{userName}</span>
                      </div>
                    </div>
                  </section>
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

type MenuIconName = "logout" | "settings";

function MenuIcon({ name }: { name: MenuIconName }) {
  return (
    <svg
      aria-hidden="true"
      className="account-menu-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      {name === "settings" && (
        <>
          <path d="M4 7h10" />
          <path d="M18 7h2" />
          <circle cx="16" cy="7" r="2" />
          <path d="M4 17h2" />
          <path d="M10 17h10" />
          <circle cx="8" cy="17" r="2" />
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
