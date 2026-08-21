# ADR-001: Use React, a local ASP.NET Core companion, and Pi RPC

- Status: Accepted — core boundary validated in private alpha
- Date: 2026-08-21
- Decision owners: Papliba maintainers

## Context

Papliba needs a visual browser interface while preserving local workspace control and Pi's existing coding-agent behavior. GitHub Pages can host a product preview but cannot launch a local Pi process. The user also wants React without Next.js and a meaningful place for C#.

## Decision

Use three explicit runtime boundaries:

1. a React, TypeScript, and Vite browser client for presentation;
2. an ASP.NET Core loopback companion for security, process lifecycle, and transport;
3. a managed `pi --mode rpc` child process for coding-agent behavior.

The companion exposes a local command and event API while preserving strict JSONL over Pi's
standard input/output streams.

## Consequences

Positive:

- Pi remains the source of truth for agent behavior;
- C# has a focused role aligned with its process and server strengths;
- the browser never receives direct filesystem or child-process authority;
- the React client remains independently testable and statically deployable;
- each protocol boundary can be versioned and observed.

Negative:

- the project has two implementation languages;
- the team must safely map and track the Pi RPC contract;
- local packaging is more complex than a static website;
- the local command/event API introduces a second protocol in addition to Pi JSONL.

## Validation

The private alpha validates the React, local companion, and Pi RPC boundary. Distribution
security, persistence, recovery, and packaging remain separate release requirements. If the C#
companion creates unacceptable packaging or maintenance cost, a Node companion using Pi's official
SDK remains the preferred fallback.
