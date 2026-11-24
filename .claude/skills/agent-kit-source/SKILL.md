---
name: agent-kit-source
description: Editing the rules package itself: the order "edit, build, lay out", the two commands of this tree and sorting out the arrived proposals. Take it when a package resource is edited rather than a laid-out copy. The layout, the overrides and sending the cargo — the skill agent-kit.
---

# Editing the source of the rules layer

Cold part: `pitfalls.md` — the whole text, every section and article with its reasons.

## Order

- **Edit the source, build, lay out:** `pnpm run agent-kit:sync`, then `agent-kit:check`.
- **The place of an edit is held by a guard, not by memory.**
- **A write over a non-empty override is refused by a second guard.**
- **The build cache goes stale silently.**

## Pitfalls

- **A release is not started from here.**
- **A release names its metric.**
- **A resource the consumer does not carry out is never a package resource.**
- **A new package resource passes the spec, description and layout checks before its first commit.**
- **A shell block of a command or a pattern is run by its scenario in bash and in zsh.**
- **A replay whose judge did not run leaves the hook text unmeasured.**
- **A guard over shell commands names the harmless parts, not the writing ones.**
- **Nothing builds the package while the push set runs.**
- **A guard released by the owner's word is tested on a refusal and on an unrelated answer, not only
  on consent.**

## Names and techniques

- Called directly, the builder needs `rm -rf dist/agent-kit` and `--skip-nx-cache`.
- `/agent-kit-digest` and `/rules-review` bring findings to the owner and edit nothing.
- Release metric field: `<metric>: вверх`, `<metric>: вниз` or `нет: <reason>`.
