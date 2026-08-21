# Papliba brand system

## Brand idea

**Calm Control Plane** is Papliba's visual and verbal identity.

Papliba should feel precise, composed, and operational. It is not an AI mascot, a magic
assistant, or a cyberpunk terminal. It is the place where a team can see agent work move through
clear routes and explicit checkpoints.

The brand promise is:

> Agent work that teams can see, review, and govern.

## Identity principles

- **Calm:** quiet surfaces, deliberate hierarchy, and restrained motion.
- **Controlled:** every important transition has an owner and a visible boundary.
- **Technical:** concrete language, honest status, and useful operational detail.
- **Human:** approvals and review are first-class product moments.

## Route/checkpoint mark

The Papliba mark shows three incoming signals converging at a controlled checkpoint before one
outgoing route. It represents orchestration, review, and a shared outcome.

Use the mark with the Papliba wordmark wherever space permits. Keep clear space around the mark
equal to at least one checkpoint diameter. Do not replace it with a letter tile, AI sparkle, robot,
or generic chat bubble.

## Color

### Company and marketing surfaces

| Token           | Value   | Role                                   |
| --------------- | ------- | -------------------------------------- |
| Midnight        | #080B16 | Primary marketing canvas               |
| Deep navy       | #0B1020 | Section and navigation surface         |
| Cool white      | #F7F8FF | Primary text on dark surfaces          |
| Muted blue-gray | #9CA8BF | Supporting text                        |
| Cobalt          | #5264FF | Primary action and active route        |
| Signal cyan     | #57D8FF | Information and streamed events        |
| Checkpoint teal | #43D9B1 | Connected, complete, or approved state |

Avoid cream paper, fluorescent lime, decorative grids, and color used without a text or shape cue.

### Product surfaces

The application may use a denser light operational canvas, but it shares cobalt, cyan, teal, the
route/checkpoint mark, typography, status meanings, and motion language with the marketing site.

## Typography

- **Geist Variable:** headlines, interface text, navigation, and body copy.
- **Geist Mono Variable:** versions, paths, runtime events, identifiers, and compact labels.

Both families are bundled with the site through @fontsource-variable version 5.3.0; the public
site does not depend on a third-party font request.

Headlines use moderate weight, tight tracking, and short line lengths. Labels use mono sparingly;
body paragraphs should remain easy to scan and must not be rendered as terminal output.

## Visual motif

The core motif is a routed line with checkpoints:

1. several signals or inputs enter;
2. they converge at a deliberate review point;
3. one clear route continues.

Use the motif to explain workflow, architecture, sequence, and status. Lines must carry meaning;
they are not a wallpaper pattern.

## Voice

Write in plain, concrete language:

- say what the product does before naming the technology;
- distinguish public documentation from private implementation;
- state what is validated, private, planned, or unavailable;
- prefer “review,” “approve,” “run,” and “evidence” over AI superlatives;
- never imply that the application is open source, publicly downloadable, production-ready, or a
  security sandbox unless that becomes true.

Canonical public status:

> Papliba is a local-first agent operations workspace. A working private alpha validates the local
> companion and Pi RPC boundary. This public repository contains the website and documentation,
> not the application source or a public download.

## Motion and accessibility

- Use motion to communicate system state, not to decorate every interaction.
- Keep hover and focus feedback between 120–180 ms.
- Reserve pulses for genuinely active connections or runs.
- Honor prefers-reduced-motion.
- Maintain visible keyboard focus and WCAG AA text contrast.
- Never communicate status with color alone.
