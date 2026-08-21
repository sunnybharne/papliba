# Security policy

## Supported versions

This public repository contains only the product website and documentation. Security fixes for
this repository apply to the latest code on `main`; the working application is maintained
separately in private alpha.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's **Security → Report a vulnerability** flow for the repository:

<https://github.com/sunnybharne/papliba/security/advisories/new>

Include the affected commit or version, impact, reproduction steps, and any suggested mitigation. Avoid including real credentials, private workspace files, or session transcripts.

The maintainers aim to acknowledge a complete report within seven days. Response timing is a target, not a service-level agreement.

## Private alpha companion

The companion is security-sensitive because it launches Pi and mediates workspace access. Before
public distribution, it must receive explicit review for loopback binding, origin validation,
browser authentication, path canonicalization, process isolation, message limits, secret
redaction, and safe shutdown.
