# Grill

## The owner request

> если по текущей открыт пр то бери след задачу, только сначала удали влитые ветки, и проверь перетащились ли тикеты куда нужно

A standing order: once the PR of the current task is open, the next task outside an epic is taken
without a question. RT-3091 is the next such task in the queue. The task body: a tree lawfully
skips a pattern the package carries only in a hosting variant — `patterns/status-report-table.github.md`
in `skip` — and the spec check still says the rule `status-report` has no pattern at all. The skip
list is parsed into `status-report-table.github`, while the rule names `status-report-table`.

## What is already in the tree

- `projects/agent-kit/assets/checks/check-specs.mjs:skippedPatterns` — the name is taken by
  `^patterns\/(.+)\.md$`.
- The suite `projects/agent-kit/tests/checks-specs.test.sh` holds SC-AK-241, the skip without a
  variant; the spec is `docs/specs/agent-kit/texts/spec-checks/` (319 scenario lines).

## Questions and answers

Closed by assumption, as the tasks before it:

- **Does the task change the behaviour** — yes, of one package check; no application code.
- **Does it need an edit of a law or a rule** — no: one spec rule.
- **One task or several** — one.
- **What is not part of the task** — the layout of variants itself.
- **What shows the task is closed** — a scenario: a tree skipping the only pattern of a rule in its
  hosting variant gets no line "has no pattern at all".
- **The sample** — SC-AK-241 next to it.

## Decisions

- **Everything after the first dot of the name is the variant.** A pattern name is letters, digits
  and dashes, never a dot, so the cut needs no list of hosts and holds for an axis added later.
