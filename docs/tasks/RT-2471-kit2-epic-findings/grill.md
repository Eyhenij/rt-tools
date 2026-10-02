# Grill

## The owner request

> Внести все шесть

The answer to the question what to do with the six findings of the rules review of RT-2397,
RT-1881 and RT-2349 in `docs/plans/one-kit-part-2-findings.md`, asked after epic RT-2353 was
merged.

## What the tree already has

- The findings file names the address and the wording of every finding: four go to this tree's
  rules (`ui-component-tests`, `rt-tools-storybook` twice, the override of `testing`), two to the
  package (`turn-conduct` with the refusal tail of the turn exit guard, `task-flow`).
- None of the six is in the rules yet: a search by the wording words over `.claude/skills`,
  `.claude/rt-kit/overrides` and `projects/agent-kit/assets` found nothing.
- The sample is RT-2457 (`docs/archive/RT-2457-curator-findings.md`): package findings are edited
  in `projects/agent-kit/assets` and laid out by `pnpm run agent-kit:sync`.

## What the rules already say

- `agent-kit-source`: a package resource is edited at the source, then built and laid out.
- `spec-driven`: a rule edit keeps the article form and the size limits.

## Questions and answers

**What to do with the six findings**
Внести все шесть

## Decisions

- Question closed by assumption: behaviour of the applications does not change — only rule texts
  and one refusal text.
- Question closed by assumption: one task — six text edits roll back together.
- Question closed by assumption: the sign is the six wordings in place and
  `pnpm run agent-kit:check` matching.
- Question closed by assumption: the findings of RT-2424 and RT-2427 stay as the owner decided on
  30 September — not part of this work.

## What is left unclear

- Nothing.
