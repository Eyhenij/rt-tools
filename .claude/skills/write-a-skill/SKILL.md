---
name: write-a-skill
description: Creating a new skill — one with no law above it — a showcase, a generator, a third-party service, a working technique of this tree. Load when asked to create, write or rewrite a skill. The shape of a rule and a pattern is not here — that is pattern spec-driven-rule.
---
<!-- rt-kit v0.42.0 · skills/write-a-skill.md · 9465682b39b4 · правится надстройкой, не здесь -->

# How a skill is created

Cold part: `pitfalls.md` — the whole text with samples and reasons.

## When to use

- A skill with no law above it is created, has grown, or is not loaded. A rule and a pattern —
  pattern `spec-driven-rule`.

## Order

1. Ask what is missing. 2. Write one file. 3. Show the owner. An owner's text is carried, not
   rewritten: it lands whole in the task folder, deviations are listed, a script compares it.

## The file

- **`name` and `description`, then "When to use" first.**
- **`description` is all the agent sees:** what it gives, "Load when…", which neighbour not to
  load — third person, up to 300 characters.
- **A deterministic operation becomes a script next to it.**
- **Split when not readable in full (about a hundred lines); links go one level deep.**
- **It is named in the gate map or called by another skill or role.**

## How a skill does harm

- **Retelling the tool's documentation.**
- **Duplicating a neighbour.**
- **What goes stale together with the code.**
- **Length.**

## Names and techniques

- An owner's text over a size limit is split into files, never shortened.
- A skill has at least one ready-made sample, not only an explanation.
- The descriptions check is green before the first commit, not only before push.
