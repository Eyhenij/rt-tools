# The push set against its base, from its marks and ahead

**Status:** in force · **Revision:** 2026-11-23 · **Scenario prefix:** `SC-AK`
**Depends on:** the subdomain of the delivery guards and the push gate
**Laws:** `delivery`, `verifiability`
**Procedures:** none

## Why

The push guard runs the whole set synchronously inside a hook, and a hook has a limit of 30
minutes. A branch of a kit with a showcase took longer: the snapshots alone ran 23 minutes, and the
end-to-end suites and a stand came on top. A guard cut by the limit lets the call through with no
verdict, so the push stood half an hour and then left unchecked — or did not leave and broke the
session. Three things made it longer than it had to be. A stacked branch paid for the whole stack
under it. A second push of the same tree ran the snapshots again. The heaviest steps had nowhere to
run but inside the guard.

## Terminology

- **The base** — the remote branch the contribution is counted against; the set picks its steps by
  what the branch touched against it.
- **A merge of the host** — a merge commit the host made when a request was merged; it is told by
  the committer the host signs with.
- **A green mark** — a file in the shared git directory saying: this check line passed on this
  tree of the head against this base.
- **A heavy step** — a check the tree profile names heavy: snapshots, end-to-end suites, builds,
  stands.
- **The run ahead** — the command `git-guard-push-ahead.sh`, which runs the whole set outside the
  hook and writes the marks.

### What it is called in the interface

There is no interface: the guard answers with a refusal text, the run ahead with lines of output.

## Rules

- **The push set is counted against the remote branch the head has the fewest commits over.** A
  stacked branch is so counted against the branch under it, a task branch against the branch of
  its epic. What the main branch already holds is not counted. The main branch is a candidate
  always and wins a tie; of two other branches equally near, the one lying under the other is
  taken. A branch outside the history of
  the head is a candidate only when a merge of the host moved it past the head. Three kinds of
  branches are no base: the branch's own remote copy, a branch that stands on that copy, and a
  branch a merge of the host brought into this one. A branch stands on the copy when it holds its
  own copy on its first-parent line, or took it in with no merge of the host bringing it, and lies
  neither under the head nor at it; a copy a merge of the host brought in — reached by the first
  parent or through a merge of a session — or a branch under the head leaves it a base. A head that is no branch gets the main branch.
- **A ref of a branch the host no longer holds is no base.** The host is asked for its branches once
  per pick, and the name is matched whole. With no answer from the host the refs of the copy decide,
  and a line on stderr says so.
- **The push takes the base of the run ahead while the record fits the head.** The run ahead of a
  branch pins the base: a ref of its own at the commit of the base, which the steps get instead of
  the remote ref, and a record of the tree of the head, the head commit, the base and its commit.
  The push guard and the git hook take the pinned ref while the record fits the head: the same
  tree, or a head over the recorded one by plain commits. No record, one that does not fit, or a
  merge over the recorded head, and the base is picked anew; a new pick of the recorded branch at
  the recorded commit takes the pinned ref again.
- **The refusal «No green mark» names the base of the push and the base of the last run ahead.** A
  pinned base is named by its remote branch and commit; a record that does not fit the head is
  named «another history».
- **A head that adds no commit to its base is pushed with no check run.** Every commit of it
  already lies in that branch on the remote. The guard, the run ahead and the git hook all answer
  so; a head with no base on a remote is judged as before. The guard answers so only for a push of
  the checked-out branch under its own name: the head says nothing about another branch.
- **A check green on the same tree against the same base is not run again.** The key is the check
  line, the tree of the head and the base commit.
- **A check the profile names unread paths for is keyed by the rest of the tree.** A commit of
  those paths alone leaves its mark in force; a check the profile says nothing about is keyed by
  the whole tree.
- **A mark is trusted and written only on a clean working copy.** The checks run over the working
  copy, the push sends commits; the observations record the guard writes itself does not count.
- **A mark is not written when the tree changed while the check ran.**
- **A tree that runs its heavy steps ahead gets a refusal at once for a heavy step with no mark.**
  The refusal names every such step and the command that runs them, together with the red light
  checks; the guard runs no heavy step itself.
- **The run ahead runs the whole set, writes a mark for every green check and starts only on a
  clean copy.** A red set exits with a nonzero code, and the last `push ahead:` line of its output
  names the red checks.
