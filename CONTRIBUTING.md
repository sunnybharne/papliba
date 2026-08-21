# Contributing to Papliba

Papliba is in architecture preview. This public repository accepts contributions to the product website, public documentation, accessibility, and intentionally published interfaces.

The working application and enterprise modules are developed in separate private repositories. Do not submit product implementation, copied private code, customer information, credentials, or private design material here. Read [the repository boundaries](docs/REPOSITORY_BOUNDARIES.md) before proposing a substantial change.

## Before opening code

For a substantial public-site, documentation, or architecture change, open an issue first. Public architecture proposals do not authorize publishing the corresponding private implementation.

## Development setup

```bash
nvm use
npm ci
npm run dev
```

## Branches and commits

- Create a focused branch from `main`.
- Use [Conventional Commits](https://www.conventionalcommits.org/), for example `feat: improve mobile navigation` or `docs: clarify rpc ownership`.
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

1. the public documentation or website problem;
2. what changed and what did not;
3. how the change was verified;
4. whether documentation, roadmap, or architecture claims changed.

Screenshots are helpful for visible changes. Never include credentials, local workspace content, or private Pi session data.

## Architecture decisions

Only architecture decisions intentionally approved for public release belong under `docs/decisions/`. Private implementation decisions stay in the applicable private repository and must not be quoted or attached here.

## Conduct and security

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities through the private process in [SECURITY.md](SECURITY.md), not a public issue.
