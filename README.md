# Papliba

[![CI](https://github.com/sunnybharne/papliba/actions/workflows/ci.yml/badge.svg)](https://github.com/sunnybharne/papliba/actions/workflows/ci.yml)
[![GitHub Pages](https://github.com/sunnybharne/papliba/actions/workflows/pages.yml/badge.svg)](https://github.com/sunnybharne/papliba/actions/workflows/pages.yml)
[![Version](https://img.shields.io/badge/version-0.8.0--alpha.1-17211b)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-Apache--2.0-d9ff70)](LICENSE)

Papliba is a planned local-first control surface for the [Pi coding agent](https://pi.dev/). The product goal is to make agent activity visible, reviewable, and easier to shape without reimplementing Pi itself.

The current `main` branch contains Papliba's product website, public documentation, architecture, and roadmap. All new working application and enterprise modules are developed in separate private repositories and are not licensed under this repository's Apache 2.0 license.

> [!IMPORTANT]
> Version `0.8.0-alpha.1` is a website and architecture preview. It contains the public product website, documentation, proposed system design, and contributor tooling. It is **not** a working Pi interface yet.

## Explore

- [Product site](https://sunnybharne.github.io/papliba/)
- [Product brief](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Repository boundaries](docs/REPOSITORY_BOUNDARIES.md)
- [Roadmap](docs/ROADMAP.md)
- [Contributing](CONTRIBUTING.md)

## Repository model

| Repository           | Visibility | Responsibility                                                                                            |
| -------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| `papliba`            | Public     | Product site, public documentation, architecture, roadmap, and intentionally published interfaces         |
| `papliba-app`        | Private    | Working React application, ASP.NET Core companion, Pi RPC orchestration, and standard product packaging   |
| `papliba-enterprise` | Private    | Organization identity, policy, audit, administration, deployment, and commercial entitlement capabilities |

No code moves from a private repository into this public repository without an explicit intellectual-property, security, customer-data, secrets, and licensing review. See [the complete boundary policy](docs/REPOSITORY_BOUNDARIES.md).

## Proposed architecture

```mermaid
flowchart LR
    UI[React + Vite client] <-->|Papliba events over SignalR / WebSocket| Bridge[ASP.NET Core local companion]
    Bridge <-->|Strict JSONL over stdin / stdout| Pi[pi --mode rpc]
    Pi --> Workspace[(Local workspace)]
    Pi --> Providers[Model providers]
```

React owns presentation and browser state. The proposed local companion owns security, process lifecycle, workspace policy, and event relay. Pi RPC remains responsible for sessions, tools, models, and agent behavior. SignalR/WebSocket is a Papliba design choice; JSONL over standard input/output is Pi's documented RPC boundary. The diagram is public system documentation, not an indication that the private implementation is included here.

See [the full architecture decision](docs/ARCHITECTURE.md) for trust boundaries, message flow, alternatives, and open questions.

## Local development

Requirements:

- Node.js 24 LTS (`.nvmrc` pins the tested release)
- npm 11 or newer

```bash
git clone https://github.com/sunnybharne/papliba.git
cd papliba
nvm use
npm ci
npm run dev
```

The GitHub Pages site uses hash routes and Vite's `/papliba/` base path, so no server-side route fallback is required.

## Quality checks

```bash
npm run validate
```

The validation pipeline checks formatting, ESLint, TypeScript, Vitest, and the production build. Husky runs staged-file checks before commits and Commitlint enforces [Conventional Commits](https://www.conventionalcommits.org/).

## Project history

Papliba was rebooted after an earlier prototype. That Apache-2.0-licensed prototype remains recoverable on the [`archive/v0.7.0`](https://github.com/sunnybharne/papliba/tree/archive/v0.7.0) branch and in historical tags. It is not the new private Papliba application. All new product implementation begins in the private repositories described above.

## License scope

The files in this public repository are licensed under the [Apache License 2.0](LICENSE). That license does not apply to the separate `papliba-app` or `papliba-enterprise` repositories or grant rights to Papliba's private product implementation.
