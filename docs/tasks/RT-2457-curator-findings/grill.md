# Grill

## The owner request

> Все семь

The answer to the question which of the seven findings of the rules review of RT-2446, RT-2448 and
RT-2447 to apply.

## What the tree already has

- `projects/agent-kit/assets/agents/skill-curator.md` and `rules-reviewer.md` list the items of a
  proposal and say nothing about the room left in the target file.
- `projects/agent-kit/assets/rules/spec-driven.md`, "The shape of a compressed article", does not
  ask for a measurement before an article is added; the laid-out copy stands at 328 of 330 lines.
- `projects/agent-kit/assets/rules/doc-style.md`, the article about the removal by expiry, names
  two exits this tree does not have.
- `projects/agent-kit/assets/hooks/git-guard-delivery-folder.sh` reads `git branch --show-current`
  in `rt_delivery_ready_folder` and `rt_delivery_merge_folder`, whatever PR the command names.
- `projects/agent-kit/assets/checks/board.github.mjs`, the PR state, asks the host for no head
  branch.
- `tools/shot-browser.mjs` reads `E2E_SHOT_CONTAINER` and `E2E_SHOT_PORT`;
  `.github/workflows/ci.yml` sets neither.
- `.claude/skills/ui-component-tests-visual/SKILL.md` and `.claude/skills/testing/implementation.md`
  are this tree's own texts.

## What the rules already say

- `agent-kit-source`: a package resource is edited in the source, built and laid out.
- `testing`: a guard with a new branch of logic gets a scenario of its own.

## Questions and answers

**Which of the seven findings to apply?**
«Все семь»

## Decisions

- **The folder guard reads the head branch of the PR the command names.** It asks the PR state the
  board helper already gives and looks into `origin/<head>`; without a number, a network or the ref
  it judges the checked-out branch as before. Rejected: only a note in the pattern — the guard
  would keep refusing the lower PR of a stack.
- **The pipeline gets a shot container and a port of its own.** The local gate keeps the defaults.
