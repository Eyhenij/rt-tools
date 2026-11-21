# task-flow — what is its own here

The names and bindings of this tree, next to the rule `SKILL.md` beside it.

The tree publishes libraries and holds one application — the cargo intake. **A domain here is a
package under `projects/` or an application**: `ui-kit`, `ui-kit-v2`, `core`, `store`, `utils`,
`agent-kit`, `message-bus`. A package spec describes the public surface — what it promises the
consumer; an application spec describes the subject area: what it accepts, what it stores and what
it refuses with.

## What it is called here

- **In the rule** — Here
- **a domain** — a package under `projects/` or an application under `apps/` — a spec directory for each
- **the work queue** — the GitHub issues and the board `Rt-tools`; the task number stands in the branch name
- **the task folder** — `docs/tasks/<branch>/` — the path repeats the branch name literally, the slash included
- **the epic plan** — `docs/plans/<subject>.md` — the directory was started before the rule and is in use
- **the grill** — questions to the owner by the asking tool, the answers verbatim in `grill.md`
- **the plan review by roles** — `.claude/workflows/plan.js`
- **renaming the folder to the number** — done by `npm run task:new`: the draft by slug becomes the folder by branch name
- **assembling the task folder** — done by the same command: it copies `docs/tasks/_template` and strips the layout header from the copies

## Where it lives

- **The task folders** — `docs/tasks/`, the sample is `docs/tasks/_template/`
- **The product agreement before the code** — `docs/specs/<package>/proposed/<feature>/`
- **The package spec** — `docs/specs/<package>/`
- **The epic plan** — `docs/plans/`, named by the key `plansDir` in `.claude/rt-kit/checks.json`: the creation command lays the draft of a plan there
- **The review roles** — `.claude/agents/spec-writer.md`, `.claude/agents/spec-critic.md`, `.claude/agents/product-strategist.md`, `.claude/agents/goal-critic.md`
- **The pipeline after the grill** — `.claude/workflows/plan.js`
- **The missions document** — `docs/product/missions.md`: the role `product-strategist` judges a milestone against it

## What is not done without the owner word

The word is given for an action, not for the work as a whole: «do what the plan needs» permits
what the plan names, and nothing beyond that.

- **The action** — Why it is here
- **merging a PR into the main branch** — it is not rolled back by one motion
- **publishing a package to the registry** — a published version cannot be taken back
- **editing the body of an already created task or PR** — that is the owner text, not a working record
- **removing a branch, a working tree or a task folder** — what is removed is restored only from history, and what is uncommitted by nothing
- **changing the working tree by an edit that is not one own** — checking out a foreign version over the tree and resetting to a foreign tip erase the same
- **editing files outside the root of the working tree** — the plan of this branch does not dispose of them
- **a request to the hosting that changes a field of the board or its options whole** — it recreates the options and erases the column of every card. Before it the full list «card — column» is taken by a command and lies on disk until the end of the turn

A commit into one own branch is not in this list: it does not leave outward and it rolls back.

**Pushing the task branch and opening a PR as a draft are removed from here.** Both stood here,
and together with them stood a ban on what the rule demands outright: a PR opens as a draft by the
turn in which the edit is handed over — and without a push it cannot be opened. Work stood idle
because of that, ready and invisible, waiting for a word the owner was not expecting: the exit
guard demanded opening the request, this list demanded not opening it, and the executor had nothing
to resolve the contradiction with.

Both steps are reversible, and only the merge is not, and it stayed in the list. A branch is
removed, a request is closed, and the merge button of a draft is locked by the hosting itself:
while the draft is not lifted, an open request does not read as an invitation to merge. Lifting the
draft also stays with the executor — by it they say the solution is ready — and it is guarded by a
guard of its own: it looks at the reviewer, the conflicts and the account; the run on the tip is
read by the stop guard `.claude/hooks/git-guard-draft-ready.sh`.

The line about changing the working tree by an edit that is not one own was started by an analysis,
the record «2026-08-20-diagnostic-command-overwrote-the-tree» in the intake: the list named removal
— of a branch, of a working tree, of a task folder — and checking out a foreign version over the
tree did not get into it, although it erases exactly the same in exactly the same way.

## How the law applies here

