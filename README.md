# Papliba

Papliba is a local-first visual workflow builder.

The idea is simple:

```text
Trigger -> Worker -> Worker -> Output
```

A user creates small workers, connects them together, and lets the output of one worker become the input for the next worker.

Papliba is not starting as an AI chat app. It is starting as a structured workflow product. Some workers can be normal automation steps, and AI workers can be added later.

## Current Status

Papliba now includes a functional local workflow-building foundation:

- persisted projects and workflows backed by SQLite
- draggable workflow triggers and agent nodes
- drag-and-drop node connections and multi-node marquee selection
- workflow renaming, deletion, undo, and autosave
- project/workflow-scoped Python step folders with a `main.py` entry file
- Open in support for VS Code, Cursor, Finder, Terminal, Ghostty, and Xcode
- a Codex-powered Python script assistant with browser authentication
- local-first ASP.NET Core runner APIs

Version 0.6.0 remains an early product iteration. Workflow execution is still a frontend demonstration while the durable editing, file-management, and local-runner foundations are developed.

The web frontend uses Next.js + React + TypeScript. The local runner uses ASP.NET Core + SQLite.

Public project website:

```text
https://sunnybharne.github.io/papliba/
```

Documentation website:

```text
https://sunnybharne.github.io/papliba/docs/
```

Open the app at:

```text
http://127.0.0.1:3000/app
```

## Architecture

- [Papliba architecture diagram](docs/diagrams/papliba-architecture.drawio)

## Product Direction

Papliba can have two future versions:

```text
Papliba Personal
Runs locally for individual users.

Papliba Team / Enterprise
Runs on a server for companies and teams.
```

The personal version should be local-first so users can safely run workflows on their own machine. The team version can later add accounts, shared workflows, central provider keys, audit logs, and permissions.

## Development Setup

Install project tooling:

```bash
npm install
npm install --prefix src/Papliba.Web
```

Run validation:

```bash
npm run validate
```

Run the Next.js app:

```bash
npm run start:web
```

In another terminal, run the local runner:

```bash
npm run start:runner
```

The web app runs at `http://127.0.0.1:3000` and the runner listens on `http://127.0.0.1:5127`.

The runner stores the workspace in the operating system's local application-data directory. Set `PAPLIBA_DATA_DIRECTORY` when you need a custom location for development or testing.

The Python script assistant uses a logged-in terminal AI command through the local runner. By default the runner tries:

```bash
codex exec --skip-git-repo-check --sandbox read-only -
```

The assistant checks `codex login status` before it sends a request. When Codex
is signed out, Papliba shows a **Sign in with ChatGPT** action that starts
`codex login`; complete the official sign-in flow in the browser that opens.
Codex stores and refreshes its own credentials, and Papliba never reads or
stores them. Set `PAPLIBA_CODEX_COMMAND` if the Codex executable is not
available as `codex` on the runner's `PATH`.

Set `PAPLIBA_AI_COMMAND` before starting the runner if you want to use another local AI CLI.

## Commit Style

This project uses Conventional Commits.

Good examples:

```text
docs: add architecture diagram
chore: configure project tooling
feat: add workflow canvas
fix: correct diagram label
```

Husky runs local checks before commits and validates commit messages.

## Releases

- Technical changes are tracked in [CHANGELOG.md](CHANGELOG.md).
- Human-facing release notes live in [docs/releases](docs/releases).

## License

Papliba is open source under the Apache License 2.0.

See [LICENSE](LICENSE) for details.
