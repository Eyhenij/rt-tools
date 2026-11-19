---
name: task-delivery-loop
kind: rule
law: work-conduct
description: This tree's loop of one task, loaded first on every task. A live check on the stand or the showcase, two review rounds by three roles with the fixes, the push set, then one PR and the rules review. The course from request to merge is rule task-flow.
---

# Every task through a live check and two review rounds

A rule of this tree under the law `docs/constitution/work-conduct.md`. The rule `task-flow` leads
one task from the request to the merge and names no review before the push. This loop stands on
top of it: the states and the guards of `task-flow` stay, the loop adds the live check and two
review rounds. The owner's word of 19.11.2026 makes it the way every task here is led.

Ready commands are in the pattern `task-delivery-loop-run`, the guards the loop meets are in
[GUARDS.md](GUARDS.md), the bindings are in `implementation.md` next to it.

## What it is called here

| In the law                      | Here                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| work checked before it is given | the live check on the session's own stand or the showcase, with numbers in the progress |
| a reader other than the author  | a review round: `qa-engineer`, `product-strategist` and `goal-critic`, started in one message |
| a finding                       | a defect a reviewer names with `file:line`, a failure scenario and a severity           |
| the check before delivery       | the push set printed by `rt_push_checks` in `.claude/rt-kit/project.sh`                 |
| the review of the rules         | the role `skill-curator`, started in the background after the PR                        |

## Where it lives

The table in `implementation.md` next to it.

## How the law applies here

- **The skill is loaded as the first action of work on a task.** It comes before the first command
  of the task: before `task:new`, before the epic is declared and before the branch is taken.
- **The loop has no exceptions.** A task of texts, a config, a hook or a tool setting goes through
  it like one with screens, and so does the task that opens an epic.
- **Every change is checked live before the first review round.** What the task is about is
  reproduced and measured; the numbers go into the progress.
- **Every change passes two review rounds before the push.** Each round reads the whole diff of
  the branch against its base, by fresh readers, who get the diff and their inputs and never the
  executor's conclusions.
- **A finding is checked against the code before it is fixed.** One that does not hold is written
  off with its reason; a confirmed one is fixed in the same branch, even one beside the subject.
- **A finding never becomes a task of its own and is never parked in a file.** It is fixed in the
  branch or written off with its reason. A finding that is a product choice goes to the owner by
  menu before the fix.
- **The fixes of a round go as one commit named by the round.** «… после первого круга ревью
  (RT-N)», then «второго круга». The owner reads the rounds in history: this is the one place
  where a later commit of a branch corrects an earlier one by design.
- **The push set runs once per branch, after round two.** The fixes are committed together, the
  base is merged in once, and the tree is not touched between the green run and the push. A fix
  for the owner's remarks after the PR is a new content and runs the set again.
- **No guard counts the rounds.** The gate demands the loop to be loaded; that it was carried out
  is shown by the commits named by the rounds and by the PR body, and the body says so in words.

## One task, start to hand-over

1. **Load this skill, then `task-flow`.** Before the first command of the task.
2. **Take the task.** In an epic the order and the states come from `node tools/epic-table.mjs
   <epic>` on a fresh epic branch; a started task goes first, by `task-flow-resume`. Outside an
   epic the task is created by `npm run task:new -- --outside-epic '<the owner's word>'`. The host
   is asked for a branch or a PR with the number before the branch is taken.
3. **Take the branch and move the card.** From the epic branch, or from the remote ref of `main`
   outside an epic; `npm run task:move -- N in-progress`. The working copy names itself in
   `.claude/rt-kit/tree-name` and has its row in `.claude/rt-kit/assignments.md`.
4. **Run `task-flow-start` whole.** Exploration, the grill by menu, the agreement where the code
   asks for one, the plan with numbered steps, the progress.
5. **Do the stages.** Tests, lint and types over what is touched; each step is marked in the
   progress. A visible kit edit first goes through the rule `kit-approval`: the mockup and the
   owner's approval come before the code.
6. **Check live.** A kit edit — in the showcase on port 6007, measured in the pinned Chrome by the
   pattern `browser-verification-measure`. The receiver and the admin panel — on the stand of
   `pnpm run serve:stand`. A rule, a hook, a check or a text — the guard or the check is run on a
   real record and its scenarios run (`bash tools/tests/run.sh`). The numbers go into the progress.
7. **Review round one: three subagents in one message.** `qa-engineer` reads the diff file with the
   review lens of `.claude/workflows/feature.js` and edits nothing. `product-strategist` runs the
   signs of the plan's points. `goal-critic` compares the result with the owner's words in the
   grill and never gets the plan.
8. **Check every finding against the code, fix the confirmed ones, check live again.** One commit
   for the round.
9. **Review round two.** Fresh subagents read the whole diff again; step 8 repeats. The last live
   check runs on the code that ships.
10. **Show a screen to the owner before the closing steps.** A kit or admin change: the address,
    the screen and the width to look at, and the turn waits for the answer. A change of texts,
    rules or tools has nothing to show: its measurements go into the PR body.
11. **Close the texts.** Merge the base in, merge the agreement into the domain spec, bring the
    texts up to what was done, take the folder apart — patterns `task-flow-close` and
    `task-flow-archive`.
12. **Run the push set and push.** The heavy steps go ahead in the background, the push reads
    their marks.
13. **Open the PR by `gh pr create` with the machine account's token.** The body lists what each
    round found and fixed. Labels, assignee and reviewer by REST, then `npm run task:move -- N
    in-review`.
14. **Start `skill-curator` in the background** with what was loaded and what went wrong.
15. **Hand over in one message.** The PR link, what changed for the person, what confirmed it, and
    what the PR waits for: the run, the owner's review, the merge.

## After the owner answers

- **Merged.** The merge state is read from the host. A PR into an epic branch closes its task by
  the workflow `close-epic-tasks.yml`; into `main` the host closes it. Then step 2 of the next task
  in the same turn.
- **Remarks.** Fixed in the same branch, checked live, pushed; the PR body is reread and updated.
  Whether to answer under the remarks is asked.
- **No answer yet.** Exploration of the next task may run; its branch, folder and card wait.
- **Merged before the rounds ended.** Where the remaining fixes go is asked by menu: a task of its
  own rolls back alone.

## What never happens in this loop

- A push or a PR before the live check and both rounds.
- A finding fixed unverified, or a subagent's verdict taken as the evidence.
- A merge without the owner's word: the rule `git-workflow` keeps the button with a person, and
  the executor merges only what the owner said to merge.
- A claim about the tree in a reply without the command that showed it.

## What of the law is not here

No guard counts the review rounds or the live check: the loop is demanded by the gate, and that it
was carried out is seen only by the commits named by the rounds and by the PR body. The owner
judges both. The order "this rule, then `task-flow`" is held by the gate printing this rule first
on a task folder edit; on a command the default rule comes along with it.

## Patterns

- `task-delivery-loop-run` — the ready-made calls of every step of the loop.
