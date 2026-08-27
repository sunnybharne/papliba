# Changelog

All notable changes to Papliba will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [Unreleased]

## [0.7.0] - 2026-08-07

### Added

- Added timestamped Python run logs beside `main.py`, with per-step retention settings defaulting to the latest 10 runs.
- Added Command/Ctrl+C and Command/Ctrl+V duplication for selected workflow nodes, triggers, and their internal connections.
- Added draggable input endpoints for moving an existing workflow connection from one target node to another.
- Refined the Codex chat composer with a file-context strip, read-only access and default-model indicators, compact controls, and a circular send action.
- Made applied Codex edits refresh an open Python file preview immediately and pulse the updated node once with the green energy effect.
- Changed workflow execution to follow only nodes reachable from the pressed trigger and visibly mark unreachable nodes as disconnected.
- Fixed drag-selection rectangles so they begin at the pointer instead of the canvas origin.
- Added parallel execution batches for sibling workflow branches, while downstream joins wait for all reachable parents.
- Added grouped dragging for Shift-selected and marquee-selected workflow nodes while preserving their relative spacing.

## [0.6.0] - 2026-08-07

### Added

- Added multiple draggable, independently editable Manual Triggers per workflow.
- Added inline renaming for Manual Triggers and Python steps.
- Added selectable, deletable, and reconnectable workflow edges, including Manual Trigger connections.
- Added sequential execution feedback across triggers, connections, and running nodes.
- Added a fast, curve-aligned energy pulse that travels inside active workflow edges.
- Added double-click access to the Python file-content preview.
- Added Python syntax coloring to the read-only file-content preview.
- Restored python-script as a draggable workflow canvas tool.
- Made the Python Codex chat contextual and collapsible from the canvas.
- Added official OpenAI, Claude Code, and Python tool icons with consistent hover feedback.
- Added folder-based Python steps with `main.py` entry files and room for `.env`, dependencies, helper modules, and other assets.

### Changed

- Renamed the Codex workflow tool and node type to OpenAI.
- Adopted OpenAI green as the company accent across workflow tools and selection states.
- Moved the workflow Run action into each Manual Trigger as a compact play control.
- Simplified Python details to focus on syntax-colored file content and runtime input/output.
- Made each Python step folder the workspace root for VS Code, Cursor, Finder, terminals, and Codex.
- Made Python step rename and trash operations preserve the complete step folder.

### Fixed

- Kept workflow selection states consistent across Manual Trigger and Python nodes.
- Prevented concurrent Python file migration requests from racing while converting flat scripts into step folders.

## [0.5.0] - 2026-08-07

### Added

- Added a loopback-only ASP.NET Core local runner.
- Added revisioned SQLite workspace persistence.
- Added frontend workspace hydration, debounced autosave, and save status.
- Added confirmed workflow deletion from workflow cards.
- Added inline workflow renaming from workflow cards.
- Made manual workflow triggers draggable with persisted positions and undo.
- Added manual trigger deletion and restoration from the workflow toolbar.
- Added a draggable Python script tool that creates a persisted workflow step.
- Added persistent Python files with an Open in VS Code action on Python nodes.
- Organized Python files by project and workflow with automatic legacy migration.
- Moved Python files to recoverable trash when their workflow nodes are deleted.
- Named new Python script files with the `python-script.py` format.
- Added a right-side Codex-style Python script assistant panel.
- Added review-first apply flow for AI-generated Python script changes.
- Added Codex CLI authentication status and browser sign-in from the Python assistant.
- Moved workflow node details behind a three-dot action and added Python file previews.
- Replaced the Python node's VS Code action with an Open in application menu.
- Limited new workflow node creation to Codex and Claude Code agent nodes.

### Changed

- New workflows now start without a default trigger and prompt users to drag one from the toolbar.
- Clear the selected workflow node when clicking the trigger, toolbar, or canvas.
- Made the Open in picker compact, with its icon indicating the selected application used as the shared default action.
- Replaced click-to-connect workflow nodes with a live drag-and-drop connection interaction.
- Replaced placeholder Open in badges with the official installed application icons.
- Added marquee selection and keyboard deletion for multiple workflow nodes.
- Simplified the app hierarchy to Projects and Workflows.
- Kept a starter project for new users instead of asking them to create every layer first.
- Made the global search dialog more compact.
- Changed project creation to use the sidebar add button and a popup.
- Matched the workspace header project icon with the sidebar project icon.
- Listed projects one after another in the sidebar instead of using a dropdown.
- Added project deletion in the sidebar.
- Added project name rules.
- Removed project README/Markdown editing from the app.
- Focused the selected project screen on workflows.
- Tightened the collapsed sidebar width and made collapsed item clicks reopen the sidebar.
- Added double-click rename for projects.
- Added workflow creation inside selected projects.
- Added a basic workflow canvas with rectangle nodes, dragging, and node connections.
- Added a back button from workflow view to the project view.
- Added workflow undo with a toolbar button and Command/Ctrl+Z.
- Added rectangle deletion in the workflow canvas.
- Added a rectangle details panel that opens from the workflow canvas.
- Added a frontend-only workflow run demo with a trigger, Python step, AI step, statuses, and outputs.

## [0.4.0] - 2026-08-06

### Changed

- Closed the Settings window when clicking outside it.
- Made the Settings window match the compact account menu style.
- Simplified account menu code and removed stale sidebar styles.
- Clarified the architecture diagram with the web UI and local .NET runner split.
- Changed the selected theme state to use the neutral app selection style.
- Matched the create organization dialog to the compact popup style.
- Unified popup surface colors across account, settings, search, and organization dialogs.
- Made created organization rows compact and replaced pin/actions controls with a direct delete icon.
- Replaced the organization folder icon with a globe icon.
- Added subtle right-side contrast to the Settings window.
- Darkened the Settings content side to better match the app workspace.
- Grouped account settings into one compact list with a divider.
- Extended the active organization highlight across the delete icon and hid the dropdown arrow until hover.
- Restyled account settings as a grouped settings card with row descriptions.
- Removed the Profile type row from Account settings.
- Removed the Account name helper text and compacted the row.
- Replaced the split organization details editor and preview with one edit/save panel.
- Replaced the organization details Edit text button with an icon button.
- Closed the organization dropdown when clicking outside it.
- Moved the organization name into the editable README content.

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