- **A call that runs the set ahead and does not end with its exit code is refused with the ready
  form.** A background notice carries the code of the last command of the call, and a code printed
  into the output is no substitute for it. Only a background call is judged: a call in the
  foreground returns its output in the result. Refused: any command after the set by `;`, a newline
  or `||` other than `exit`, `exit $?`, `rc=$?` with `exit $rc` at the end or `|| exit N` with a
  nonzero N, unless `set -e` stands before the set; a pipe, unless `set -o pipefail` stands before
  it and it ends the call; `&`; `!`, except `if ! …; then …; exit N`; a run inside `$(…)`; a chain
  of `&&` that ends with `;`, a newline or `||` and no `exit $?`. `exit ${PIPESTATUS[0]}` does not
  count: the calls of the host run in zsh, which has no such array, and the call exits with 0. The set
  alone, with its output redirected or chained by `&&` to the end of the call passes; loops and
  groups closing after the set pass its code on. A text that only names the script passes, and a
  run inside `bash -c` or `eval` is judged by its inner text. The ready form is the set alone with
  its output in a log outside the working copy, named by the copy: a file in the tree makes the
  copy dirty, and the set does not start.
- **Running ahead is declared by the tree, not by the package.** The package does not know how long
  another tree's heavy steps take.
- **A check that passed over its time limit is red.** The limit is the tree's own measurement of the
  step; a step with no measurement has no limit. The refusal names both numbers and the words the
  tree gives it. There is no margin over the limit, and a limit is only ever lowered: the owner's
  word is «делать меньше по времени — ты можешь, делать больше по времени и тем самым ослаблять
  лимит — ты не имеешь права».
- **A push whose whole set ran over its time limit is red.** Each step can stay within its own limit
  while the set holds steps the change did not need. The limit is the tree's measurement of a whole
  set, and the refusal asks the executor to find out why before the next push. Such a run leaves
  no marks, so the same code does not pass on a second push by marks.
- **A change of hooks, defaults and scenario files runs only the scenario files that reach it.** A
  file reaches a hook by naming it or a hook that sources it, and the defaults by naming them or a
  hook that loads them. A change of the harness, the runner or any other package path runs all.
- **A step runs only when the change reaches what the step reads.** What a step reads is a record
  of its own calls: the files whose content it opens, the paths whose existence it probes, the
  directories it walks. An edit reaches a step through a file it read or a file of a kind it read
  in a directory it walked; an added, removed or renamed file — through a directory it walked or a
  path it probed; an edit of the step's own files reaches it always. The record is taken on a tree
  where the set is green: a red check stops early and leaves part of its reads unrecorded. The
  agent's observations and their marks are no read at any depth: the guards write a new file on every
  call, and a scenario run from a nested directory writes them there.
- **A step whose reads the record cannot see runs on every change.** That is a step that reads the
  history of the tree, a step that starts a process other than `node` and `git`, and a step the
  table does not hold. With no table or no base every step runs.
- **The table of reads is checked against what the steps read now.** A read the table does not
  cover is a refusal naming the step and the path. The check runs when a step or the table is
  touched.
- **A file the repository ignores is no read of a step.** A change to it never reaches the change
  list of a branch, and whether it exists is a state of the machine: a copy with `.env` and a copy
  without it record one table of reads.
- **A file that lies in the copy outside the history and is not ignored is no read either.** A
  draft or a patch leftover is a state of the copy; taken into the history, it is an addition in a
  walked directory and starts the step anyway.
- **The machine's global ignore file does not count, and one path git refuses does not stop the
  filter for the rest.** A path the global file alone hides stays a read. A name with a non-ASCII
  letter is matched as written.
- **A record keeps the kinds of processes the table already held for a step.** Whether a step
  starts a process may hang on the machine; a kept kind errs towards an extra run, never a skipped
  one. A table first recorded where the process does not start is refused once on a copy where it
  does, and one record there settles it for every copy.
- **A step with a recorded process kind is not traced by the table check.** It runs on every
  change already, so a new kind changes no choice: a refusal over it would name the machine — a
  platform suffix of a tool, a tool on the path. An edit of such a step's script does not start the
  check, and the check names how many steps it traced and how many it left out.

## What is out of scope

- What the set holds and how a step is chosen by what the branch touched — the tree profile.
- The rest of the push guard: what counts as a push call, a second working copy, several pushes in
  one command — the subdomain of the delivery guards and the push gate.
- Making the heavy steps themselves shorter.

## Contract

The surface is the push guard's decision on a push call and the exit code of the run ahead.

### Refusal codes

Not applicable: the guard answers with a refusal text. The run ahead exits with 0 — green, the
number of red checks, at most 100, — red, 3 — the run did not start. A code of 3 is also three red
checks: the last `push ahead:` line of the output tells them apart. Not 2: to a hook that code means
"refuse".

## Data

The marks lie in `<git common dir>/rt-kit/push-green/`, a file per key, the check line inside. They
are shared by every working copy of the repository and never land in history.

