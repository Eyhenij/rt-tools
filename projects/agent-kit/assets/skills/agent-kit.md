---
name: agent-kit
description: The portable rules layer of the agent — laws, rules, hooks and checks shipped by the package and adjusted by the tree through overrides. Load when a file with the rt-kit header is edited, the package is upgraded or the layout audit refuses. The shape of a new skill — write-a-skill.
---

# The portable rules layer

Cold part: `pitfalls.md` — traps; `pitfalls-2.md` — every section whole. Samples: `agent-kit-extend`.

## When to use

- A file with the `rt-kit` header is edited, the package is bumped, or `sync --check` refused.

## Where what is set up

Gate map — `gate-map.sh`; names, commands — `project.sh`; paths — `checks.json`; a laid-out text —
`overrides/<resource>`; take, drop, roles off, traits — `.claude/rt-kit.json`; mechanism — package.

## Order

- **A layout is an edit of the tree:** set up the work before `sync`.
- **A bump and its layout go in one change.** Snapshot old assets first, then `doctor --since`; the
  layout puts the installed edition — on a mismatch install and repeat.
- **A file whose body matches the package is re-laid, never refused as hand-edited.**
- **A hook declaration lands with its hook; an entry only for a dispatcher on disk, removed with it.**
- **A laid-out file is edited by its source or an override, never in place.** A formatter rewrite
  is a hand edit too: remove the copy.
- **An override is edited by section.** A section whose reason the new edition fixed is lifted.

## What the package ships and what stays with the tree

- **`skip` does not close the boundary.** A richer local resource goes to `skip`, with a removal
  proposal up; a tree with its own hooks skips all and takes resource by resource.
- **The tree's own rule has the package shape:** law, companion, gate-map branch.

## Feedback upwards

- **Observations** go to `.claude/rt-kit/observations/` by the guards; digest `agent-kit stats`,
  cost `agent-kit cost`, own records `agent-kit fate`.
- **Proposals** come by `/skill-curator` after a task and `/feedback` mid-work; the text is by
  `cargo-writer`, judged by the send.
- **A record has place, reason, closest (exact quote or «нет») and what it closes, never empty.**
- **A proposal is addressed «пакет», «компаньон» or «дерево», and is no requirement until it lands.**
  An override section it covers carries `rt-proposed:`.
- **The tree sign is computed by the sender; the send mark is a trace, not state.**
- **The proposal file name is not named in tree texts.**
- **The owner's word about a proposal is carried out by a send in the same turn.**

## Tree traits

- **Silence does not answer a requirement, and a requirement is not a kind.**

## Disabled role

- **`rolesOff` switches off the mandatory call, not the role, and removes nothing.**
