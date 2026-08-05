# Changelog

All notable changes to Papliba will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [Unreleased]

### Changed

- Refactored the app screen into smaller, easier-to-read UI components.
- Replaced the organization pin icon with a cleaner favorite marker.
- Replaced the sidebar collapse icon with a cleaner sidebar layout marker.
- Added open/closed animation to the sidebar layout icon.
- Hid collapsed sidebar create buttons and made the organization rail icon expand the sidebar.
- Simplified the no-organization workspace header text.

## [0.2.0] - 2026-08-05

### Added

- Added a GitHub Pages website with overview, changelog, and release notes pages.
- Added a static export configuration for publishing the Next.js app to GitHub Pages.
- Added the XML validation dependency to GitHub workflows.
- Added smoother sidebar collapse and dropdown menu motion.
- Replaced the collapsed sidebar hamburger with a cleaner sidebar icon.
- Added editable markdown details for organizations.
- Added organization pinning.
- Added an organization actions menu with delete support.
- Added a customer-facing marketing homepage.
- Added a dedicated docs home page.
- Added an account menu with nested theme choices and a settings window.

### Changed

- Hid the selected organization from the organization dropdown.
- Made the sidebar and organization search inputs more compact.
- Required typing the organization name before deleting it.
- Removed the extra sidebar project search field.
- Changed the collapsed sidebar into a compact icon rail.

## [0.1.0] - 2026-08-05

### Added

- Created the initial open-source project foundation.
- Added the first Papliba architecture diagram.
- Added changelog and release notes structure.
- Added Husky and commitlint for local commit checks.
- Switched the frontend from Vite to Next.js.
- Added the first organization and projects screen.
- Added a System, Light, and Dark theme switcher.
- Added a dark-first workspace layout for the web app.
- Added a collapsible sidebar to the workspace layout.
- Added support for creating and switching between multiple organizations.
- Added search inside the organization dropdown.
- Kept the sidebar visible during organization setup.

### Changed

- Collapsed the organization list into a dropdown selector.
- Changed organization creation to open from the sidebar add button in a dialog.
- Added organization name rules and validation.
- Kept the organization add button visible after an organization exists.
- Kept the bottom composer only for project creation after an organization exists.
- Removed the duplicate header action for creating a new organization.
- Hid the sidebar Projects section until an organization exists.
- Simplified the account menu so it only contains the working theme choices.
- Updated the font stack and spacing to make the workspace feel lighter.
- Made the bottom account row and project composer more compact.
- Removed project counts from organization rows to keep the selector simpler.
