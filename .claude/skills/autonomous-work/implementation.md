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

The first column is the article verbatim. An autonomous session is held by technique: there is not
a single guard in the tree that would tell night from day, and this is said outright at every
article.

- **The branch of the next work is created from the previous one, not from main.** — **Not checked.** Not a single guard judges the base of a branch; it is held by the technique `git checkout -b RT-<number>-<slug> <the previous branch>` and by the order in the morning list
- **Nothing goes outside during the night.** — **Not checked.** A push command at night differs in nothing from a daytime one, and the push gate lets it through; it is held by the owner word about the session
- **A task that needs the owner's word is not taken at all.** — **Not checked.** The board does not know what a task is waiting for; it is held by the line of a postponed task in the morning list
- **A default is written where the owner's answer would have been written.** — **Not checked.** It is written into the section «Decisions» of the grill — `docs/tasks/RT-<number>-<slug>/grill.md`; the completeness of the section is not judged by a machine
- **The readiness sign is named as a command before the stage begins.** — `.claude/hooks/turn-exit-guard.sh:rt_te_deny` — the turn-exit guard reads the command from the line «Verified by» of the plan and does not release a turn where a stage is declared closed and the command was never run
- **A red run is fixed in the same branch, not postponed.** — `.claude/rt-kit/project.sh:rt_push_checks` — the push gate set; at night it runs by the same call as in the daytime
- **A guard's refusal is a work step, not the end of the session.** — **Not checked.** The guard does not know what happened after its refusal; it is held by technique
- **The morning list is written along the way, not recalled at the end.** — **Not checked.** The file is created by the command `/night`; that it was appended in time is invisible to a machine
- **The session is started by the command `/night`, and the time boundary goes to it as an argument.** — `.claude/commands/night.md:ARGUMENTS` — the laid-out copy of the package command; the boundary comes in the arguments
- **The command called without a boundary asks the owner for one and starts nothing.** — **Not checked.** No guard reads the arguments of a command; it is held by the text of the command
- **The command does not repeat the order of the night.** — **Not checked.** The command raises the rule and the pattern; the absence of a second source is judged by reading

## What else is worth knowing when reading the code

- A request does not open overnight, so the task folder is taken apart into the description of the
  past by the last commit of the branch: the branch stays ready for the request the owner will open
  in the morning.
- A cargo mark in the intake is not set at night: it states that the edit is in the main branch,
  while overnight the branches do not even leave for the hosting.

## What this is checked by

- `bash projects/agent-kit/tests/run.sh` — the rules package suites are green after a resource edit.
- `pnpm run agent-kit:check` — the laid-out matches the package.
- `npm run check:docs`, `npm run check:specs` — the document paths and the specs without divergences.
