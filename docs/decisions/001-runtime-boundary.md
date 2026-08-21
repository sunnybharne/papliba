# ADR-001: Use React, a local ASP.NET Core companion, and Pi RPC

- Status: Proposed
- Date: 2026-08-21
- Decision owners: Papliba maintainers

## Context

Papliba needs a visual browser interface while preserving local workspace control and Pi's existing coding-agent behavior. GitHub Pages can host a product preview but cannot launch a local Pi process. The user also wants React without Next.js and a meaningful place for C#.

## Decision

Use three explicit runtime boundaries:

1. a React, TypeScript, and Vite browser client for presentation;
2. an ASP.NET Core loopback companion for security, process lifecycle, and transport;
3. a managed `pi --mode rpc` child process for coding-agent behavior.

The companion will relay typed Papliba events over SignalR or WebSocket and strict JSONL over Pi's standard input/output streams.

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
- SignalR/WebSocket introduces a second protocol in addition to Pi JSONL.

## Validation

ADR-001 remains proposed until the `0.9` connection spike meets the exit criteria in the [roadmap](../ROADMAP.md). If the C# companion creates unacceptable packaging or maintenance cost, a Node companion using Pi's official SDK is the preferred fallback.
