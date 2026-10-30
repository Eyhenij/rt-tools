# Grill

## The owner request

> работай

It answers the proposal after the rules review of RT-2995: add two rules so the misses of that task
do not repeat — the 9 kB style budget of the applications in the kit styling rule, and measuring a
kit copy on a Figma sheet against the running showcase in the mockups rule. The edit of the
machine-local file about `--maxWorkers` is not taken: the owner did not say so.

## What the tree already has

- `.claude/skills/rt-tools-styling/SKILL.md` — this tree's rule, no layout header. The article
  "Four families are judged" says which values get a block property; nothing names the budget.
- `apps/message-bus-admin/project.json`, `apps/auth-example-admin/project.json`,
  `apps/chat-talks-page/project.json` set `anyComponentStyle` with an error at 9 kB. They build the
  kit from source, so a kit stylesheet over 9 kB fails their production build.
- `.claude/skills/mockups/SKILL.md` is laid out from the package source
  `projects/agent-kit/assets/rules/mockups.needs-mockups.md`. Its article "A kit component on a
  design-tool sheet is a copy of the kit, and the copy drifts" checks the copy against the kit's
  styles.
- RT-2995: the tabs stylesheet went 171 bytes over the budget, caught only by the push set; four
  places of the Figma copies drew the kit wrongly and were caught only by the numeric match.

## What the rules already say

- `spec-driven`: a rule article is bound by a line in its companion, verbatim.
- `agent-kit-source`: a package resource is edited in the source and laid out, not in place.

## Questions and answers

**Что предлагаешь?** (the owner on the menu «Правки правил 2 и 3 (Recommended)», «Ждать прогон PR»,
«Другая задача»): «что предлагаешь?» — after the explanation: «работай».

## Decisions

- **Behaviour unchanged.** Only rules texts change; no `apps/**` or `libs/**`. Question closed by
  assumption.
- **A rule edit, no law edit.** Both articles are techniques under existing laws. Question closed by
  assumption.
- **One task.** Two articles from one review, they roll back together. Question closed by
  assumption.
- **Not included:** the machine-local file; a new check that counts the budget in the kit.
- **Closed when:** both articles are in their rules, the styling article has its companion line,
  `node tools/check-specs.mjs`, `pnpm run agent-kit:check` and the package tests are green.
- **Sample:** the existing articles next to them.
- **Outside an epic** by the owner's word «работай» about this work.

## What is left unclear

- Nothing blocks the work.
