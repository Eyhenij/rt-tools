# The push set against its base, from its marks and ahead

**Status:** in force · **Revision:** 2026-11-03 · **Scenario prefix:** `SC-AK`
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
- **The parent** — the branch the current one was created from, as git wrote it into the branch
  reflog.
- **A green mark** — a file in the shared git directory saying: this check line passed on this
  tree of the head against this base.
- **A heavy step** — a check the tree profile names heavy: snapshots, end-to-end suites, builds,
  stands.
- **The run ahead** — the command `git-guard-push-ahead.sh`, which runs the whole set outside the
  hook and writes the marks.

### What it is called in the interface

There is no interface: the guard answers with a refusal text, the run ahead with lines of output.

## Rules

- **A stacked branch is counted against its parent, while the parent's remote copy lies in the
  history of the head.** A parent merged and removed, rewritten or moved past the head gives the
  main branch back.
- **A check green on the same tree against the same base is not run again.** The key is the check
  line, the tree of the head and the base commit.
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

- **The parent is read from the branch reflog, not from the base of an open request.** A request is
  a network call to the host on every push, and the first push of a stacked branch has no request
  yet — exactly the costly one.
- **The key holds the tree, not the commit.** An amended commit with the same content does not pay
  again.
- **Light checks without a mark still run inside the guard.** They take seconds, and the refusal
  then names everything at once.

## Open questions

None.

## History of changes

- 2026-11-03 — the subdomain was created: the push of a kit branch did not fit the hook limit, and
  the scenario file of the delivery gate is at its length limit. Task RT-3092.
