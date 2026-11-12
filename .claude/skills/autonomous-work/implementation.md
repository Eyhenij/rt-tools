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

- **The branch of the next work is created from the previous one, not from main.** — **Not checked.** No guard demands the previous branch as the base; the delivery guards judge whether the base is fresh, and a base that moved during the night is refused by them on every task branch. `.claude/hooks/git-guard-delivery.sh` refuses a base without the tip of main when there is no epic, and in every case a local reference to main that lags behind the server — fixed by `git fetch`. With an epic, `.claude/hooks/git-guard-delivery-epic.sh:rt_epic_base` refuses a base without the remote epic branch and proposes a branch from the epic, and refuses an epic branch without main's tip and proposes a merge into it and a push. Each of the fixes they name breaks the chain or needs a push; the rule's fix — merge the moved base into the previous branch locally — passes all of them. It is held by the technique `git checkout -b RT-<number>-<slug> <the previous branch>` and by the order in the morning list
- **Nothing goes outside during the night.** — **Not checked.** A push command at night differs in nothing from a daytime one, and the push gate lets it through; it is held by the owner word about the session
- **A task that needs the owner's word is not taken at all.** — **Not checked.** The board does not know what a task is waiting for; it is held by the line of a postponed task in the morning list
- **A default is written where the owner's answer would have been written.** — **Not checked.** It is written into the section «Decisions» of the grill — `docs/tasks/RT-<number>-<slug>/grill.md`; the completeness of the section is not judged by a machine
- **The readiness sign is named as a command before the stage begins.** — **Not checked.** The turn-exit guard (`.claude/hooks/turn-exit-guard.sh`) only demands that the commands of a closed stage's line «Verified by» ran in the same turn. It does not demand the line itself, a command in it, or that it was written before the stage, and it does not read whether the command passed
- **A red run is fixed in the same branch, not postponed.** — **Not checked.** The push gate set (`.claude/rt-kit/project.sh:rt_push_checks`) only lists commands, and its callers run on a push — and at night nothing is pushed. Even on a push it refuses red; it cannot tell a fix in the same branch from a postponed one
- **A guard's refusal is a work step, not the end of the session.** — **Not checked.** After another guard's refusal the turn-exit guard (`.claude/hooks/turn-exit-guard.sh`) still refuses three kinds of turn: one that ends waiting for the owner's word, one that ends with a question in prose after the conversation guard refused, and one that ends with a handover written by hand under an open epic. Whether the skipped step the refusal named was done nobody judges
- **The morning list is written along the way, not recalled at the end.** — **Not checked.** The file is created by the command `/night`; that it was appended in time is invisible to a machine
- **The session is started by the command `/night`, and the time boundary goes to it as an argument.** — **Not checked.** The command `.claude/commands/night.md` takes the boundary in `ARGUMENTS` and writes it into the head of the list; that a night is started by this command and not by words alone nothing judges
- **The command called without a boundary asks the owner for one and starts nothing.** — **Not checked.** No guard reads the arguments of a command; it is held by the text of the command
- **The command does not repeat the order of the night.** — **Not checked.** The command raises the rule and the pattern; the absence of a second source is judged by reading

## What else is worth knowing when reading the code

- A request does not open overnight, so the task folder is taken apart into the description of the
  past by the last commit of the branch: the branch stays ready for the request the owner will open
  in the morning.
- A cargo mark in the intake is not set at night: it states that the edit is in the main branch,
  while overnight the branches do not even leave for the hosting.
- `.claude/hooks/cargo-mark-guard.sh` refuses a turn that removed the task folder by `git rm` while
  the grill names cargo record keys and no mark was set. At night that mark must not be set. The
  archive pattern removes the folder by `rm -r`, and a night task taken from the cargo follows it.
- The turn-exit guard refuses a working turn under an open epic until a question through the tool,
  another guard's refusal, a handover or the owner's word to stop (`.claude/hooks/turn-exit-guard.sh`,
  `.claude/hooks/turn-exit-verdict.sh`). The boundary from `/night` is not among them, so the
  command ends the night with a question through the tool.

## What this is checked by

- `bash projects/agent-kit/tests/run.sh` — the rules package suites are green after a resource edit.
- `pnpm run agent-kit:check` — the laid-out matches the package.
- `npm run check:docs`, `npm run check:specs` — the document paths and the specs without divergences.
