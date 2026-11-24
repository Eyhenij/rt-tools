# autonomous-work — what is its own here

The names and bindings of this tree, next to the rule `SKILL.md` beside it.

## What it is called here

| In the rule             | Here                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| the run task key        | `RT-<number>`; the branch is `RT-<number>-<slug>`                                                                             |
| the work queue          | the project board on GitHub; the columns are moved by `npm run task:move`                                                     |
| the morning list        | `.claude/handoff/<год>-<месяц>-<день>-ночь.md`, and the last reply of the session repeats it; a line per closed piece of work |
| description of the past | `docs/archive/RT-<number>-<slug>.md`                                                                                          |
| the task folder         | `docs/tasks/RT-<number>-<slug>/` — the grill, the plan, the progress                                                          |

## Where it lives

| What                            | Where                                              |
| ------------------------------- | -------------------------------------------------- |
| starting the night              | the command `/night` — `.claude/commands/night.md` |
| the task folder sample          | `docs/tasks/_template/`                            |
| creating a task                 | `npm run task:new`                                 |
| moving the column               | `npm run task:move -- <number> <column>`           |
| running the rules package suite | `bash projects/agent-kit/tests/run.sh`             |
| the layout audit                | `pnpm run agent-kit:check`                         |

## Where the articles are carried out

The first column is the article verbatim. An autonomous session is held by technique. Two checks
tell night from day by the line «Автономно до:» of the newest morning list, the turn-exit guard and
the kit approval guard: they name a default instead of the owner's window. The rest is held by no
guard, and every article says so outright.

- **The branch of the next work is created from the previous one, not from main.** — **Not checked.** No guard demands the previous branch as the base; the delivery guards judge whether the base is fresh, and a base that moved during the night is refused by them on every task branch. `.claude/hooks/git-guard-delivery.sh` refuses a base without the tip of main when there is no epic, and in every case a local reference to main that lags behind the server — fixed by `git fetch`. With an epic, `.claude/hooks/git-guard-delivery-epic.sh:rt_epic_base` refuses a base without the remote epic branch and proposes a branch from the epic, and refuses an epic branch without main's tip and proposes a merge into it and a push. Each of the fixes they name breaks the chain or needs a push; the rule's fix — merge the moved base into the previous branch locally — passes all of them. It is held by the technique `git checkout -b RT-<number>-<slug> <the previous branch>` and by the order in the morning list
- **Nothing goes outside during the night except what the owner named when leaving.** — **Not checked.** A push command at night differs in nothing from a daytime one, and the push gate lets it through; it is held by the line «Разрешено:» with the owner's words in the head of the morning list
- **Every allowed kind of night call is run twice before the owner leaves, and none waits on a permission prompt.** — **Not checked.** Permission prompts are the harness's and leave no trace in the tree; the owner's allow rules lie in `.claude/settings.local.json`
- **An interrupted call cancels that call, not the session.** — **Not checked.** The exit check reads an interrupt as the owner's Esc and releases the turn; that the work went on is held by the article
- **The order to work alone is not an approval.** — `tools/flow-plan.mjs:approvingEntry` — a plan is approved by the owner's choice «Одобряю …» in a menu, not by an order. A quote in a kit approval record is confirmed by the owner in the window of `.claude/hooks/kit-approval-guard.sh`
- **An incident analysis is written at night at once.** — **Not checked.** The analysis lies in `.claude/rt-kit/postmortems/`, the send is `node dist/agent-kit/bin/agent-kit.js propose`
- **A task that needs the owner's word is not taken at all.** — **Not checked.** The board does not know what a task is waiting for; it is held by the line of a postponed task in the morning list
- **A default is written where the owner's answer would have been written.** — **Not checked.** It is written into the section «Decisions» of the grill — `docs/tasks/RT-<number>-<slug>/grill.md`; the completeness of the section is not judged by a machine
- **The readiness sign is named as a command before the stage begins.** — **Not checked.** The step guard `.claude/hooks/flow-step-guard.sh` refuses a step marked done without the mark that `tools/task-flow-script.mjs step` writes after its check passed. A plan step without a check line it lets through, and the minute the command was named it does not read
- **A red run is fixed in the same branch, not postponed.** — **Not checked.** The push gate set (`.claude/rt-kit/project.sh:rt_push_checks`) only lists commands, and its callers run on a push — and at night only the allowed is pushed. Even on a push it refuses red; it cannot tell a fix in the same branch from a postponed one
- **A guard's refusal is a work step, not the end of the session.** — `tools/flow-verdict.mjs:nightBoundary` — before the boundary the turn-exit guard names the default instead of the owner's menu. `.claude/hooks/kit-approval-guard.sh` refuses the PR with a kit edit instead of opening its window, with the reason that the PR waits for the morning. A refusal is no release case: the turn is held until the scenario is over or the owner presses Esc. Whether the skipped step the refusal named was done nobody judges
- **The morning list is written along the way, not recalled at the end.** — **Not checked.** The file is created by the command `/night`; that it was appended in time is invisible to a machine
- **The session is started by the command `/night`, and the time boundary goes to it as an argument.** — **Not checked.** The command `.claude/commands/night.md` takes the boundary in `ARGUMENTS` and writes it into the head of the list; that a night is started by this command and not by words alone nothing judges
- **The command called without a boundary asks the owner for one and starts nothing.** — **Not checked.** No guard reads the arguments of a command; it is held by the text of the command
- **The command does not repeat the order of the night.** — **Not checked.** The command raises the rule and the pattern; the absence of a second source is judged by reading

## What else is worth knowing when reading the code

- A request the owner did not name does not open overnight, so the task folder is taken apart into
  the description of the past by the last commit of the branch: the branch stays ready for the
  request the owner will open in the morning.
- A cargo mark in the intake waits for the merge: it states that the edit is in the main branch. At
  night it is set only where the owner named both the merge and the send.
- `.claude/hooks/cargo-mark-guard.sh` refuses a turn that removed the task folder by `git rm` while
  the grill names cargo record keys and no mark was set. A mark that waits must not be set for it.
  The archive pattern removes the folder by `rm -r`, and a night task taken from the cargo follows
  it.
- The turn-exit guard holds a working turn until the scenario of the task flow is over or a release
  case of its description is met (`.claude/hooks/turn-exit-guard.sh`, `tools/flow-verdict.mjs`).
  The boundary from `/night` is not among them: it only turns the owner's menu into a default, and
  the night ends with the end of the scenario or with the owner's Esc.

## What this is checked by

- `bash projects/agent-kit/tests/run.sh` — the rules package suites are green after a resource edit.
- `pnpm run agent-kit:check` — the laid-out matches the package.
- `npm run check:docs`, `npm run check:specs` — the document paths and the specs without divergences.
