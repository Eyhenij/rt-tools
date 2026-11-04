# The git hook before a push

**Status:** in force · **Revision:** 2026-11-04 · **Scenario prefix:** `SC-AK`
**Depends on:** `delivery-gate`, `push-sign`
**Laws:** `delivery`
**Procedures:** none

## Why

The push gate guard stands on the agent's tools only. A push from a terminal outside the session,
from another session through `git -C` or from an environment without the agent hooks ran no check
at all. A kit branch left this way from the session of another tree, was merged and turned the
kit's main branch red: types, style tokens and showcase snapshots were never run. The git hook runs
the same set whatever sends the push, because git calls it, not the agent.

The subdomain stands apart from the delivery gate because the delivery gate texts are at the length
limit.

## Terminology

| Word              | What it means here                                                                 |
| ----------------- | ---------------------------------------------------------------------------------- |
| the git hook      | the package template `pre-push.sh`, wired by the tree into the git hooks directory |
| the mark of green | the file `rt-kit-push-green` in the git directory: the commit a green set judged   |
| the tip           | the commit the working copy stands on                                              |

### What it is called in the interface

There is no interface: the hook is seen as its lines in the push output and as a cancelled push.

## Rules

- **The git hook runs the gate set of the profile on every push it judges.** The set is
  `rt_push_checks <base>` from the package default and the tree profile, read the way the session
  guard reads it, every line run and every red one named. A red set cancels the push: git does not
  send it.
- **The hook and the session guard run the set by one code.** The profile is read with the root of
  the repository the push goes from, not with a root the caller exported. After a red check no
  heavy one starts, and those not started are named. A check that exits with the skip code is named
  apart and refuses nothing; a skip code of 0 or 1 is not taken, because 1 is the exit of any
  failure.
- **A commit the session guard judged green runs no second set.** The guard writes the tip it let
  through into the mark of green, and a push of exactly that commit passes at once. The next commit
  is not covered by the mark. Without it a session push would wait for a fifteen-minute set twice,
  and the session would be cut off. The mark lies in the shared git directory, so a push from a
  second working copy sees it.
- **The mark of green is written only for a set that judged the commit.** A set where every check
  was skipped judged nothing. A working copy with uncommitted edits to tracked files was judged
  together with them, not the commit alone. Files outside the history do not count: a working copy
  keeps folders of other tasks, and the mark would never be written.
- **The hook lets through only a push of the tip.** The set judges the tree the working copy stands
  on. A push of another branch, of a tag on another commit or of an older commit is refused with
  the refs named: a green set would read as a check of what left, though it checked something else.
  A tag on the tip passes.
- **A push that sends no commit is not judged.** A deletion of a remote branch sends no tree, and
  the hook passes it without the set.
- **The pipeline is its own gate.** Under `CI` the hook passes: a hooks manager installs it on the
  runner too, and the pipeline's own pushes would wait for the whole set there.
- **The hook is a package resource laid out with the other hooks.** The layout puts it into the
  hooks directory of the tree, executable and with the layout header. It has no `rt-hook:` header
  and enters no agent settings: git calls it, and the tree wires it to git by its hooks manager or by
  the calling line the template header names. The hook stays where the layout put it, next to the
  shared set code; a hook without that code next to it says that no check ran.

## What is out of scope

- **A skip of the hooks.** `git push --no-verify`, `-c core.hooksPath=<path>` and `HUSKY=0` skip
  the git hook by git's design. Inside the session they are refused by the subdomain
  `no-verify-guard`; outside it nothing refuses them.
- **The per-check marks of a set run ahead.** The mark here holds one commit and the whole set; a
  run ahead of the push is another subdomain's work.
- **The wiring in a tree without a hooks manager.** The template header names the calling line,
  as the commit message template does; nothing installs the hook by itself.
- **A dry run.** Git calls the hook for `git push --dry-run` too and gives it no sign of that, so a
  dry run runs the whole set and is refused on a red one. A green dry run writes the mark, and the
  real push after it passes without a second set.
- **A dirty working copy.** The set runs on the tree as it lies, as the session guard runs it;
  what is not committed is judged together with what leaves.

## Contract

The subdomain has no procedures and no interface. Its surface is what git gives the hook — the
remote name and address as arguments, a line per pushed ref on the input — its exit code, the
lines it prints to the error stream, and the mark of green it reads and writes, as the session
guard writes it.

### Refusal codes

Not applicable: the hook answers git by a non-zero exit code and a text, not by named codes.

## Data

One file: the mark of green in the shared git directory, one line with a commit. It is written by
the session guard and by the hook itself on a green set of a clean copy, and read by the hook.

## Screens and states

The subdomain has no screen: what it says is seen in the output of the push.

## Cross-cutting requirements

### Locales

The text of the refusal is in the language of the rules layer.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Several refs in one push are judged one by one: every ref that does not send the tip is named, and
one such ref refuses the whole push.

## Decisions

- **The mark is a file of its own, not a shared store of check results.** A store of per-check
  results is being built by other work and is not in the package yet; this task does not wait for
  it. When it lands, the hook may read it instead of the single commit.
- **A push of a commit other than the tip is refused, not judged by checking it out.** Checking a
  commit out inside a hook would move the working copy under the user's feet; the refusal names
  the branch to switch to instead.

## Open questions

None open.

## History of changes

- 4 November 2026 — the subdomain is created by task RT-3046 from an intake analysis of another
  tree: a kit branch pushed from a foreign session past the kit's gate.
- 4 November 2026 — by the review of the same task: the hook and the guard run the set by one code,
  the root is taken from the repository, the mark lies in the shared git directory and is written
  only on a clean copy; a dry run is named out of scope.

## Scenarios

The scenarios lie in `scenarios.md` next to it.
