# Every task through a live check and a review — cold part

What the rule `task-delivery-loop` handed over when cut to its statements, every article whole.

A rule of this tree under the law `docs/constitution/work-conduct.md`. The rule `task-flow` leads
one task from the request to the merge and names no review before the push. This loop stands on
top of it: the states and the guards of `task-flow` stay, the loop adds the live check and the
review. The owner's word of 19.11.2026 makes it the way every task here is led; their word of
24.11.2026 on the plan of the epic RT-3624 gives a small change the light path and the full path a
second round by risk.

Ready commands are in the pattern `task-delivery-loop-run`, the guards the loop meets are in
[GUARDS.md](GUARDS.md), the bindings are in `implementation.md` next to it.

## What it is called here

| In the law                      | Here                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| work checked before it is given | the live check on the session's own stand or the showcase, with numbers in the progress |
| a reader other than the author  | a review round, its roles started in one message: `qa-engineer` and `goal-critic`, on the full path `product-strategist` too |
| a finding                       | a defect a reviewer names with `file:line`, a failure scenario and a severity           |
| the check before delivery       | the push set printed by `rt_push_checks` in `.claude/rt-kit/project.sh`                 |
| the review of the rules         | the role `skill-curator`, started in the background after the PR                        |

## Where it lives

The table in `implementation.md` next to it.

## How the law applies here

- **The skill is loaded as the first action of work on a task.** It comes before the first command
  of the task: before `task:new`, before the epic is declared and before the branch is taken.
- **Every task goes through the loop.** A task of texts, a config, a hook or a tool setting goes
  through it like one with screens, and so does the task that opens an epic.
- **The path of a change is named by the command, not by the executor.** `tools/review-path.mjs`
  takes a change for the light path when its code is at most 150 changed lines without tests, stories
  and texts, and it holds none of the signs: the public API, security, migrations, a change of look,
  the guards of the rules. Before the code `--plan` judges the edited rows of the footprint and the
  header line `**Путь:** лёгкий · N строк`, with the words «API и вид не меняются» for a file of a
  package or the kit; `--roles` is called before the menu of the approval, and any answer but `none`
  sends the plan to the roles first. The edited rows name files: a folder, a pattern or a row without
  a path is the full path, and so is a branch whose plan does not call itself light. Before round one the diff against the base is judged again: a
  change that grew goes on by the full path. The other checks of the tree under `tools/check-*` are no
  guards of the rules for the path and are guards for the second round.
- **Every change is checked live before the first review round.** What the task is about is
  reproduced and measured; the numbers go into the progress.
- **Every change is read by one review round before the push.** The round reads the whole diff of
  the branch against its base, by fresh readers, who get the diff and their inputs and never the
  executor's conclusions. On the light path these are `qa-engineer` and `goal-critic`.
- **On the full path the second round is due by risk and reads the fixes of the first.** It is due on
  a serious finding of the first round and on a change of the kit, of the guards and checks or of
  security. A serious finding is `blocker` or `major` of `qa-engineer`, a line «не выполнено» or
  «частично» of `goal-critic`, «не достигает» of `product-strategist`. Where the first round changed
  nothing but the records of the task and found nothing serious, there is nothing to read. Without the number the answer is «нужен».
- **A light plan with a full diff is refused at the push.** The plan was read by no role and the change
  by two: the second round then reads the whole branch by the three roles of the full path, and its
  commit lifts the refusal: one of the branch itself, not empty and with no code after it. A base or a
  branch name that cannot be read is refused too, and an edit left in the copy counts as unread.
- **A finding is checked against the code before it is fixed.** One that does not hold is written
  off with its reason; a confirmed one about the diff of the branch is fixed in the same branch.
- **A finding about the diff is never parked in a file.** It is fixed in the branch or written off
  with its reason. A finding beside the subject, named by no exit condition of the plan, follows
  the rule `task-flow`: the section on what the work does not do, and a task of its own. A finding
  that is a product choice goes to the owner by menu before the fix.
