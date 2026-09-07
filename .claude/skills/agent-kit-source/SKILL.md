---
name: agent-kit-source
description: Editing the rules package itself: the order "edit, build, lay out", the two commands of this tree and sorting out the arrived proposals. Take it when a package resource is edited rather than a laid-out copy. The layout, the overrides and sending the cargo — the skill agent-kit.
---

# Editing the source of the rules layer

The rules package lives as sources in this tree: its resources lie here, here they are edited and
here what arrived from the trees that install the package is sorted out. Everything below is
unexecutable at a consumer of the package — there is no subject and nobody to call it — so the
package does not carry it.

The other half of the picture — the layout, the overrides, the tree traits and sending the cargo
upwards — is in the skill `agent-kit`: it is true for both sides, and a consumer reads only that.

## When to use

- A package resource is edited — a law, a rule, a pattern, a hook, a check, a role, a command.
- The proposals that arrived from trees are gathered, and it is decided what of them becomes an
  edit.
- The family of texts of one law is read — the rules under it and the patterns next to them.

## Order

An edit of a resource reaches a tree only through a build of the package: the launch line reads
the built output, not the resource sources. The order is always one and the same — edit, build,
lay out. A refusal on even one file writes nothing: half a layout is worse than a whole one.

```bash
pnpm run agent-kit:sync    # build the package and lay it out
pnpm run agent-kit:check   # build, write nothing, refuse on a divergence
```

Both commands first rebuild the package and only then read the built output: an audit that read
yesterday's build calls a divergence the very edit that never reached it.

**The place of an edit is held by a guard, not by memory.** It refuses an edit of a file with the
layout header at the minute of the edit and names the address: the package source — here it
exists — while as the second lawful form it names the override, for what is true only of this
tree. Before, only `sync --check` knew of this, and it spoke on the next layout, that is, in a
foreign branch and in a foreign turn: a copy is replaced by the very next layout, and until then
the audit refuses over the edited file whole and lays not one other — the price is paid by whoever
edited a neighbouring resource. Removing the copy the guard lets through: a removed file the
layout puts anew, and that is how a copy the formatter rewrote is fixed.

**A write over a non-empty override is refused by a second guard.** An override merges with the
package resource by section, and sections are added to it by different branches: laid whole, it
carries away those this edit did not touch, and the package text silently comes back in their
place. The refusal names the size of what would be wiped; appending at the end and editing in
place pass.

**The build cache goes stale silently.** The built output is taken from the cache while the
builder counts the input unchanged, and the audit reads yesterday's resources, calling the
divergence a layout one. It is cured by removing the built output together with a build past the
cache — one flag is not enough while the build directory is in place: a removed output the builder
restores from the cache without building a line.

Both layout commands now call a clean build themselves, and this is typed by hand only where the
builder is called directly, past the tree's commands:

```bash
rm -rf dist/agent-kit && pnpm exec nx build @rt-tools/agent-kit --skip-nx-cache
```

There is no trade of "slower but right" here: a clean build of the package takes 3.0 s against
3.3 s from the cache — measured 26 August 2026, repeated by that same pair of commands.

There are two signs of this, and by one alone the refusal is not recognised. The first: the audit
speaks of a file that is no longer in the source. The second: "the layout has not started: the
launch line reads the built output, and the resources were edited later", with the file it names
in place. The second sign reads like one's own unfinished edit, while it more often comes from
someone else's: the package resources are edited not only by the executor — the formatting hook
fixes them every time they land in the index, and such an edit holds no rollback. Over two
sessions this refusal took the push gate down five times, and not once had the executor touched
the edited file.

## The commands of this tree

Both are called here and nowhere else: one needs the editable resources and all the consumers at
once, the other the source texts of the family, which a consumer does not have.

| Command             | What it does                                                                  |
| ------------------- | ----------------------------------------------------------------------------- |
| `/agent-kit-digest` | gathers the accumulated proposals and observations into resource edits         |
| `/rules-review`     | reads the family of texts of one law and looks for what no check counts        |

Both bring their findings to a person and edit nothing themselves: the texts of the rules layer
act on all future sessions of all trees, and the owner decides on them.

## Sorting out the arrived proposals

The proposals arrive in the intake — by a send of its own from every tree, this one included.
They are sorted out here, where the editable resources lie and all the consumers are visible at
once: a tree that only installs the package has only its own half of the picture.

What the cargo is read by, what taking a record into work means and when it gets the marks of a
fix and of a release is said by the rule `cargo-triage`; the ready-made mark calls are in the
pattern `cargo-triage-mark`. The gathering itself is the work of the command `/agent-kit-digest`,
and from sorting out the cargo it needs one step: the list of what is not sorted out.

## Pitfalls

- **A release is not started from here.** Merging the package's request publishes nothing:
  publishing is a separate decision of the owner and a separate manual run. The gathering says
  what has accumulated for a release, and stops.
- **A resource the consumer does not carry out is never a package resource.** The sign is two
  questions to it: does the consumer have what it speaks of, and is there anybody there to call
  it. "No" to even one — the resource stays this tree's own resource, on a par with a package one:
  the same shape, the same law above, its own branch in the gate map. This is held by the boundary
  check, and it stands in the push gate.