- **The task folder is created together with the branch, not after the first edit.** The path
  repeats the branch name literally: `RT-334-archive-closed-task-folders` →
  `docs/tasks/RT-334-archive-closed-task-folders/`. For a branch of the old form, with a slash, the
  slash is not replaced by a dash — that is how `task-context-load.sh` and `task-flow-guard.sh`
  look for the folder, and a folder named otherwise is found by nothing.
- **The owner request goes into `grill.md` verbatim.** A retelling is fitted to what has already
  been done; the verbatim record is the only thing the result can be reconciled with at acceptance.
- **`plan.md` is not edited after it is written.** A revision of a stage is written into
  `progress.md` as a decision along the way, with an argument.
- **What is done is marked only in `progress.md`.** A second record of the same — in the commit
  body, in the PR description, in the plan — diverges from the first silently.
- **The agreement about the behaviour of a component is written before the code** and lives in
  `docs/specs/<package>/proposed/<feature>/` until the branch is merged.

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section «How the law applies
here». For now the table holds only what guards the taking apart of the task folder: the other
articles of the rule have no bindings — that is the debt that lay here before this table.

- **A refusal by state names the mandatory action of that state.** — `.claude/hooks/facts-flow.sh:rt_flow_state_action` — the mandatory action of every pre-transition state
- **Only a word from the list counts as a state name.** — `.claude/hooks/facts-flow.sh:rt_flow_state_action` — a word outside the list is refused with a reason of its own
- **A state line never stands ahead of the measured state.** — `tools/flow-guard.mjs:judgeProgress` — an edit of the progress whose state line is ahead of the state measured by `tools/task-flow-script.mjs measure` is refused by `.claude/hooks/flow-step-guard.sh`

## What of the law is not here

- **Abandoned drafts and folders of closed tasks are found by a check.** — `tools/check-board.mjs:checkDrafts` — `npm run check:board` reads the board and lists abandoned drafts and folders of closed tasks among its divergences.
- **The readiness of an agreement to merge is checked by a command.** — `tools/check-specs.mjs` — `npm run check:specs` lists the drafts in `proposed/` of every domain under `docs/specs/` and how long each has stood without an edit.

Two other articles of the law — the state of unfinished work in the context and the ban on writing
code before the plan — have been carried out since edition 0.4.0 of the package: it ships
`task-context-load.sh` and `task-flow-guard.sh` itself.

## What else is worth knowing when reading the code

- **`docs/plans/` is older than this rule.** There lie the epic plans — works each of which is
  wider than one branch; the task folder neither cancels nor duplicates them — it is about one
  branch. The plan of a new epic goes there too, and the creation command lays a draft there itself:
  a card with the `epic` label in the work queue says the epic exists, and the task order is held by
  that record.
- **The task number comes from GitHub, not from the folder name.** Until the task is created, the
  folder is called `docs/tasks/_draft-<slug>/` and does not travel into history.

## What this is checked by

- `.claude/hooks/task-flow-guard.sh` — refuses every code edit without `plan.md` and a declared
  state that lets code be edited.
- `.claude/hooks/task-context-load.sh` — the state of unfinished work travels into the context at
  session start.
- `.claude/hooks/git-guard-draft-ready.sh` — the turn does not end while ready work stands as a
  draft. A guard of this tree, not a package one. The shared conditions: the PR of the current
  branch is open as a draft and the run **on the PR tip** finished with success. Beyond that there
  are two grounds for a refusal — the task folder is not in the branch, so one call `gh pr ready` is
  left; the folder lies there, but the progress says the stages are closed, so the work stands at
  the tidying, and the refusal names its order. The stages are open — the guard is silent: a draft
  during ongoing work is lawful. The hosting answer is cached for a minute.
- `npm run check:hooks` — the guard scenarios, ten outcomes, without the network: the hosting
  helper is substituted, and each scenario raises a temporary repository of its own. It stands in
  the push gate set and as a pipeline step. It is set upon a deliberately broken copy of the guard
  through `RT_GUARD_PATH`: a suite that does not turn red on a breakage checks nothing.
- `npm run check:board` — abandoned drafts and folders of closed tasks, among the other board
  divergences.
- By eye at the closing of the work: the task folder is taken apart, `progress.md` is written up,
  the agreement is merged into the package spec.
- `pnpm run agent-kit:check` — the rule is laid out and its companion is filled in.
