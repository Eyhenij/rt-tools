# status-report — what is its own here

The names and bindings of this tree, next to the rule `SKILL.md` beside it.

The rule speaks by technique and names the paths common to the workshop trees — they need no
rewriting here. Only what the package cannot know goes here: how things are named in this very
repository, and in which of its files each article of the rule is carried out.

## What it is called here

Only what diverges from the rule: the task key, the board address, the component prefix, the name
of the owning entity, the storage currency, the set of commit scopes. A line that merely repeats
the rule is not carried here — it would go stale apart from it.

- **In the rule** — Here
- **the task key** — `RT-<number>`; the board is the repository issues on the hosting
- **the main branch** — `main`
- **the epic plan** — a file in `docs/plans/`; the task order is its table with the column «Задача», under the section «Состав»
- **the progress record in the task folder** — `docs/tasks/<branch>/progress.md`, the section «Where we stand»
- **the hosting executable** — `/opt/homebrew/bin/gh` — the name `gh` in the shell is taken by a foreign alias

## Where it lives

- **the epic plans** — `docs/plans/`
- **the task folders** — `docs/tasks/`
- **the guard of statements about the tree** — `.claude/hooks/claim-guard.sh`
- **the guard of a request left as a draft** — `.claude/hooks/git-guard-draft-ready.sh`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section «How the law applies
here» (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **The table is assembled by a command, not by the memory of the session.** — `tools/epic-table.mjs:epicTable` — `npm run epic:table [<номер эпика>]`; without a number the epic is taken from the current branch
- **The work state is shown as a table, not as prose.** — **Not checked.** The reply to the owner does not land in the tree, and there is nothing to read it with; it is held by the memory of whoever answers.
- **The epic itself is described by text above the table, not by a row in it.** — **Not checked.** The form of the reply to the owner is read by no audit; it is held by the memory of whoever answers.
- **The epic's tasks are listed all, and in the order the plan assigned them.** — `tools/epic-table.mjs:makeupOf` — the table command emits every row of the plan in its order. A reply written by hand is reconciled with the plan by nobody.
- **Every cell about the tree's state is backed by a command run by the same turn.** — `.claude/hooks/claim-guard.sh:claims` — the list of statements about the tree; a turn that said such a thing without a command is refused.
- **A run confirms the commit it ran on.** — `tools/epic-table.mjs:rowOf` — calls `verdictOnHead` from `tools/board-runs.mjs`; the table command reads the run by the head of the PR. A run named in a reply by hand is reconciled with the tip by nobody: the statement guard sees only that a command was there.
- **A red run on an open PR is the first line of any reply about the work, whatever its cause.** — **Not checked.** No check reads the reply to the owner; the epic table reads the run state, and putting it first is held by this article.
- **A draft PR is called a draft aloud, together with what we wait for.** — `.claude/hooks/git-guard-draft-ready.sh:run_gh` — it asks the state of the request and demands either lifting the draft or naming aloud what is awaited.
- **A task folder left as an empty template is "created, not started".** — **Not checked.** The sample lies in `docs/tasks/_template/`, and there is nothing to tell an unfilled copy from a filled one.
- **Under the table — no more than two lines.** — **Not checked.** The length of the reply to the owner is counted by nobody.

## What else is worth knowing when reading the code

- A task on the board is read by a request to the hosting, not by the view subcommand: that one
  pulls boards of the old kind, and the hosting answers with a refusal about them, showing nothing.
- The runs here are driven by its own runner, and the last run of a branch is sometimes older than
  its tip.

## What this is checked by

- `.claude/hooks/claim-guard.sh` — refuses the end of a turn in which a statement about the tree
  was made without a command that showed it.
- `.claude/hooks/git-guard-draft-ready.sh` — refuses the end of a turn in which the work is ready
  while the request stands as a draft and what is awaited is not named aloud.