The pinned base is the ref `refs/rt-kit/push-base/<number>` in the shared refs, the number being
the `cksum` of the branch name. Its record lies in `<git dir of the copy>/rt-kit/push-base.d/<branch>`:
four lines — the tree of the head, the name of the base, the commit of the base, the head commit.
Both belong to one branch: the branches of a chain run ahead one after another in one copy. A run
ahead removes the records and the refs of branches the copy no longer holds.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The texts of the refusal and of the run are in English, as the rest of the guard.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Several working copies share the marks: a key holds the tree and the base, not the copy.

## Decisions

- **The call is refused whenever it does not end with the code of the set, `$?` printed into the
  output included.** On 21.11 a session saw «exit=1» in the output and read the notice «exit code
  0» as green; and the likeliest answer to a refusal of `| tail` — `; echo "exit $?"` after the
  pipe — prints the code of `tail`. A narrower guard that let printed `$?` through was tried and
  dropped on review. The script is not changed: it already exits with its verdict.
- **The base is read from the remote refs of the working copy, not from the branch reflog and not
  from an open request.** The reflog line is absent in a branch taken in another copy and names
  nothing for a branch created from the checked-out head; a parent merged and removed from the
  remote sent every branch above it to the main branch, and a branch of texts then ran two
  snapshot sets, the end-to-end suites and two image builds — forty to sixty minutes. A request
  is a call to the host on every push, and the first push of a branch has no request yet.
- **The refs of branches removed from the remote are not pruned by the guard, and they are no
  base.** A prune in one copy changes what a neighbouring copy measures, so the fetch keeps
  `--no-prune`. On 21.11 a set of half an hour took a removed branch as its base, a neighbour pruned
  the refs, and the push picked the main branch and refused as «No green mark». The host is asked
  which branches it holds: one call per pick.
- **The push takes its base from the run ahead, not from a pick of its own.** A pick at the push
  sees the host as it is then: a lower branch merged and removed during the set, or a nearer branch
  pushed meanwhile, gives another base and refuses a green set.
- **The steps run against a ref the run ahead pins, not against the remote ref.** A remote ref
  moves with a fetch of any copy and vanishes with a prune; a step that read it while it moved left
  no mark, and the push was refused after a green run. A ref of the run's own stands until the next
  run ahead of the branch, and nothing of the remote refs is written back.
- **The pinned ref is named by a number, not by the branch.** It stands in every line of the set
  that names the base, and the profile reads those lines by words a branch name may carry —
  `visual-gate`, `e2e`. Named by the branch, a light line passed for a heavy one, and its mark
  outlived a commit of paths a heavy step does not read.
- **A branch stands on this one by the own copy on its first-parent line or by a merge of its own,
  not by holding the copy anywhere.** On 19.11 a request of another task carried the copy of a
  task branch into the branch of its epic by a merge of the host; the epic was dropped, and the set
  ran about 33 minutes against the main branch. Either test alone leaves a hole: by the merge alone
  a branch above that the host merged a higher branch into passes for a base, by the first parent
  alone a branch above or a neighbour that took this one in by a merge of its own. The merge of the
  host is looked for in the whole branch, not on its first-parent line: a session that synced its
  epic with the remote one carries the host's merge behind a merge of its own.
- **The base is not written into the observation line.** The record of observations leaves the
  tree and holds no names of it; the refusal carries both bases.
- **A record fits a head over the recorded one by plain commits, not only the same tree.** The
  marks of the heavy steps outlive a commit of paths they do not read — the task folder taken
  apart, a line in a plan. A record bound to the tree alone dropped the base after such a commit,
  and the marks keyed by it were lost. A merge over the recorded head brings other branches'
  content, and counted from the old base it would pass for this branch's own: the base is then
  picked anew. A branch the host removed without a merge keeps the pinned base until the next run
  ahead; its commits reached the host through the set, as every base trusts.
- **A record is kept per branch.** One record per copy was overwritten by the next branch of a
  chain run ahead in the same copy, and the lower branch lost its base.
- **A run ahead with no answer from the host pins the base it picked from the refs of the copy.**
  The push then takes that base too: the set and the push stay on one base, and the stderr line of
  the run names the cause.
- **The main branch is a candidate even when its tip is outside the history of the head.** Left
  out once it moved ahead, it gave its place to the stale ref of a branch merged long ago, and a
  branch of texts taken from the main one was charged for the snapshots of that branch.
- **A branch a merge of the host brought into this one is no base.** It is the content of this
  branch. Counted against its last merged task, the branch of an epic reached the main branch
  with nothing checked against it before the push.
