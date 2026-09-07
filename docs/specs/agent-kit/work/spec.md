# Leading the work by commands

**Status:** in force · **Revision:** 2026-08-17 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`, `delivery`
**Procedures:** none

## Why

Three movements of the work the package carries as commands, not as words alone: creating a task
together with putting it into the work queue, closing the session and the ban on carrying the task
folder into the main branch. All three are forgotten one at a time, and what is forgotten is visible
only to whoever comes next.

The subdomain names what must be true at that: what a created task is confirmed by, what the closing
of a session does to the branch and to the handover, and why the task folder is taken apart before
the merge, not after.

## Terminology

- **Work by the rule** — work that has a task, a branch under its number and a task folder created;
  the command recognises it by the name of the branch and by the folder, not by a word of the
  executor.
- **A step of the work** — a named action of leading the work; the number of a step is one for the
  whole way from the exploration to the taking apart of the task folder.
- **The closing of a session** — the last actions of a session: the main branch brought to the remote
  one, the merged branches removed, the handover written.
- **A merged branch** — a local branch all of whose commits are already in the main one.
- **A dead tracking** — a local reference to a remote branch that is no longer in the remote.
- **The first column** — the column of the work queue a task is taken into work from. The name is
  given to it by the tree.
- **The state of a PR** — what the work queue answers about it by one answer: whether it exists,
  whether it is a draft and whether it has a review.
- **A review of a PR** — a requested reviewer or a left opinion, both not from the author of the PR.

### What it is called in the interface

| In the agreement            | In the launch line                                               |
| --------------------------- | ---------------------------------------------------------------- |
| creating a task             | the command of creating a task in the work queue                 |
| closing a session           | the command of closing a session                                 |
| the requirement of a folder | a refusal of the guard at a merge, with the reason of the bypass |
| the column of a task        | a refusal of the delivery guard with the name of the column      |
| a review of a PR            | a refusal of the guard at the lifting of the draft               |

## Rules

- **Every state of the work has a section in the pattern that leads it.** The cell of the table names
  the mandatory action, and the section says how it is done and why the turn does not end at it. A
  state without a section reads as the end of the work: the executor reads the pattern to the end,
  there is no next move in it, and they write a report.
- **A section about a state outside the list is the same divergence as a state without a section.** A
  renamed state otherwise leaves the former section, and that one looks in force.
- **The task folder does not go away into the main branch.** The opening of a request is refused
  while the branch carries the folder of its task; at the merge the same condition stays the second
  line. After the merge there is nobody to take it apart: the work has moved to the next task, and
  the request that would have removed the folder by the same commit is closed.
- **What is checked is what will go into the main branch, not what lies on the machine.** If the
  folder was deleted in the working tree but not committed, the check would pass, and the folder
  would go away together with the branch all the same.
- **A branch that took the folder apart adds a record to the directory of the archive.** Otherwise
  the requirement is met by deleting: removing the folder is easier than taking it apart, and the
  words of the owner are written down only in it. What exactly was moved the requirement does not
  check — that is looked at by the owner at the review.
- **The tidying stands before the opening of the request, not after the approval.** The merge button
  is pressed by a person on the page of the hosting, where the guard does not reach, and they merge as
  soon as they see green: there is no place left for a closing commit after the approval. There is no
  plan on the disk after the tidying, and the sign of handed-in work the guard of the progress of the
  work takes from the history of the branch.
- **The bypass of the requirement is written with a reason, and it is read without a network.** The
  line of the bypass is looked for in the text of the command, and, if the work queue is available,
  also in the body of the PR. If only the network way were left, without a network the guard would
  refuse the merge whose reason is written in that same PR. An empty reason is no bypass.
- **An open PR whose branch carries the folder of its task is a divergence of the check.** The guard
  judges the folder at the opening of the request, but it can be opened past the guard too — from a
  browser, where there are no hooks at all: the check says what the guard did not see. After the
  merge the same line is fixed already by a separate task. What is judged is the branch of the PR, not
  the working tree.
- **The line of the bypass begins the line and accepts no substitutions.** Otherwise the bypass lifts
  its own description: a text naming the line of the bypass is indistinguishable from it, and it is
  named both by the body of a PR about an edit of the guard and by the refusal of the guard itself.
  The acceptance of such a sign stayed green where it had to turn red — a sample line stood in the
  body.
- **The bypass lifts the refusal, but does not remove the line from the check.** If it put out the
  check too, in a month it would be used instead of the taking apart: the PR is open, the folder lies
  there, and nobody complains.
- **The folder is looked for by the name of the branch whole, together with the slash.** A name of the
  shape `chore/312-slug` is lawful, and the folder under it lies in a nested directory.
- **A tree that set no directory of tasks gets no requirement.** Leading the work by a folder is a
  choice of the tree, not of the package.
- **A task left in the first column of the work queue is not ready for delivery.** By the queue it
  reads as untaken, although the work on it is done and laid out; the refusal names the column and
  the command of the move.
- **The column is asked about where it should already have been moved.** At the creating of a branch
  it has not been moved yet: a requirement there would refuse the very first command of the work
  together with the one that lifts it.
- **The name of the first column is named by the tree, and without it the column is not judged.** Each
  tree calls the columns by its own words, and an invented default would coincide with nothing and
  would switch the check off silently.
- **The draft is not lifted while the PR has no review.** Neither a requested reviewer nor a left
  opinion — a lifted draft reads as "it can be merged", and there is nobody to merge it.
- **The draft is not lifted from a PR that does not merge either.** A green run says "not broken",
  mergeability says "the button can be pressed", and the owner needs the second: at a conflicting PR
  the button is locked by the hosting, and a lifted draft calls to press it. Mergeability arrives by
  the same answer as the reviewer and the opinion — the requirement creates no call of its own.
- **Silence about mergeability does not hold up the lifting.** A tree whose helper of the work queue
  gives no such field works as before: there is no field — there is no requirement. Otherwise an edit
  of the package would refuse the lifting of the draft at everyone who has not fixed their helper yet.
- **A reference to the PR at the lifting of the draft is not mandatory.** Without it the hosting
  client takes the PR of the current branch — that is the shortest shape of the call, and the
  requirement would be lifted by one space. A reference happens to be a number, an address and a name
  of a branch.
- **Returning a PR into a draft gets no requirement.** It does exactly what the requirement is after:
  it takes the look of readiness off the work.
- **The number of the PR in the refusal is taken from the answer of the work queue, not from the
  command.** Named by an address or by the name of a branch, the PR must stay recognisable; the number
  is written with a hash, the name and the address in quotes, because a hash before an address reads
  as a typo.
- **The author does not count as a review of their own PR.** A request of a review on oneself the
  hosting accepts silently and does not create — and the review looks requested at that.
- **The state of a PR is asked of the same helper of the work queue as the state of a task.** Having
  diverged, the guard and the check would understand "the PR has a review" differently.
- **An answer with the mark "there was no network" is not a state.** By it a PR that does not exist
  cannot be told from a PR nobody asked about — and a verdict about the review by such an answer would
  be invented.
- **A tier that needs an answer of the work queue stays silent without an answer.** There is no node,
  there is no helper, there is no network — there is no requirement: a check that falls in an
  aeroplane refuses the work instead of a miss.
- **A session is closed by one command.** Three movements — the main branch, the merged branches, the
  handover — are forgotten one at a time when apart, and the last is forgotten most often: the
  handover is written when the window is already full.
- **The command of closing a session first finds out whether the work is led by the rule.** On this
  depends where the working tree will stand: at work by the rule the branch after a merged PR is not
  needed, at work outside the rule it is the very place the work will go on in.
- **At work by the rule with a merged PR the local main is moved to the remote one without a switch to
  it.** The next session starts with the main branch brought to the remote one, not with a branch that
  is no longer in the work queue. The working tree is not touched at that: a switch is refused when an
  edit of a file lies in it that is not yet in the lagging local one — and it lies there by the word of
  the same command, which a step earlier ordered not to touch it.
- **The merged state of a branch is judged from the remote reference, not from the local main.** The
  local one lags silently, and at it a merged branch counts as unmerged: the tidying ends with a list
  of the unmerged that does not exist, and the command will not let those branches be removed anyway.
- **In all the other cases the main branch is merged into the current one.** Work outside the rule and
  work by the rule with a PR not yet merged behave the same: the branch stays the place the work will
  go on in, and the divergence with the main one is taken apart now.
- **An uncommitted edit stops the closing of the session before the first action.** A change of the
  branch carries the edit into another branch or is refused halfway; the executor is told what exactly
  is not committed.
- **Only merged local branches are removed.** An unmerged one is named aloud together with the number
  of commits past the main one and stays: removing it is cheaper than restoring it, and its commits
  are nowhere else.
- **The dead trackings are removed by the same call.** Otherwise the list of the branches grows with
  names that have not been in the remote for months, and the live ones stop being visible in it.
- **The handover is written last and put outside the tree.** By this moment it is known what became of
  the main branch and which branches were removed — and the next session starts with this. It does not
  go into the history: next to the progress of the work a second record about one and the same would
  be created.
- **The name of the main branch and the directory of the handover the command takes from the profile
  of the tree.** Nailed into the command, they lie in the first tree that keeps its main branch under
  another name.
- **The closing of a session does not touch the delivery.** The PR is not merged, the branch is not
  pushed: tidying blindly is lawful, a movement of the delivery is not.
- **The creating of a task ends with an answer of the work queue, not with the output of the
  command.** After the fourth step the command asks the queue by the number and prints what it read; a
  printed number means "the call went through", not "the task is visible to whoever works on it".
- **A task that is not in the work queue ends the command of creating with a non-zero code.** It is
  not provided with work: nobody will come for it, and silence here costs more than a refusal.
- **A task without an executor is named by a line of its own.** A nobody's task stands in the queue
  invisible to whoever does it.
- **A work queue that was not asked is no confirmation.** Not having asked it, the command says nothing
  about it: it names that the asking did not succeed and ends with a non-zero code.
- **The answer of the queue is put together into lines by a pure function.** The decision about what to
  print and what to end with is separated from the calls of the network: otherwise it is checked only
  by a live work queue.
- **A run at the tip of an open request pushed out of the queue of the pipeline is a divergence of the
  check.** The group of the queue keeps the run in progress and does not keep the waiting one: the
  hosting holds one waiting run in the group, and the next one that comes pushes the former out. The
  branch behind such a run was not checked by a single line, and by the work queue it looks checked —
  there is a run at the tip, and the check counts exactly the fact.
- **The pushing out is recognised by the number of the jobs of the run, not by the word of the
  cancellation.** A cancellation is a shared word for two cases: at a run stopped mid-way the jobs
  exist and their journals are read; at one pushed out of the queue there are zero of them, because it
  never began. By a measurement over seven cancelled runs of the tree the sign came out even: six
  pushed out with zero jobs and one stopped mid-way with one.
- **The number of the jobs is asked only of the cancelled runs of the tip.** It arrives by a call of
  its own, and asked of every run it would cost a call per run at every check.
- **The line of the pushing out names both commands and in the order they are called** — first the
  reading of the run, then its restart. The restart is refused by the guard while the journal of that
  job was not read during the same turn, and the order in the line meets the requirement by itself: the
  executor calls what is written and does not run into a refusal at the second step.
- **The pushing out is judged before the colour and before the absence of a run.** Otherwise one tip
  gets two lines about one thing. A green run at the same tip removes the line: the pushed-out one
  behind it is already restarted.
- **The mark of multi-session work is checked against the record in the line of the works both ways.**
  One without the other lies silently: the executor opens the card before the line, and plans by the
  line. A card without a record promises a multi-session nature the line knows nothing of; a record
  without a mark leaves the card looking like work for one session, and the next session takes it
  counting on closing it at once.
- **What counts as a record in the line is a row where both the word of the mark and the number of the
  task stand.** A bare mention of a number does not do: the line names all its tasks, and most of them
  are single-session — the reverse side would turn red at every one.
- **A rollout that fell is named apart from a production that lags.** The lag is counted by the last
  SUCCESSFUL rollout, and "was not launched" and "fell" look the same through it, while they lead to
  different things: the first is launched, the second is read by the journal and fixed. Four merges in
  a row went away on top of a breakage the first one brought, and production stood for almost two
  hours.
- **A rollout in progress does not count as a divergence.** It may still end in success, and a turn
  refused by it pays for a state that will be gone in a minute.
- **A tree that named no mark or no directory of the lines gets silence, not a refusal.** There will be
  nothing to tell a multi-session card from an ordinary one by, and the directory of the lines is its
  own at every tree.

## What is out of scope

- The colour of the run at the tip: a fallen one and one in progress are visible on the page of the PR
  themselves, and the check names only the absence and the pushing out of the queue.
- The group of the queue of the pipeline and its settings: the runner is one, and the group keeps it
  from two runs at once. A group by branch would remove the pushing out and would bring back the very
  thing the group was created for.
- The automatic restart of a pushed-out run: a workflow catching cancelled runs loops on a busy queue.
  It is pressed by the executor — by the line of the check.
- The reason an event did not reach the hosting: it is on its side, and by the list of the runs "did
  not start" cannot be told from "was not created".
- The completeness of the handover — it is judged by the owner, like the completeness of the taking
  apart.
- The moving of the column by the guard itself: an edit of the work queue inside the parse of a command
  would fall together with the connection and would refuse the work instead of a miss. The guard names
  the column, the executor moves it.
- The completeness of the work at the lifting of the draft: whether the stages of the plan are closed a
  machine cannot see.
- Merging a PR, a push and opening a PR by the closing of a session: that is delivery, and it is not
  done blindly.
- Restoring the work by a written handover: the order is held by the pattern, not by the command.

## Contract

The surface is two commands of the launch line and the delivery guards: at a merge, at the opening of
a PR and at the lifting of a draft. The creating of a task makes four steps — it creates a record,
puts the number into its title, adds it to the work queue and assigns the starting column — and by the
fifth it asks the queue by the number and prints what it read. The closing of a session first finds
out whether the work is led by the rule, and only then touches the branches.

### Refusal codes

Not applicable: the answer is an exit code and text, not named codes.

| What happened                                | Code | What it says                                                       |
| -------------------------------------------- | ---- | ------------------------------------------------------------------ |
| the task is not in the work queue            | `1`  | the number and that it is not provided with work                   |
| a task without an executor                   | `1`  | by a line of its own: a nobody's task is invisible                 |
| the work queue could not be asked            | `1`  | that the asking did not succeed, and why this is no answer         |
| an uncommitted edit at the closing           | `1`  | what exactly is not committed                                      |
| an unmerged branch at the closing            | `0`  | the name of the branch and the number of commits past the main one |
| the branch carries the folder of its task    | —    | the path of the folder and the line of the bypass with a reason    |
| the tip of an open PR without a run          | `1`  | the tip, its age and what to bring the event back with             |
| a green run at a PR that is a draft          | `1`  | the tip and what the draft is lifted by                            |
| the task stands in the first column          | —    | its column and the command of the move                             |
| the draft is lifted at a PR without a review | —    | that there is no review and that a reviewer must be assigned       |

The refusal of the guard of the merge has no exit code of the command: it refuses the call before it
is carried out.

## Data

There is no storage of its own. The state is read from the version control system and from the work
queue; the handover of the session is put outside the tree, the directory is named by the profile of
the tree.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the output of the commands is single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The name of the main branch, the directory of the tasks and the directory of the handover the command
takes from the profile of the tree. A tree that set no directory of tasks gets no requirement about a
folder at all: leading the work by a folder is a choice of the tree, not of the package.

## Decisions

- **A created task is confirmed by an answer of the work queue, not by the output of the command.** The
  command answers for its own calls: a printed number means "the call went through", not "the task is
  visible to whoever works on it".
- **The answer of the queue is put together into lines by a pure function.** The decision about what to
  print and what to end with is separated from the calls of the network: otherwise it is checked only
  by a live work queue.
- **A session is closed by one command, not by three movements.** Apart they are forgotten one at a
  time, and the handover is forgotten most often: it is written when the window is already full.
- **The requirement about the folder stands at the merge, not at the opening of the PR.** While the
  review goes, the plan lies on the disk: the edits by the remarks go into the same branch. At the
  opening of the PR a reminder stays.
- **The bypass is read without a network.** A single network way would refuse, without a network, the
  very merge whose reason is written in that same PR.
- **The bypass lifts the refusal but does not put out the line of the check.** Otherwise in a month it
  would be used instead of the taking apart: the PR is open, the folder lies there, and nobody
  complains.
- **The absence of a run is named by the check, not by the guard of the lifting of the draft.** The
  guard judges one turn and at a tip without a run lets the work go: the run may simply not have
  started yet, and refusing at that would mean stopping the session in the middle of the work. The
  check asks the state of the queue whole, and only it can say "there has been no run for a second
  hour".
- **A fresh tip is given ten minutes.** Rejected: judging right after the push — a check called right
  after it would turn red on a healthy branch, and by the very first movement people would unlearn
  reading it.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-08-17 — the subdomain was split out of the domain spec, which had outgrown the length limit.
  The rules, scenarios and bindings of leading the work by commands moved here as they were: the
  scenario numbers were not recounted.
- 2026-08-18 — the check of the work queue asks about the run at the tip of every open PR: a tip
  behind which a run did not start stopped being indistinguishable from a green one. By the same
  question the check names ready work left as a draft — four such PRs stood for two days.
- 2026-08-24 — the check names a run pushed out of the queue of the pipeline: it ends with a
  cancellation and in the list is indistinguishable from a fallen one, although it checked the branch
  by not a single line. The sign is the number of the jobs of the run.
