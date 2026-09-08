# The identity of the call that opens a request

**Status:** in force · **Revision:** 2026-09-06 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `delivery`
**Procedures:** none

## Why

The hosting client holds two accounts at once — the signed-in one and the one whose token stands in
the environment of the call — and which of them will open a request is visible from the text of the
command only by an explicit substitution. The reading calls go from the signed-in one and work, so
the writing one looks just as ordinary.

The miss surfaces one step later, at assigning a reviewer: the author of a request is never its
reviewer. It is fixed only by reopening — the author of a request cannot be changed — so the identity
has to be judged before the call, not after.

The subdomain names what the identity of a call is judged by, by which sign the guard recognises its
own business in a command at all, and where the last line stands at which the miss is still fixable.

## Terminology

| Word                 | Meaning                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------- |
| the machine record   | the account the tree conducts its work by: requests are opened and the assignee set by it |
| the token variable   | the name of the environment variable the token of the machine record is substituted by    |
| the command boundary | the sign by which the guard recognises a call in the text, not a mention of its name      |

### What it is called in the interface

There is no interface: the guard is visible only to the executor — as the text of a refusal in their
own turn.

## Rules

- **A request opened without the substitution of the machine record token is refused.** The text of
  the command is judged, not the answer of the hosting: there is no asking whose token the call will
  go by before it is carried out.
- **The refusal names the token variable and prints a ready substitution line.** A demand that names
  no way to fulfil it is carried out by memory, and memory is exactly what failed here.
- **A tree that named no token variable gets no demand.** For such a tree the identity of a call
  means nothing, and there would be nothing to refuse.
- **A command named by a path is recognised on a par with a bare name.** A client whose own name is
  taken by a shell alias is called by the full path; a sign that knew only the bare name did not
  recognise such a call at all and left with zero. The silence of a guard is indistinguishable from
  permission, so the sign is bound to err towards a surplus firing, not towards a miss.
- **A mention of the command name inside a string does not count as a command.** The sign allows a
  directory before the name and allows no crossing over a space: a part of a path stays inside one
  word.
- **The draft is not lifted from a request opened by other than the machine record.** This is the
  last line at which the miss is still fixable by reopening: after the draft is lifted the request is
  merged, and a merged one cannot be reopened.
- **The refusal at lifting the draft names both records and the reopening.** An executor who heard
  only "the wrong record" looks for a way to change the author — there is no way.
- **Who will come by the token is asked of the hosting, it is not derived from the text of the
  command.** The substitution speaks of an intent: it reads a file, and the file may not be on the
  machine — then the value is empty, the client answers from the signed-in record, and the request
  comes out from the owner at a command that looks right. Such a request has no reviewer, its author
  cannot be changed, and it is fixed only by reopening.
- **The tree asks, not the package.** The hosting, the client and the path to the token are each
  their own; the package holds the check of the answer against the machine record and does not know
  how to get it.
- **An empty answer stops no work, and it is reported.** "Asking did not work" and "the check came
  together" stay silent alike, so the skip reports itself by a line.
- **The delivery rule says that the active record of the hosting client is picked per machine, not
  per tree.** The machine record is substituted onto a call and is not made active: signing the
  client in under it takes every neighbouring session on the machine away, and from inside the tree
  the miss is visible by nothing. The article about the substitution alone allowed itself to be read
  as "the record is already active, there is nothing to substitute".

## What is out of scope

- The shape of a branch name, the task number and its state — the subdomain of the delivery guards:
  there the readiness of the work going on now is judged.
- Conflicting requests of one's own — a subdomain of its own: the subject there is neighbouring, and
  the sign is different.
- Who presses the merge: the identity of a call speaks of whose record the request is opened by and
  is silent about who is to merge it.

## Contract

The surface is the delivery guard on the event of a command and the shared input parsing helper that
gives the command boundary to all the guards at once. The refusal arrives as the decision `deny`
with the text of the reason; silence means the command is allowed.

### Refusal codes

Not applicable: the guard answers with a decision and the text of a reason, not with a code.

## Data

There is no data of its own: the name of the machine record and the name of the token variable are
declared by the tree in its profile, the author of a request is asked of the hosting by the work
queue helper.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The text of the refusal is in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the guard judges one command of one turn.

## Decisions

- **The identity is judged by the text of the command, not by the answer of the hosting.** There is
  no asking whose token the call will go by before it is carried out, and after it is carried out the
  request is already open.
- **The command boundary is declared in one place for all the guards.** Having diverged, the copies
  are fixed one at a time and stay silent about the rest being left blind.
- **The sign errs towards a surplus firing.** A guard that did not recognise a call stays silent and
  looks sound; one that fired on a surplus is seen at once and is fixed.

## Open questions

None.

## History of changes

- 2026-09-01 — the subdomain was created: two requests went out opened from the account of the
  owner, because the sign did not recognise a command named by a path; the scenario file of the
  neighbouring subdomain outgrew the length limit at that.
- 2026-09-06 — the delivery rule says that the active record of the client is picked per machine: in
  a consumer tree, signing the client in under the machine record took the identity away from the
  neighbouring sessions.

## Scenarios

`scenarios.md` next to it.
