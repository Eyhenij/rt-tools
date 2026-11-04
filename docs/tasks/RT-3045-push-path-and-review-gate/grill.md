# Grill

Read on 04.11.2026 by `npm run cargo:pull -- --state new --text` and by the archive record of
RT-3044. Keys are full, as the read prints them.

| Kind     | Resource or name                                     | Mark key                                                           | Intake sign                            | Tree           |
| -------- | ---------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------- | -------------- |
| proposal | `rules/git-workflow.github.md`                       | `c859a2c8180bf2e906bd140aeb92b2f61b30ee9dd8e41ef95d22f6f4cf1c2535` | `c49e624e-0c25-4817-8cb8-fb0a1412172a` | `b101ab1c9908` |
| analysis | `2026-10-29-push-moved-to-terminal-past-the-gate.md` | `2026-10-29-push-moved-to-terminal-past-the-gate.md`               | `7446adf1-4d57-4a0b-9fce-3eb43e9e93d6` | `b101ab1c9908` |
| analysis | `2026-11-02-review-without-gate-run.md`              | `2026-11-02-review-without-gate-run.md`                            | `6ef5f282-8721-498a-88cc-7cd293a98583` | `70f4a3ad0c32` |
| analysis | `2026-11-02-gate-checks-run-by-hand-picked-list.md`  | `2026-11-02-gate-checks-run-by-hand-picked-list.md`                | `c9173489-df93-4cd7-ad95-d3158ba2b19b` | `70f4a3ad0c32` |

The proposal moved to `in_work` on 04.11.2026 with the spec
`docs/specs/agent-kit/delivery-gate/spec.md`. The analysis of this tree has stood in `in_work`
since RT-3044: its fix spans the guard of RT-3044 and the rule of this task, and it moves to
`fixed` with this one. The two analyses of tree `70f4a3ad0c32` move to `fixed` by `cargo:close`
after the merge.

## The owner request

> читай что нового в приёмнике, заводи эпик и задачи под каждую находку и бери в работу, открывай
> пр по одному и отдавай мне на ревью, не переходи к следующей задаче пока я не дам аппрув и пока
> не будет вмержен этот пр

## What the tree already has

- The rule lives in the package: `projects/agent-kit/assets/rules/git-workflow.github.md`, 281 lines
  and 22 244 characters against the limits of 330 lines and 24 000 characters.
- Its article «A refusal is read before it is bypassed by a second way» speaks of a second call
  after a refusal. It says nothing of another path to run the same command.
- «Before a push all linters are run, not one» and «The final set before a push is read from the
  state review, not assembled in the head» stand in the rule. Neither says that a review of a
  foreign branch runs the set, nor that a tree without the git hook runs the set from the profile.
- The articles are bound in `.claude/skills/git-workflow/implementation.md`, section «Where the
  articles are carried out».
- The set is the profile function `.claude/rt-kit/project.sh:rt_push_checks`. The tree has no single
  command that runs it whole.
- Measured on 04.11.2026 in this epic: the executor ran the set from a list copied into a scratch
  file before. The list lacked `check-glossary` and `check-archive-age`, and the push guard refused
  on both. That is the third finding of the task repeated by its own executor.
- `npm run specs:for -- rules/git-workflow.github.md` names `delivery-gate/spec.md` and
  `delivery-identity/spec.md`. Neither speaks of the push path or of a review.

## What the rules already say

- Rule `cargo-triage`: the spec is silent, so the person decides. The owner decided by the request
  itself: every finding becomes a task.
- Rule `agent-kit-source`: a package resource is edited at the source and laid out by
  `pnpm run agent-kit:sync`.
- Rule `spec-driven`: every article of a rule has a binding line in the companion.

## Questions and answers

Closed by the epic grill of 03.11.2026: one edit is one task; the package is not released during
the epic; no law is edited; no product agreement is written, the edit does not touch `apps/**` or
`libs/**`.

Closed by assumption: the three findings go into one rule as three articles, since the task names
one resource and one edit. Taken from the task body: «Готово, когда статьи стоят в правиле и в
файле привязок дерева».

## Decisions

- **Three articles in `git-workflow`, next to the article about the bypass by a second way.** The
  three findings are bypasses of the same set by another path: another tool, a review by reading, a
  list from memory. Rejected: a new rule — the law `delivery` already has a rule for the gate.
- **The third article names the profile function, not a new runner command.** A command that runs
  the set whole is code of its own with tests; the task asks for an article. Rejected: writing the
  runner here; it is named in «What this work does not do».

## What is left unclear

- Whether a tree should get a single command that runs the set whole. It does not block the
  articles: the profile function is called the same way today.
