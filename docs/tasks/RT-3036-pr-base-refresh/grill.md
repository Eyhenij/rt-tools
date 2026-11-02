# Grill

## The owner request

> обнови гит флоу правила чтобы правильно открывать пр

Before it, about PR #3014:

> я вижу в github 153 коммита в этом пр

## What the tree already has

- `projects/agent-kit/assets/patterns/git-workflow-pr.github.md` — the PR pattern: title, draft,
  base, reading the state, the checklist before publishing. It says to read the PR state after
  every call and before a push, but says nothing about the commit count of the PR against the base.
- The checklist item 1 merges the base into the branch, and nothing after that checks that the
  host recounted the PR against the new base.
- `git-workflow-commit.github.md` gives the push call `push -u origin <ветка>`. Nothing covers a
  local branch whose name differs from the head branch of the PR it continues.
- A search over `projects/agent-kit/assets` for `base.sha`, `ahead_by`, `set-upstream` found
  nothing on the subject; the open tasks hold nothing about the PR base either.

What happened on 2 November 2026, measured:

1. PR #3014 was opened 31 October with base `main`. The host stored `base.sha` = `35edc2edf`, the
   main of 30 October.
2. Main was merged into the branch several times, then the branch was pushed. The PR still showed
   153 commits and 371 files: `commits` and `changed_files` were counted from `35edc2edf`.
3. `compare/main...RT-2994-service-block-gap` answered `ahead_by=30 behind_by=0` at the same minute.
4. `PATCH pulls/3014 base=main` (the same base) made the host recount: `base.sha` = `ebc5980ec`,
   30 commits, 227 files.
5. The local branch `RT-2994-service-block-canon` continued PR #3014 with head
   `RT-2994-service-block-gap`. It had no upstream, so the turn-exit guard counted its 30 commits as
   not handed over, though all of them were on the host.

## What the rules already say

- "The PR state is read, not guessed" — the owner is told what was read. Here the state was read
  and was wrong: the host's own numbers lagged.
- "A push into a branch that has an open PR is followed by rereading its body."
- "The main branch is merged into the epic branch … while the work runs."

## Questions and answers

The owner took the recommended option three times in a row in this session (mockup, kit copy,
showcase). By the pattern `task-flow-start` the remaining questions close by assumption.

- **Does the task change the application's behaviour** — closed by assumption: no, it is a text of
  the rules layer.
- **Does it need an edit of a law or a rule** — closed by the request itself: the owner asked to
  edit the git-flow rules. The edit goes into the patterns, the law stays.
- **One task or several** — closed by assumption: one, both items are about the PR after a push.
- **What is not part of the task** — closed by assumption: no new guard or check; PR #3014 itself is
  already fixed.
- **What will show that the task is closed** — closed by assumption: the patterns name both steps
  with ready calls, `pnpm run agent-kit:check` and the spec checks are green.
- **Is there a sample** — closed by the tree: the call shapes of the pattern `git-workflow-pr`.

## Decisions

- **The PR is recounted after a push that carries a merge of the base** — the host keeps the old
  `base.sha`, and the PR shows foreign commits. Rejected: waiting for the host to recount by itself —
  it did not in two days and several pushes.
- **The count of the PR is matched against `compare`** — `commits` of the PR equals `ahead_by` of
  `compare/<база>...<ветка>`. A divergence is fixed by setting the same base again.
- **A local branch that continues a PR of another name is tied to its head branch** —
  `git branch --set-upstream-to=origin/<ветка PR>` before the first push, the push goes
  `HEAD:<ветка PR>`.

## What is left unclear

- Whether the host recounts by itself after some time. Not measured; the ready call does not depend
  on it.