- **The fixes of a round go as one commit named by the round.** «… после первого круга ревью
  (RT-N)», then «второго круга». The owner reads the rounds in history: this is the one place
  where a later commit of a branch corrects an earlier one by design. A round without findings closes
  by a record in the progress, committed under that name.
- **The push set runs beside round two.** It starts in one message with the roles of the round, over a
  copy that is ready to leave: the fixes of round one committed, the base merged in once, the texts
  closed, the expired archive records removed, the own showcase and stand stopped. Nobody touches the
  copy until both end: the replies of the roles go to the scratchpad, and a run over a changed copy says
  «not judged» and costs a second one. A round without fixes is closed by a record in the progress, whose
  commit takes no mark of a heavy step away: between the green run and the push only that record and the
  take-apart commit stand. Where there is something to fix the run is stopped before the first edit, the
  fixes land as one commit, and the set runs again; a red step found beside the round is fixed with its
  findings. Of 57 second rounds since 19.11 six changed nothing but the records of the task: the others
  get an early red and the warm cache of the builder. A fix for the owner's remarks after the PR is a new
  content and runs the set again.
- **The set waits for the round in two cases.** A change of look waits for the owner's answer at step 10,
  and `check-kit-approval` is red until its line stands. A light plan with a full diff is refused by
  `review-path.mjs --check` until the commit of the second round, and a heavy step is not started after
  a red one. Where no second round is due the set runs right after the fixes of the first.
- **Unattended work keeps the loop and the night rule both.** By the rule `autonomous-work` the
  show of step 10 becomes the session's own measurement, and the push and the PR wait for the
  owner's return where that rule keeps everything local.

## One task, start to hand-over

1. **Load this skill, then `task-flow`.** Before the first command of the task.
2. **Take the task.** In an epic the order and the states come from `node tools/epic-table.mjs
   <epic>` on a fresh epic branch; a started task goes first, by `task-flow-resume`. Outside an
   epic the task is created by `npm run task:new -- --outside-epic '<the owner's word>'`. The host
   is asked for a branch or a PR with the number before the branch is taken.
3. **Take the branch and move the card.** From the previous branch while the chain of the epic is
   unbroken (pattern `git-workflow-stack`), from the epic branch for the chain's first work, from
   the remote ref of `main` outside an epic; `npm run task:move -- N in-progress`. The working copy names itself in
   `.claude/rt-kit/tree-name` and has its row in `.claude/rt-kit/assignments.md`.
4. **Run `task-flow-start` whole.** Exploration, the grill by menu, the agreement where the code
   asks for one, the plan with numbered steps, the progress. The plan names the
   end-to-end suites its paths demand and a step that edits a test of each: found at the PR, each suite
   is a refusal of its own.
5. **Do the stages.** Tests, lint, types and
   the quick checks of the push set over what is touched: the linter after an edit does not judge
   `tools/` and texts, and the push set is too late for them. Each step is
   marked by the engine: `node tools/task-flow-script.mjs step N.M` runs its check and writes the mark.
   The executor edits neither the marks nor a state ahead of the measured one. A kit edit that changes the look first goes through the rule `kit-approval`: the mockup
   and the owner's approval come before the code. One that keeps it is named in the plan.
6. **Check live.** A kit edit — in the showcase on port 6007, measured in the pinned Chrome by the
   pattern `browser-verification-measure`; if it does not hold the local tab, in the built-in browser. The receiver and the admin panel — on the stand of
   `pnpm run serve:stand`. A rule, a hook, a check or a text — the guard or the check is run on a
   real record and its scenarios run — the tree's checks by `tools/tests/run.sh`, the guards by
   `nx affected -t test-hooks`. The numbers go into the progress.
