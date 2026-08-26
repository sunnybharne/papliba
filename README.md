# Papliba

[![CI](https://github.com/sunnybharne/papliba/actions/workflows/ci.yml/badge.svg)](https://github.com/sunnybharne/papliba/actions/workflows/ci.yml)
[![GitHub Pages](https://github.com/sunnybharne/papliba/actions/workflows/pages.yml/badge.svg)](https://github.com/sunnybharne/papliba/actions/workflows/pages.yml)
[![Version](https://img.shields.io/badge/version-0.8.0--alpha.1-17211b)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-Apache--2.0-d9ff70)](LICENSE)

Papliba is an open-source, local-first control surface for the [Pi coding agent](https://pi.dev/). The product goal is to make agent activity visible, reviewable, and easier to shape without reimplementing Pi itself.

> [!IMPORTANT]
> Version `0.8.0-alpha.1` is an architecture preview. It contains the product website, documentation, proposed system design, and contributor tooling. It is **not** a working Pi interface yet.

## Explore

- [Product site](https://papliba.com/)
- [Product brief](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Contributing](CONTRIBUTING.md)

## Proposed architecture

```mermaid
flowchart LR
    UI[React + Vite client] <-->|Papliba events over SignalR / WebSocket| Bridge[ASP.NET Core local companion]
    Bridge <-->|Strict JSONL over stdin / stdout| Pi[pi --mode rpc]
    Pi --> Workspace[(Local workspace)]
    Pi --> Providers[Model providers]
```

React owns presentation and browser state. The proposed local companion owns security, process lifecycle, workspace policy, and event relay. Pi RPC remains responsible for sessions, tools, models, and agent behavior. SignalR/WebSocket is a Papliba design choice; JSONL over standard input/output is Pi's documented RPC boundary.

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

The GitHub Pages preview uses hash routes and Vite's `/papliba/` base path, so no server-side route fallback is required. The production Azure build sets `VITE_BASE_PATH=/` for the custom domain.

## Quality checks

```bash
npm run validate
```

The validation pipeline checks formatting, ESLint, TypeScript, Vitest, and the production build. Husky runs staged-file checks before commits and Commitlint enforces [Conventional Commits](https://www.conventionalcommits.org/).

## Project history

Papliba was rebooted after an earlier prototype. That prototype remains recoverable on the [`archive/v0.7.0`](https://github.com/sunnybharne/papliba/tree/archive/v0.7.0) branch; the current product direction starts with this architecture preview.

## License

Licensed under the [Apache License 2.0](LICENSE).
