# Security policy

## Supported versions

Papliba is currently an architecture preview and does not run an agent or local companion. Security fixes apply to the latest code on `main`.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's **Security → Report a vulnerability** flow for the repository:

<https://github.com/sunnybharne/papliba/security/advisories/new>

Include the affected commit or version, impact, reproduction steps, and any suggested mitigation. Avoid including real credentials, private workspace files, or session transcripts.

The maintainers aim to acknowledge a complete report within seven days. Response timing is a target, not a service-level agreement.

## Future local companion

The proposed companion will be security-sensitive because it launches Pi and mediates workspace access. Its implementation must receive explicit review for loopback binding, origin validation, browser authentication, path canonicalization, process isolation, message limits, secret redaction, and safe shutdown before a user-facing alpha is published.
