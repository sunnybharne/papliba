# Changelog

All notable changes to Papliba will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [Unreleased]

## [0.3.0] - 2026-08-06

### Changed

- Added mouse resizing for the expanded app sidebar.
- Made sidebar, dropdown, and search animations snappier.
- Tightened the sidebar account popup rows, text, and avatar.
- Reduced the sidebar account popup text size.
- Replaced the repeated no-organization empty state with create guidance.
- Made the no-organization empty state smaller and quieter.
- Matched the workspace header title size to the sidebar organization row.
- Softened the workspace header title and icon color.
- Reduced the workspace header title weight.
- Darkened and shortened the sidebar username footer band.
- Added a darker sidebar footer band behind the username area.
- Reduced the workspace header height.
- Removed the workspace header options ellipsis.
- Matched sidebar account row hover radius with the no-organization row.
- Reduced the sidebar profile avatar size to match the menu icon scale.
- Simplified the sidebar account popup to Settings and Log out.
- Closed the sidebar account popup when clicking outside it.
- Made the sidebar account popup more compact.
- Matched the account menu profile row height to the other menu rows.
- Removed the help question mark from the sidebar username footer.
- Matched the sidebar username row height to the no-organization row.
- Restyled the sidebar account footer to match the flat reference layout.
- Reduced the sidebar organization folder icon size.
- Reduced the sidebar no-organization row hover radius.
- Tuned the sidebar add button color and glyph size.
- Changed the dark sidebar background to the sampled `#252525` tone.
- Matched the Papliba sidebar title color to the no-organization row.
- Matched the sidebar organization icon to the workspace header folder icon.
- Slightly brightened the sidebar no-organization row text color.
- Muted the sidebar no-organization row text color.
- Reduced the height of the sidebar no-organization row.
- Reduced the height of the no-organization empty card.
- Matched the sidebar search and collapse icon brightness.
- Removed the dropdown arrow from the Papliba sidebar title.
- Kept the app shell in two columns when the browser is resized.
- Updated the workspace header height, title styling, and icon layout.
- Added a global search popup opened from the sidebar search icon.
- Added a compact global search header to the sidebar.
- Restyled sidebar organization and project rows with simpler icon menu items.
- Restyled the lower-left account menu to match the compact reference layout.
- Removed extra subtext from the Settings menu item.
- Updated the app font stack and softened key sidebar font weights.
- Removed helper text from the no-organization empty state.
- Reduced the height of the organization and user rows in the sidebar.
- Replaced the default Next.js browser tab icon with a Papliba icon.
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
