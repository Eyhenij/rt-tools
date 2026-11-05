# Grill

## The owner request

> если по текущей открыт пр то бери след задачу, только сначала удали влитые ветки, и проверь перетащились ли тикеты куда нужно

A standing order: once the PR of the current task is open, the next task outside an epic is taken
without a question. RT-3089 is the next such task. The task body: in a tree on GitLab four package
guards wait only for `gh` commands and do not see `glab`:

- the waiting guard counts neither `glab mr update --ready` nor `glab ci status|view` as asking
  about the handed-over work;
- the turn-exit patterns recognise a request opened only by `gh pr create`;
- the claim guard confirms «PR открыт», «прогон зелёный» and «влито» only by `gh` commands;
- the rerun guard waits for `run` and `rerun`, while GitLab retries by `glab ci retry`.

## What is already in the tree

- `projects/agent-kit/assets/hooks/waiting-turn-guard.sh` — `opened_re` already knows
  `glab mr create`, `ready_re` does not know `glab`.
- `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:handover_re`,
  `projects/agent-kit/assets/hooks/claim-guard.sh:claims`, `projects/agent-kit/assets/hooks/rerun-guard.sh`.
- Their suites lie in `projects/agent-kit/tests/`; the spec is `docs/specs/agent-kit/turn-claims/`
  (272 scenario lines).

## Questions and answers

Closed by assumption, as the tasks before it:

- **Does the task change the behaviour** — yes, of four package guards; no application code.
- **Does it need an edit of a law or a rule** — no: one spec rule.
- **One task or several** — one: the same miss in four places.
- **What is not part of the task** — the Azure client; nothing in the tree calls it but the
  opening sample.
- **What shows the task is closed** — scenarios: each of the four guards recognises the `glab` form
  of the command it already recognises in the `gh` form.
- **The sample** — `opened_re`, which already names both clients side by side.

## Decisions

- **The `glab` forms stand next to the `gh` ones in the same samples, not in the profile.** That is
  how `opened_re` already does it; a tree on either host gets both, and a word in the profile would
  be one more setting to forget.
