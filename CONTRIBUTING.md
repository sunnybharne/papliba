# Contributing to Papliba

Papliba is in architecture preview. Contributions that clarify the product boundary, test assumptions, improve accessibility, or prepare the connection spike are welcome.

## Before opening code

For a substantial feature or architecture change, open an issue first. This avoids implementing planned behavior before the boundary and acceptance criteria are agreed.

## Development setup

```bash
nvm use
npm ci
npm run dev
```

## Branches and commits

- Create a focused branch from `main`.
- Use [Conventional Commits](https://www.conventionalcommits.org/), for example `feat: add connection status card` or `docs: clarify rpc ownership`.
- Keep claims honest: use **available**, **proposed**, or **planned** consistently.
- Do not mix unrelated formatting or refactors into a feature.

Husky checks staged files before commit and validates the commit message. CI remains authoritative.

## Validate a change

```bash
npm run validate
```

For visual changes, check at least one wide and one narrow viewport, keyboard navigation, visible focus, and reduced-motion behavior.

## Pull requests

A pull request should explain:

1. the user or contributor problem;
2. what changed and what did not;
3. how the change was verified;
4. whether documentation, roadmap, or architecture claims changed.

Screenshots are helpful for visible changes. Never include credentials, local workspace content, or private Pi session data.

## Architecture decisions

Changes to a trust boundary, protocol, runtime, or security model require an ADR under `docs/decisions/`. Copy ADR-001's structure and describe the consequences and validation plan.

## Conduct and security

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities through the private process in [SECURITY.md](SECURITY.md), not a public issue.
