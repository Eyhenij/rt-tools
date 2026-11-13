# The push set against its base, from its marks and ahead

**Status:** in force · **Revision:** 2026-11-13 · **Scenario prefix:** `SC-AK`
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
  branch a merge of the host brought into this one. A head that is no branch gets the main branch.
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
  clean copy.**
- **Running ahead is declared by the tree, not by the package.** The package does not know how long
  another tree's heavy steps take.

## What is out of scope

- What the set holds and how a step is chosen by what the branch touched — the tree profile.
- The rest of the push guard: what counts as a push call, a second working copy, several pushes in
  one command — the subdomain of the delivery guards and the push gate.
- Making the heavy steps themselves shorter.

## Contract

The surface is the push guard's decision on a push call and the exit code of the run ahead.

### Refusal codes

Not applicable: the guard answers with a refusal text. The run ahead exits with 0 — green, 1 — a
red check, 3 — the run did not start. Not 2: to a hook that code means "refuse".

## Data

The marks lie in `<git common dir>/rt-kit/push-green/`, a file per key, the check line inside. They
are shared by every working copy of the repository and never land in history.

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

- **The base is read from the remote refs of the working copy, not from the branch reflog and not
  from an open request.** The reflog line is absent in a branch taken in another copy and names
  nothing for a branch created from the checked-out head; a parent merged and removed from the
  remote sent every branch above it to the main branch, and a branch of texts then ran two
  snapshot sets, the end-to-end suites and two image builds — forty to sixty minutes. A request
  is a call to the host on every push, and the first push of a branch has no request yet.
- **The refs of branches removed from the remote are not pruned by the guard.** A lower branch
  merged and removed stays the nearest one for the branch above it until the branch it was merged
  into comes nearer. The fetch names that outright: a copy whose settings prune on every fetch
  would lose the ref in silence.
- **The main branch is a candidate even when its tip is outside the history of the head.** Left
  out once it moved ahead, it gave its place to the stale ref of a branch merged long ago, and a
  branch of texts taken from the main one was charged for the snapshots of that branch.
- **A branch a merge of the host brought into this one is no base.** It is the content of this
  branch. Counted against its last merged task, the branch of an epic reached the main branch
  with nothing checked against it before the push.
- **A branch outside the history of the head needs a merge of the host to be a candidate.** Git
  alone cannot tell which of two branches was taken from the other: the branch of an epic moved
  by a merged neighbour and a task that stands on an old tip of this branch look the same. The
  merge of the host is the one sign that tells them apart without a call to the host.
- **The host's merge is told by its committer, not by its subject.** The subject of a merge here
  is the title of the request. A tree whose host signs otherwise names the signature itself.
- **What the base trusts.** A branch on the remote got there through this set, so the commits it
  holds are not checked again. A branch that reached the remote past the set — pushed from a
  terminal with no hook, edited on the host — lifts its content from the set of every branch
  that takes it in. The pipeline of a request into the main branch still runs over the whole.
- **The answer depends on the remote refs the copy holds.** Working copies of one repository
  share them; a fresh clone holds no ref of a branch removed earlier and takes the next nearest.
- **The own copy is told by the name of the branch, not by what the branch tracks.** A branch
  taken straight from a remote one tracks that one, and the branch of the epic would pass for the
  own copy. The price: a branch pushed under another name is counted against that copy, by its
  last commits alone.
- **Known limits, all of one cause — git does not record which branch was taken from which.**
  A branch that stands on this one and carries a merge of the host passes for a base: the branch
  of an epic with a second epic taken from it is then counted against that one, not against the
  main branch. A merge the host made of the epic into a task makes the epic that task's content,
  and the task is counted against the main branch. An epic moved by a plain push, not by the
  host, is no candidate for a task on its older tip until the task takes it in. The first lets
  the whole of an epic reach the main branch checked only by the pipeline of its request; the
  other two cost a full set.
- **The count is one call of git per remote branch.** Twenty branches take two seconds, three
  hundred take a quarter of a minute; the refs of removed branches pile up, since they are never
  pruned here.
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
