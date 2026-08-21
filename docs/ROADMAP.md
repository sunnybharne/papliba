# Roadmap

Papliba plans work by evidence rather than invented dates. A phase advances when its exit criteria
are demonstrated and documented.

## Public foundation

Status: **available**

- [x] Publish the product direction and design principles.
- [x] Build the React and Vite product and documentation site.
- [x] Document the browser, companion, and Pi RPC boundaries.
- [x] Add tests, formatting, linting, type checking, CI, and Pages deployment.

Exit evidence: a public, versioned site whose claims distinguish public material, private
implementation, and future work.

## Local boundary

Status: **validated in private alpha**

- [x] Build a React operations workspace.
- [x] Manage a Pi RPC process through an ASP.NET Core companion.
- [x] Preserve commands and streamed runtime events.
- [x] Apply a controlled read-only workspace policy.

Exit evidence: a tested private application demonstrates the client, companion, and runtime
boundary without publishing private source.

## First useful loop

Status: **active private alpha**

- [x] Run controlled read-only workflows.
- [x] Display live activity and reviewable outcomes.
- [x] Demonstrate an explicit approval checkpoint.
- [x] Make live Pi RPC execution opt-in.

Exit evidence: a user can start, follow, approve, stop, and review a bounded workflow in the
private alpha.

## Distribution hardening

Status: **next**

- [ ] Add durable run history and restart recovery.
- [ ] Add authentication, origin controls, and stronger process isolation.
- [ ] Produce a safe installable package and update path.
- [ ] Design broader runtime controls and file-change approvals.

Exit evidence: the application passes a threat-model review and can be distributed, updated, and
recovered safely.

## Later

Status: **uncommitted direction**

- organization identity, policy, and audit administration;
- reusable workflows and governed presets;
- accessibility and performance hardening;
- cross-platform distribution and release operations.

Later items are not promises. They become versioned work only when the current evidence gate is
complete.