7. **Review round one: the path first, then its roles in one message.** `node tools/review-path.mjs
   --base origin/<base>` names the path; a light plan whose diff came out full goes on by the full
   path. `qa-engineer` reads the diff file with the review lens of `.claude/workflows/feature.js` and
   edits nothing. `goal-critic` compares the result with the owner's words in the grill and never
   gets the plan. On the full path `product-strategist` runs the signs of the plan's points; on the
   light path the executor runs them.
8. **Check every finding against the code, fix the confirmed ones, check live again.** One commit
   for the round.
9. **Make the copy ready on every path, then run the push set beside round two where it is due.** In this
   order: the quick checks with `node tools/check-dupes.mjs` and `pnpm run check:unused`, their findings
   go into the commit of the round; on the full path `--round-two` and, where it says «нужен», the diff
   of the round — both before the base is merged in, after it the diff carries another branch's content;
   then the base, the agreement into the domain spec, the texts up to date — pattern `task-flow-close` —
   and the expired archive records by `node tools/archive-prune.mjs --apply` in their own commit. No round
   two — step 10 and step 11 at once. Where it is due the executor runs the signs of the plan's points
   that the frame of a round beside the set forbids — a build, `nx`, snapshots, the browser — and gives
   their output to `product-strategist`; the rest of the signs the role runs itself, and a sign that is
   the set is filled after its green. Fresh subagents read the fixes since the tip of round one; step 8
   repeats. The last live check runs on the code that ships.
10. **Show a screen to the owner before the closing steps.** A kit or admin change of look: the address,
    the screen and the width to look at, and the turn waits for the answer. A change of texts,
    rules or tools has nothing to show: its measurements go into the PR body.
11. **Bring the set to green.** A round without fixes — the run beside it is the one; with fixes, where
    the set waited for the round and where no second round is due, it runs now, in the background. A red
    is fixed here, while the folder still stands.
12. **Then take the folder apart by the last commit and push.** Pattern `task-flow-archive`. The push
    reads the marks of the run ahead; a step the last commit reached runs at the push.
13. **Open the PR by `gh pr create` with the machine account's token.** The body lists what each
    round found and fixed. Reviewer, assignee and labels go in the same call; a PR into `main` is
    a draft, one into an epic branch opens ready. Then `npm run task:move -- N in-review`.
14. **Start `skill-curator` in the background** with what was loaded and what went wrong.
15. **Hand over in one message.** The PR link, what changed for the person, what confirmed it, and
    what the PR waits for. A draft into `main` is lifted by `gh pr ready` on the green run of its
    tip (pattern `git-workflow-pr`); then it waits for the owner's review and merge.

## After the owner answers

- **Merged.** The merge state is read from the host. A PR into an epic branch closes its task by
  the workflow `close-epic-tasks.yml`; into `main` the host closes it. Then step 2 of the next task
  in the same turn.
- **Remarks.** Fixed in the same branch, checked live, pushed; the PR body is reread and updated.
  Whether to answer under the remarks is asked.
- **No answer yet.** The next task is taken by the rule `task-flow` (state `работа-отдана`): in an
  epic its branch stands on the branch of this PR.
- **Merged before the rounds ended** — possible only after a miss of this loop. Where the remaining
  fixes go is asked by menu: a task of its own rolls back alone.

## What never happens in this loop

- A push or a PR before the live check and the rounds the path asks for.
- A finding fixed unverified, or a subagent's verdict taken as the evidence.
- A merge without the owner's word: the rule `git-workflow` keeps the button with a person, and
  the executor merges only what the owner said to merge.
- A claim about the tree in a reply without the command that showed it.

## What of the law is not here

Neither the review rounds nor the live check are counted by a guard, and the number of serious findings is the
executor's word: the loop is demanded by the gate, the path is judged by the command, and that the loop
was carried out is seen only by the commits named by the rounds and by the PR body. The owner
judges both. The order "this rule, then `task-flow`" is held by the gate printing this rule first
on a task folder edit; on a command the default rule comes along with it.

## Patterns

- `task-delivery-loop-run` — the ready-made calls of every step of the loop.
