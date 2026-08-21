# Roadmap

Papliba plans work by evidence rather than invented dates. A phase advances when its exit criteria are demonstrated and documented.

This public roadmap communicates product direction and verifiable release status. Implementation after the architecture preview occurs in private product repositories; public roadmap detail will not expose proprietary code, customer information, or sensitive security design.

## 0.8 — Architecture preview

Status: **available**

- [x] Publish the product direction and design principles.
- [x] Replace the discarded prototype with a clean React and Vite foundation.
- [x] Document the proposed browser, companion, and Pi RPC boundaries.
- [x] Add tests, formatting, linting, type checking, Git hooks, CI, and Pages deployment.
- [x] Preserve the discarded prototype on `archive/v0.7.0`.

Exit evidence: a public, versioned product site and repository whose claims distinguish current capabilities from planned work.

## 0.9 — Connection spike

Status: **next**

- [ ] Create a minimal ASP.NET Core loopback companion.
- [ ] Start and stop `pi --mode rpc` without corrupting stdout JSONL.
- [ ] Correlate commands, responses, and ordered streaming events.
- [ ] Implement origin checks and an ephemeral browser token.
- [ ] Render one real read-only Pi session timeline in React.
- [ ] Document packaging, performance, and failure behavior.

Exit evidence: a reproducible demo with automated protocol tests and a recorded threat-model review.

## 0.10 — Private alpha

Status: **planned**

- [ ] Send prompts and display streamed text.
- [ ] Support abort, steering, and follow-up controls.
- [ ] Render tool activity and failures in sequence.
- [ ] Inspect file changes in an explicitly selected workspace.
- [ ] Start or resume a session.
- [ ] Produce an installable local development package.

Exit evidence: invited users can complete a real coding session and recover from a companion or Pi process restart.

## Later

Status: **uncommitted direction**

- extension contribution points;
- reusable views and workflow presets;
- cross-platform installers and updates;
- accessibility and performance hardening;
- broader session and model controls.

Later items are not promises. They should become versioned work only after the first useful session loop is validated.
