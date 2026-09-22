# A resource without a spec does not leave with the package

**Status:** in force · **Revision:** 2026-09-10 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/roles/spec.md`
**Laws:** `project-documentation`
**Procedures:** none

## Why

The epic that ends here closed a hundred and sixty-two gaps in the specs. Nothing keeps them closed:
the measure that counted them answers zero whatever it finds — the entry into the specs, called
without a name, prints the gaps and leaves with a success.

A number nobody refuses on is read once, by whoever asked. Half a year of edits, and the count comes
back to where it started, with no one minute at which it grew.

The subdomain puts the measure into the set before a push: a resource added without a spec refuses
the push instead of reaching the package in silence.

## Terminology

- **A resource of the package** — a file of the declared directories of the package sources that the
  layout carries into a consumer tree.
- **The measure** — the list of resources no spec speaks of, printed by the entry into the specs
  called without a name.
- **The set before a push** — the checks the push guard runs; a red one refuses the push.
- **A tree of the consumer** — one that holds laid-out copies and no package sources.

### What it is called in the interface

There is no interface: the check answers in the output of the push guard.

## Rules

- **A resource of the package is described by a spec of its kind before it leaves.** A complaint
  about a resource is checked against its spec and against nothing else: without one, taking a
  complaint apart goes back to memory.
- **The measure stands in the set before a push, not in a report to a person.** A number nobody
  refuses on is read once and never again.
- **The reading is asked from the command that prints the measure, not written a second time.** A
  reader of its own diverges from the printed list in silence, and two answers about one tree
  disagree.
- **The refusal names the count and prints the resources, a line each.** Told only that something is
  uncovered, the executor asks the measure again by hand.
- **A tree that declared no directories of package sources is not judged.** It holds laid-out
  copies; demanding a spec of someone else's package from it is demanding the impossible.
- **A tree with no entry into the specs laid out is not judged either, and the check says so.**
  Silence there reads as "nothing found", and that is the very miss the check exists against.
- **The check judges the tree, and the entry judges one resource.** One exit code answering two
  different questions already cost this epic a task of its own.

## What is out of scope

- Which spec speaks of which resource: that is the entry into the specs.
- The content of the specs of the kinds: they are the neighbouring subdomains.
- The wording of a spec: that is the rule about texts.

## Contract

The surface is a check called by a command. The exit code says whether the push goes on.

### Refusal codes

Not applicable: the check answers with an exit code and a text.

| What happened                            | Code | What it says                             |
| ---------------------------------------- | ---- | ---------------------------------------- |
| every resource is spoken of by a spec    | `0`  | that the coverage is whole               |
| a resource is uncovered                  | `1`  | the count and the resources, a line each |
| the tree declared no package directories | `0`  | that there is nothing to judge           |
| the entry into the specs is not laid out | `0`  | that there is nothing to ask with        |
| the entry answered with a failure        | `1`  | that the list could not be read          |

## Data

There is no storage of its own. The list is read from the entry into the specs.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the refusal is single-language, and it is the language of the rules layer.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The check is laid out into every consumer tree and stays silent there by design: a consumer declares
no directories of package sources.

## Decisions

- **A check of its own rather than a flag on the entry.** One exit code answering two questions was
  already the subject of the first task of this epic.
- **No list of accepted debt.** The epic closed the gaps whole, and a list started at zero would
  fill up: what a tree cannot cover it names as a spec statement with the verdict of not being
  carried out.

## Open questions

- `Q-CG-1` — the check judges the fact of a binding, not what the spec says about the resource: a
  statement bound to a file it says nothing about passes it.

## History of changes

- 2026-09-10 — the subdomain was created: the measure of the uncovered stands in the set before a
  push, and the epic of the coverage ends by it.
