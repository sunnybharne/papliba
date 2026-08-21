# Proposed architecture

Status: **proposed**

Decision record: [ADR-001](decisions/001-runtime-boundary.md)

Applies after: `0.8.0-alpha.1` architecture preview

## Context

The current repository builds a static React product and documentation site. GitHub Pages can host those assets, but a browser page cannot securely spawn a local Pi process, access a workspace, or hold operating-system authority.

The future application therefore needs a trusted local boundary. Pi already exposes a language-neutral RPC mode for applications, IDEs, and custom UIs. Papliba should use that contract rather than reconstruct the coding agent from lower-level packages.

The architecture is documented publicly, while its working React and ASP.NET Core implementation belongs to the private `papliba-app` repository. Organization-level commercial capabilities belong to `papliba-enterprise`. See [Repository boundaries](REPOSITORY_BOUNDARIES.md).

## System view

```mermaid
flowchart LR
    subgraph Browser[Browser process]
      UI[React + TypeScript UI]
      State[Presentation state]
      UI <--> State
    end

    subgraph Local[Papliba local companion]
      Transport[SignalR / WebSocket endpoint]
      Policy[Origin, workspace, and permission policy]
      Process[Pi process and session manager]
      Transport <--> Policy
      Policy <--> Process
    end

    subgraph Runtime[Pi runtime]
      RPC[pi --mode rpc]
      Tools[Tools and extensions]
      Sessions[Sessions and models]
      RPC <--> Tools
      RPC <--> Sessions
    end

    UI <-->|Typed Papliba commands and events| Transport
    Process <-->|LF-delimited JSON over stdin / stdout| RPC
    Tools --> Workspace[(Selected workspace)]
    Sessions --> Providers[Configured model providers]
```

## Responsibility boundaries

### React client

Owns:

- page layout, navigation, and browser state;
- session timeline and streaming presentation;
- tool, error, and file-change views;
- explicit user actions and approval surfaces;
- reconnect and process-state presentation.

Does not own:

- local credentials or arbitrary filesystem access;
- launching processes or shell commands;
- Pi session semantics;
- model-provider integrations.

### ASP.NET Core local companion

Owns:

- binding to loopback and validating the browser origin;
- starting, monitoring, and stopping the Pi child process;
- keeping Pi stdout dedicated to protocol JSONL and stderr dedicated to diagnostics;
- correlating RPC requests, responses, and streaming events;
- validating workspace selection and normalizing paths;
- translating between the browser transport and Pi RPC without inventing agent behavior;
- health, version, and compatibility information.

The browser transport is a Papliba decision. SignalR is the leading C# implementation choice because it supports streaming, reconnect behavior, and typed hubs; a plain WebSocket remains a valid simpler alternative until the technical spike is measured.

### Pi RPC process

Owns:

- the agent loop and state;
- prompts, abort, steering, and follow-up behavior;
- sessions, forks, compaction, and model selection;
- tool execution and extension UI requests;
- streaming agent and tool events.

Pi's documented RPC contract uses one JSON object per line over standard input and standard output. Papliba must never write diagnostics to the child's stdout stream.

## Example message flow

```mermaid
sequenceDiagram
    participant U as User
    participant R as React client
    participant C as Local companion
    participant P as Pi RPC

    U->>R: Submit prompt
    R->>C: prompt command + client request ID
    C->>P: JSONL prompt command
    P-->>C: response and streaming events
    C-->>R: ordered Papliba event envelope
    R-->>U: Visible activity timeline
```

The Papliba envelope should add transport metadata—connection ID, sequence number, timestamp, and protocol version—without mutating the original Pi payload.

## Security posture

The local companion will follow these defaults:

- listen on loopback only;
- reject unexpected `Origin` headers;
- use an ephemeral authentication token for the browser session;
- never accept a workspace path without canonicalization and explicit user selection;
- treat all browser input as untrusted;
- avoid storing provider credentials when Pi already owns them;
- expose process errors rather than retrying an unsafe action silently;
- apply resource limits and maximum message sizes;
- redact secrets from application logs.

Serving the production React assets from the companion under the same origin is preferable for the installable application. GitHub Pages remains appropriate for the public product and documentation preview only.

## Versioning the boundary

Papliba will version its browser-to-companion protocol separately from the product package. The initial handshake should return:

```json
{
  "paplibaVersion": "0.9.0-alpha.1",
  "protocolVersion": 1,
  "piVersion": "detected-at-runtime",
  "capabilities": ["prompt", "abort", "session-state"]
}
```

Capabilities allow the client to disable unsupported controls rather than guessing from version strings.

## Alternatives considered

### Next.js

Rejected for the current site. Static React and Vite are sufficient, produce a smaller conceptual surface, and deploy directly to GitHub Pages. A server-rendering framework would not solve the local-process boundary.

### Browser directly to Pi

Rejected. A regular browser cannot launch and supervise a local CLI process or safely own workspace authority.

### Rebuild on `pi-agent-core`

Rejected for the initial product. The lower-level package supplies the agent loop, but Papliba would then need to assemble Pi's tools, sessions, configuration, credentials, extensions, and workspace behavior itself.

### Node companion using the Pi SDK

Viable and officially recommended for TypeScript applications. The current proposal chooses ASP.NET Core so C# has a meaningful role and the local security/process boundary is explicit. The technical spike should revisit this choice if packaging or protocol maintenance is substantially worse than the Node alternative.

### Experimental Pi client/server transport

Deferred. Pi's experimental browser client and server packages are evolving and do not currently provide a standalone coding-agent service. Papliba should begin with the stable RPC contract.

## Primary references

- [Pi RPC mode](https://pi.dev/docs/latest/rpc)
- [Pi SDK](https://pi.dev/docs/latest/sdk)
- [Pi agent core](https://github.com/earendil-works/pi/blob/main/packages/agent/README.md)
- [Experimental Pi client](https://github.com/earendil-works/pi/blob/main/packages/client/README.md)
- [Experimental Pi server](https://github.com/earendil-works/pi/blob/main/packages/server/README.md)

SignalR/WebSocket and ASP.NET Core are Papliba design decisions inferred from the product requirements; they are not Pi RPC requirements.
