# What the push gate counts as a push

**Status:** in force · **Revision:** 2026-11-03 · **Scenario prefix:** `SC-AK`
**Depends on:** `delivery-gate`
**Laws:** `delivery`
**Procedures:** none

## Why

The push gate guard runs the whole gate set before a push, and the set takes minutes. Which call is
a push therefore decides two things at once: a call taken for a push waits for the set for nothing,
and a push not taken for one leaves unchecked. Three intake records named both misses in one guard.
A read of pipeline runs filtered by the event `push` waited more than ten minutes. A push of all
branches and a push typed into the session terminal tab went through with no set at all.

The subdomain stands apart from the delivery gate because the delivery gate texts are at the length
limit.

## Terminology

| Word        | What it means here                                                                    |
| ----------- | ------------------------------------------------------------------------------------- |
| a push call | a `git` call whose subcommand is `push`, from the separator before it to the next one |
| a recipient | a ref after the remote in a push call, or the keys `--all` and `--mirror`             |

### What it is called in the interface

There is no interface: the guard is visible only to the executor — as the text of a refusal in their
own turn.

## Rules

- **A push is the subcommand `push` of the same `git` call.** It is looked for after `git` and its
  keys, up to the nearest command separator. The word in another command of the line, in a filter
  or in quotes is no push: a read of pipeline runs filtered by the event `push` ran the whole set
  for more than ten minutes and then refused a command that sends nothing.
- **Several recipients in one push are several pushes.** `--all`, `--mirror` and two refs after the
  remote send several branches, while the set judges only the current one. A loop is looked for over
  the whole command text, not line by line: written over several lines, it passed as one push.
- **A push typed into the session terminal tab is judged like a shell call.** The tab tool puts the
  command into the same field. Left out of the guard's list, it carried a push past the gate after
  two refusals.

## What is out of scope

- **A deletion push.** `--delete` and a recipient that starts with a colon send no branch, and the
  recipients of such a call are not counted. Whether it is refused as a push into a merged branch
  is the subdomain `delivery-merged`.
- **The gate set itself.** What runs before a push and how a red line is named is the subdomain
  `delivery-gate`.

## Contract

The subdomain has no procedures and no interface: it is the parse of a command inside the push gate
guard. Its surface is the tool list in the guard header and the command text of the call.

### Refusal codes

Not applicable: the guard answers with a refusal decision and a text, not with named codes.

## Data

Its own storage there is none: the parse reads the command text of one call.

## Screens and states

The subdomain has no screen: what it says is seen in the refusal text of the guard.

## Cross-cutting requirements

### Locales

The text of the refusal is in the language of the rules layer.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the guard judges one command of one turn.

## Decisions

- **A key value may hold spaces inside quotes.** The request header is passed by `-c` in that form,
  and a parse by spaces alone lost the push behind it.
- **Newlines become separators before the parse.** A loop over several lines is one text: matched
  line by line, `do` and the push stood apart.

## Open questions

None open.

## History of changes

- 3 November 2026 — the subdomain is created by task RT-3044 from three intake records.

## Scenarios

The scenarios lie in `scenarios.md` next to it.
