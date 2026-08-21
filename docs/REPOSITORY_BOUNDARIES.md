# Repository boundaries

Status: **active**

This document prevents proprietary product code from being accidentally published under the
Apache 2.0 license used by this repository.

## Public repository: `sunnybharne/papliba`

This repository owns:

- the Papliba product and documentation website;
- public architecture decisions and diagrams;
- the public roadmap and release claims;
- community health files and website contribution tooling;
- integration specifications intentionally approved for public release.

The Apache 2.0 license applies to files in this repository. A public architecture description does
not place a separate private implementation under that license.

## Private product repository: `sunnybharne/papliba-app`

The private product repository owns:

- the working React application;
- the ASP.NET Core local companion;
- the implemented browser-to-companion protocol;
- Pi RPC process and session orchestration;
- workspace security, local permissions, and product packaging.

## Private enterprise repository: `sunnybharne/papliba-enterprise`

The private enterprise repository owns optional organization-level capabilities, including
identity, authorization, policy, audit, administration, deployment, commercial entitlement, and
support tooling.

Enterprise modules should extend reviewed product interfaces rather than duplicate the standard
session loop.

## Publishing gate

Nothing moves from a private repository into this public repository by default. Publishing code,
documentation, protocol details, examples, or assets from a private repository requires explicit
review for:

1. copyright and third-party intellectual property;
2. licensing compatibility;
3. secrets and credentials;
4. customer or personal data;
5. security-sensitive implementation details;
6. commercial differentiation.

When in doubt, keep the material private until the repository owner approves its release.

## Contribution scope

Public contributions are welcome for the site, public documentation, accessibility, public
architecture discussion, and intentionally released interfaces. A contribution to this repository
must be original or appropriately licensed and must not reproduce code or confidential information
from either private repository.
