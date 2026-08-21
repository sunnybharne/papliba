# Product brief

## One sentence

Papliba is a local-first agent operations workspace that helps teams launch, follow, review, and
govern agent workflows.

## Product status

The public `0.8.0-alpha.1` repository contains the website and documentation. A separate working
private alpha validates the local companion, Pi RPC execution, live read-only activity, and an
explicit approval demonstration. It is not publicly downloadable or production-ready.

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

## Working private alpha

The private alpha currently demonstrates:

- a React operations workspace backed by a local companion;
- controlled read-only workflows;
- opt-in Pi RPC execution with live activity;
- an explicit approval demonstration and reviewable outcomes.

It is not publicly downloadable or production-ready. Durable records, authentication, stronger
process isolation, safe distribution, and mutating tools remain future work.

Out of scope for the current alpha:

- a hosted Papliba cloud service;
- multi-user collaboration;
- mobile clients;
- a general workflow marketplace;
- reimplementation of Pi extensions or model providers.

## Requirements before public distribution

The application should not become a public download until it can demonstrate all of the following:

1. durable run history and recovery survive application restarts;
2. authentication and origin controls protect the local boundary;
3. process isolation and workspace policy are reviewed for distribution;
4. the install and update path is safe, signed, and reversible;
5. runtime failures remain visible and recoverable;
6. mutating tools require explicit, inspectable approval.

## Naming

The product name is **Papliba**. Use title case in prose and lowercase `papliba` for package names, repository paths, and commands.
