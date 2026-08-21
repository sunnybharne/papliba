# Product brief

## One sentence

Papliba is a planned local-first control surface for Pi that makes agent activity visible, reviewable, and easier to shape.

## Product status

`0.8.0-alpha.1` is an architecture preview. It includes the product and documentation site, design principles, proposed system architecture, public roadmap, and contributor foundation. It does not include a working agent connection, local companion, or interactive session UI.

## Problem

Pi is deliberately composable and works well from a terminal. A terminal becomes harder to scan when a user wants to follow a long-running session, review tool activity, explain the work to somebody else, compare file changes, or put clear approval moments around consequential operations.

The product opportunity is not to hide Pi's behavior. It is to give that behavior a legible visual surface.

## Intended users

Papliba initially targets:

1. developers who like Pi's agent harness but want a visual session surface;
2. people who need clearer review and approval moments than a terminal transcript provides;
3. contributors who want to experiment with agent UX without rebuilding an agent runtime.

## Product principles

### Local by default

Workspace access, process control, credentials, and session data should stay on the user's machine unless the user explicitly configures a remote service.

### Transparent

Tool calls, changes, errors, and important state transitions should be inspectable. The UI should not replace meaningful activity with an indefinite spinner.

### Pi remains Pi

Papliba should integrate through Pi's supported boundary rather than copy its agent loop, model handling, tools, sessions, or extension behavior.

### Human checkpoints belong in the flow

Review and approval surfaces should appear at the point where a consequential action is proposed. They should not be hidden in a global setting.

### Extensible after useful

The first application should prove one excellent session loop. Plugin systems and broad customization come after the core boundary is safe and usable.

## First useful application scope

The first usable alpha should be able to:

- connect to one local Pi RPC process;
- start or resume a session in an explicitly selected workspace;
- send a prompt and stream the response;
- render tool activity and errors in sequence;
- abort, steer, and follow up using supported RPC commands;
- show file changes before the user proceeds;
- expose connection and process state without hiding failures.

Out of scope for the first usable alpha:

- a hosted Papliba cloud service;
- multi-user collaboration;
- mobile clients;
- a general workflow marketplace;
- reimplementation of Pi extensions or model providers.

## Success criteria for the technical spike

The architecture advances only if a spike can demonstrate all of the following:

1. an ASP.NET Core process starts Pi in RPC mode and shuts it down cleanly;
2. stdout stays valid JSONL while stderr is captured separately;
3. request IDs and streaming events survive the relay without losing ordering;
4. the browser connects only through a loopback, origin-checked endpoint;
5. one session timeline renders from real Pi events;
6. disconnects and child-process failures are visible and recoverable.

## Naming

The product name is **Papliba**. Use title case in prose and lowercase `papliba` for package names, repository paths, and commands.
