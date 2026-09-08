# The signature of a machine commit

**Status:** in force · **Revision:** 2026-09-08 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `delivery`
**Procedures:** none

## Why

The service address of the hosting consists of a number, a login and a domain, and is matched by the
number: nobody checks the login next to it. A commit with a foreign number is ascribed by the hosting
to an outside person, and from the inside this looks right — the account name in the history is the
very one. That is how eleven commits went into the main branch under a foreign signature, and the
owner found it by reading the history by eye.

The subdomain stands apart from the delivery gate for the same reason its helper stands apart from
the guard: the signature has a check point of its own, conditions of silence of its own and a refusal
of its own. The boundary was drawn by the length limit — the shared text outgrew five hundred lines,
and the limit is not moved but the text split.

## Terminology

| Word                | What it means here                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------ |
| machine record      | the account the tree publishes work under; its mail is declared by the tree profile        |
| contribution        | the commits of the branch that are not in the main branch yet                              |
| a commit of its own | a commit that named itself by the machine record — by the author name or by the mail login |
| the repair          | a rewrite of the last commit carrying the declared mail in both signature variables        |

### What it is called in the interface

There is no interface: the guard is visible only to the executor — as the text of a refusal in their
own turn.

## Rules

- **The signature of a machine commit is judged before the commit leaves.** The refusal stands at the
  push: before it the signature is rewritten in place for the whole branch at once, after it by a
  forced send, and the price of the miss jumps exactly here.
- **A machine commit is recognised by its claim, not by its mail.** What is judged is a commit that
  named itself by the machine record; one that named itself by somebody else is not judged at all —
  otherwise the guard would refuse work a person did with their own hands in the same tree.
- **The mail of the machine record is checked as a whole value.** A sample "number, plus, login,
  domain" would pass with a foreign number, that is with exactly the miss the signature is read for.
- **The contribution of the branch is judged, not the whole history.** Commits already merged into
  main are not fixed by this branch, and a refusal over them would refuse the work instead of the
  miss.
- **The signature is read on the machine, without the network.** A network call would fall together
  with the connection and would refuse work where the signature is right.
- **The repair named in the refusal is let through by the refusal itself.** It is a commit too, and
  without the exception the guard refused it together with the miss: the divergence is removed only
  by a commit, and a commit is refused while the divergence is there. What is recognised is not
  trust in the line but the declared mail — the same address the guard named itself, in both
  signature variables at once, next to a rewrite of the last commit; faking that means putting the
  right signature. A send is never a repair, whatever stands in its variables: after it only a
  forced one helps.
- **A refusal about the signature names the commit by name and both mails.** A miss in one character
  is not found by eye: without the found and the declared value side by side the refusal would have
  to be taken apart by hand.
- **A tree that named no mail of a machine record gets no demand.** The package has no machine record
  of its own, and an invented one would refuse work in a foreign tree.

## What is out of scope

- **The identity of the machine record at the hosting.** Whether the login and the number belong to
  one account is asked over the network, and that is the subdomain of the identity of the call.
- **The work with the work queue.** A limit that took the queue away does not touch the signature:
  the first is read on the machine, the second goes to the hosting.
- **A commit already merged into the main branch.** This branch does not fix it, and a refusal over
  it would refuse the work instead of the miss.

## Contract

The subdomain has no procedures and no interface: it is a guard on the agent's commands. Its surface
is two points — a commit and a push — and one declared value, the mail of the machine record in the
tree profile.

### Refusal codes

Not applicable: the guard answers with a refusal decision and a text, not with named codes.

## Data

Its own storage there is none. The mail of the machine record lies in the tree profile; the login is
read from that same mail and is not declared a second time — two declarations of one login would
diverge silently.

## Screens and states

The subdomain has no screen: what it says is seen in the refusal text of the guard.

## Cross-cutting requirements

### Locales

The text of the refusal is in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the guard judges one command of one turn. Access rights it asks for none — the local
history is read without the network — and nothing here depends on the current moment.

## Decisions

- **The login is read from the declared mail, not declared as a second trait.** Two declarations of
  one login diverge silently.
- **The signature is not derived from the text of the command.** The mail is set by the variables of
  the call, and parsing would catch the same line that is already before the eyes of whoever typed
  it. The one exception is the repair, and it is recognised by the declared mail — faking that means
  putting the right signature.

## Open questions

None open.

## History of changes

- 8 September 2026 — the subdomain is separated from the delivery gate by the length limit; the
  rules, the scenarios and the bindings moved unchanged.

## Scenarios

The scenarios lie in `scenarios.md` next to it.
