# Grill

## Records of the intake

Read on 11.11.2026 by `npm run cargo:pull -- --kind proposal --state new --text`. All three came
in one send from tree `70f4a3ad0c32` (a neighbour's records: closed by the publisher through
`cargo:close`, not marked `in_work` by this tree).

| Kind     | Resource                                                         | Mark key                                                           | Intake sign                            | Tree           |
| -------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------- | -------------- |
| proposal | `rules/task-flow.md` — exploration begins with the code graph    | `f72c81e0d69d424e7c675a8ff21585e9e0f770d6dfb365925a15cdbe20afe238` | `2f099bde-c09d-432e-ad20-f846f2ae558d` | `70f4a3ad0c32` |
| proposal | `patterns/graphify-work.md` — new pattern of work with the graph | `59e9c8e26c82566f85de233f7c9b17b7ca3f5ff96598ad3b44ec7a87fe4c074e` | `e5485769-8f07-4e49-9461-277c72b830bb` | `70f4a3ad0c32` |

The third record of the same send — `rules/task-flow.md`, a turn begun by the owner's message — is
the second task of the cascade; its keys stand in its own grill.

## The owner request

> перечитай задачи в приёмнике, найди <файл предложений соседнего дерева от 11.11>. заведи задачу на борде и бери в работу прямо сейчас

The file name is replaced by a description: it carries the task key of another tree, and such a
key is not written into this tree.

## What the tree already has

- No package resource names a code graph: a search of `projects/agent-kit/assets` for «graphify»
  and «code graph» returns nothing. This tree holds no `graphify-out/`.
- `rules/task-flow.md` has the article «Building by a sample begins with reading the sample
  itself, whole» — the place the first proposal names.
- The second half of the third proposal («after the epic is over, the guard refuses nothing at the
  end of a turn») is already held: `projects/agent-kit/assets/hooks/turn-exit-guard.sh:56` releases
  the turn by `rt_te_epic_over` whatever tier came there. Spec `docs/specs/agent-kit/epic-stop/`.
- The first half (a turn begun by the owner's own message) is not held: under an open epic
  `turn-exit-epic.sh` refuses a turn with work (`rt_te_epic_deny worked`) without reading whose
  message began the turn.
- None of the three keys stands in any task folder or archive record.

## What the rules already say

- `cargo-triage`: one edit — one task, however many records called for it; a proposal is compared
  with the spec about its resource before it becomes work.
- `task-flow`: work outside the epic is taken on the owner's word — `task:new --outside-epic`.
  The owner's message «бери в работу прямо сейчас» is that word: the copy is assigned the epic
  RT-3178, and this work stands outside it.

## Questions and answers

**One task or several?** Options: «Две задачи каскадом (Recommended)» — the graph first (texts),
then the guard (hook code and scenarios), both in one package edition; «Одна задача на весь файл»;
«Только граф, гард потом».
The owner took «Две задачи каскадом (Recommended)».

**What is not part of the work** — question closed by assumption: building a graph in this tree,
edits of the graph tool itself, any law, and the package edition — the publisher's step after the
merge.

**What shows the work is closed** — question closed by assumption. Task 1: the article in
`rules/task-flow.md` and the pattern `patterns/graphify-work.md` lie in the package and are laid
out only to a tree that holds a graph; `agent-kit:check` and `check:boundary` are green; the two
records are closed `fixed` by `cargo:close` after the merge. Task 2: a turn on a branch outside
the assigned epic, begun by the owner's own message and ended with work, is released by the guard
of the exits; the subdomain `turn-guards/exit-epic` names it with a scenario, and the hook test
proves it; the record is closed `fixed` after the merge.

**Is there a sample** — question closed by assumption: the proposal texts themselves; for a
resource laid out only to some trees — `rules/mockups.needs-mockups.md` and `traits.json`.

## Decisions

- **Work outside the assigned epic RT-3178** — the owner said «бери в работу прямо сейчас».
- **The application's behaviour does not change** — the edit lies in `projects/agent-kit/assets/**`
  and its specs, not in `apps/**` or `libs/**`. Question closed by assumption.
- **No law is edited** — the proposals name a rule and a pattern. Question closed by assumption.

- **Two tasks, cascaded** — the owner's answer. The graph texts and the guard roll back apart.
- **No epic is declared** — the two tasks do not depend on each other; each goes by
  `task:new --outside-epic` on the owner's word, and the PRs cascade.
- **Comparison with the specs.** Graph: `docs/specs/agent-kit/package-boundary/` is right — a
  resource goes only to a consumer that has its subject, so the pattern is laid out by a trait, the
  way `rules/mockups.needs-mockups.md` is; `docs/specs/agent-kit/texts/` is silent on the graph,
  and the owner's order makes it work. Guard: `docs/specs/agent-kit/turn-guards/exit-epic/` is
  silent on a turn begun by the owner's message outside the assigned epic; the owner's answer makes
  it work, and the subdomain is corrected first.
- **Work goes in a copy of its own, `rt-graph`** — the copy `rt-tools` is assigned the epic RT-3178,
  and a session of that epic stands in it.

## What is left unclear
