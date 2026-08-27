# Security Policy

Papliba is an early-stage local-first workflow builder. Security issues matter because workflow tools can eventually handle files, commands, provider API keys, tokens, and private work content.

## Supported Versions

Only the latest commit on `main` is currently supported.

## Reporting A Vulnerability

Please do not open a public issue for a security vulnerability.

Use GitHub's private vulnerability reporting if available. If that is not available, open a minimal public issue saying that you need a private security contact, without including exploit details.

## Security Expectations

- Do not commit real credentials, OAuth tokens, passwords, or private content.
- Do not store secrets in plain text.
- Use OS-backed secure storage for future credentials.
- Treat local files, workflow inputs, generated outputs, and command execution as untrusted until clearly approved.