- **A branch outside the history of the head needs a merge of the host to be a candidate.** Git
  alone cannot tell which of two branches was taken from the other: the branch of an epic moved
  by a merged neighbour and a task that stands on an old tip of this branch look the same. The
  merge of the host is the one sign that tells them apart: the list of the host's branches says
  which exist, not which was taken from which.
- **The host's merge is told by its committer, not by its subject.** The subject of a merge here
  is the title of the request. A tree whose host signs otherwise names the signature itself.
- **What the base trusts.** A branch on the remote got there through this set, so the commits it
  holds are not checked again. A branch that reached the remote past the set — pushed from a
  terminal with no hook, edited on the host — lifts its content from the set of every branch
  that takes it in. The pipeline of a request into the main branch still runs over the whole.
- **The answer depends on the remote refs the copy holds and the branches the host holds.**
  Working copies of one repository share the refs; a ref of a branch the host removed counts in
  none of them, so a prune in a neighbour changes no pick.
- **The own copy is told by the name of the branch, not by what the branch tracks.** A branch
  taken straight from a remote one tracks that one, and the branch of the epic would pass for the
  own copy. The price: a branch pushed under another name is counted against that copy, by its
  last commits alone.
- **Known limits, all of one cause — git does not record which branch was taken from which.**
  A branch that stands on this one and carries a merge of the host passes for a base: the branch
  of an epic with a second epic taken from it is then counted against that one, not against the
  main branch. A merge the host made of the epic into a task makes the epic that task's content,
  and the task is counted against the main branch. An epic moved by a plain push or a merge of a
  session — one that synced it with the remote epic included — not by the host, is no candidate
  for a task on its older tip until the task takes it in; one that took the copy by a merge of a
  session, or by a fast-forward onto it, is dropped as standing on this one. A branch above
  this one passes for a base in two more histories: the host merged this one into it — the
  button that brings a request up to its base, or a request taken from the newer copy — or this
  one was pushed again after the branch above was taken from it, and the host merged a branch
  into that one. Git cannot tell either from the epic a request carried the copy into. A
  neighbour that took the epic in after the copy came, as near as the epic and earlier by name,
  takes its place: the set reads the same commits, and only the pinned base names the neighbour. The first
  and the last two let a branch reach the main branch checked only by the pipeline of its
  request; the other two cost a full set.
- **The count is a few calls of git per remote branch, and one call to the host per pick.** Twenty
  branches take two seconds, three hundred take a quarter of a minute; a ref of a removed branch
  is dropped before the count.
- **The key holds the tree, not the commit.** An amended commit with the same content does not pay
  again.
- **Light checks without a mark still run inside the guard.** They take seconds, and the refusal
  then names everything at once.

## Open questions

None.

## History of changes

- 2026-11-03 — the subdomain was created: the push of a kit branch did not fit the hook limit, and
  the scenario file of the delivery gate is at its length limit. Task RT-3092.
- 2026-11-12 — the base is the remote branch the head has the fewest commits over; the reflog
  line is no longer read. A branch above a merged and removed one was counted against the main
  branch and ran every heavy step. Task RT-3231.
- 2026-11-13 — a head that adds no commit to its base is pushed with no check run. The branch of
  an epic just taken from the main branch could not reach the remote without the whole set. Task
  RT-3282.
- 2026-11-13 — a check is keyed by what it reads when the profile names its unread paths. A
  commit of texts over a tree the set had judged green ran the whole set again. Task RT-3284.
- 2026-11-13 — a check that passed over its time limit is red. Steps the change did not need ran
  for 25 minutes of 34, and nothing said so. Task RT-3280.
- 2026-11-13 — a push whose whole set ran over its time limit is red. Task RT-3273.
- 2026-11-13 — a step runs only when the change reaches what the step reads, by a record of its
  own calls. The light checks ran on every change, the kit ones on a branch without a kit file.
  Task RT-3273.
- 2026-11-17 — one table for a copy with `.env` and a copy without it: ignored and untracked files
  are no reads, recorded process kinds are kept, and a step that runs always is not traced by the
  check. Task RT-3347.
- 2026-11-22 — a call of the run ahead that does not end with the exit code of the set is refused
  with the ready form. A red set run with `; echo "exit=$?"` after it came back as «exit code 0».
  Task RT-3469.
- 2026-11-23 — a ref of a branch the host removed is no base, and the push takes the base of the
  run ahead while its record fits the head. A green set of half an hour was refused as «No green mark»
  after a neighbour pruned the refs. Task RT-3465.
- 2026-11-23 — a branch is dropped for the own copy only when the copy lies on its first-parent
  line or no merge of the host brought it, and the branch is not under the head. The branch of an
  epic that a request merge brought the copy into was dropped, and the set ran against the main
  branch. Task RT-3426.
