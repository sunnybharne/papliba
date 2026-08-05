# Papliba

Papliba is a local-first visual workflow builder.

The idea is simple:

```text
Trigger -> Worker -> Worker -> Output
```

A user creates small workers, connects them together, and lets the output of one worker become the input for the next worker.

Papliba is not starting as an AI chat app. It is starting as a structured workflow product. Some workers can be normal automation steps, and AI workers can be added later.

## Current Status

This repository currently contains only the project foundation:

- project README
- architecture diagram
- changelog and release notes
- open-source license
- contribution and security docs
- Husky and commitlint setup

There is no application code yet. The first implementation will be added step by step.

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
```

Run validation:

```bash
npm run validate
```

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
