# A right, a role and the check that reads them

**Status:** proposed · **Revision:** 8 September 2026 · **Scenario prefix:** `SC-MB`
**Depends on:** `docs/specs/message-bus/admin-auth/spec.md`
**Laws:** `access`
**Procedures:** none — the operations are declared by the controllers of the receiver

An agreement about the product written before the code. It is merged into the spec of the domain by
the last commits of the task branch and does not reach the main branch as a separate document.

## Why

Everyone who signed in to the receiver can do everything. The access check knows three kinds —
an open operation, a token of a tree and a person's sign-in — and inside "a person's sign-in" it
tells nobody from anybody. So there is nothing to give somebody a look at the incident analyses
without giving them the closing of those analyses, and nothing to let a person into one section
without letting them into all four.

The refusal is one for every case: 401. "You did not introduce yourself" and "this is not for you"
are answered by the same words, and the admin panel cannot tell the two apart either.

## Terminology

- **A right** — the pair "resource and action", written as one string: `postmortems:read`,
  `postmortems:manage`, `accounts:manage`. The resource is a section of the receiver, the action is
  what is done in it.
- **A role** — a named set of rights, given to a person whole.
- **A pointed edit** — one right given or taken away from one person over their role.
- **The rights of a person** — the rights of their role with their pointed edits applied over them.

### What it is called in the interface

The words "right" and "role" are seen by the owner on the screens of the tasks that follow this
one. This agreement adds no screen: everything it starts is seen by a person only as a section
that opened or did not.

## Rules

**The right and the role.**

- **A right is the pair "resource and action", and the set of rights is closed.** A right absent
  from the set is not accepted anywhere: neither in a role, nor in a pointed edit, nor in an
  operation's declaration. Otherwise a typo in a right's name gives a role that permits nothing,
  and it looks exactly like a role that permits.
- **A role is a named set of rights, and a person has one role.** Two roles would have to be added
  up, and the result of adding a permission and a ban over two rows cannot be read.
- **The rights of a person are the rights of their role with their pointed edits applied over
  them.** A pointed edit either gives a right the role is silent about or takes away one the role
  gives.
- **A right the role says nothing about counts as not given.** Silence is not permission, and an
  absent right and one outright taken away mean the same.
- **A person without a role has no rights at all.** They sign in and see the sections none of which
  their rights name; this is a lawful state, not a defect.

**The check.**

- **An operation declares its access by one mark, and a fourth kind of mark appears — by a right.**
  The three that already exist stay as they are: open, by a token of a tree, by a person's sign-in.
- **The rights are read on every call rather than taken from the issued sign-in.** A sign-in says
  only who came: it lives for hours, and a right taken away would otherwise keep the section open
  until the end of the day.
- **A request without a sign-in is refused as unauthenticated, and a sign-in without a right as
  permission denied.** These are different answers: the first is cured by signing in, the second is
  not.
- **A refusal by a right does not name which right was missing.** By the difference of refusals one
  could read the set of rights of a foreign account.
- **A token of a tree carries no rights and opens no operation declared by a right.** The intake of
  cargo and the editing of its state by a tree stay closed as before.

**What the admin panel is given.**

- **The answer about the signed-in person carries their rights whole.** The admin panel decides
  what to show by them, and it asks the receiver rather than remembering the rights in the browser.
- **Until the rights are received the admin panel hides nothing.** An empty menu after a network
  failure looks like a broken admin panel and leaves no way out.

## What is out of scope

- **The screens.** The list of people, the panel of creating them and the page of roles are the
  tasks that follow; this agreement gives them what to stand on.
- **The division of the cargo by trees.** A right closes a section and an action in it; everyone
  who signed in sees the cargo of every tree, as before.
- **A password change by the person themselves.** The law names it an open question of its own,
  `Q-A-2`.
- **A second ownership.** The law speaks of a role per ownership; here there is one receiver and
  one set of roles in it.

## Contract

The receiver gains no operation of its own by this agreement. What changes is the answer of the
operation that already exists — the one about the signed-in person: next to the name it carries the
list of the rights of that person, computed at the minute of the request.

### Refusal codes

| Code | When                                                                                      |
| ---- | ----------------------------------------------------------------------------------------- |
| 401  | there is no sign-in, it expired, it was revoked, or the account is disabled               |
| 403  | there is a sign-in, and the right the operation declared is not among the person's rights |

## Data

| What                 | Fields                                                       | Why so                                                                                    |
| -------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| a role               | a key, a name shown to a person, the set of its rights       | the key is what an operation and a pointed edit refer to; the name is what a person reads |
| the role of a person | one reference from the account to the role                   | one role per person: two would have to be added up                                        |
| a pointed edit       | the person, the right, and whether it is given or taken away | one row per right: a row absent means the role decides                                    |

The set of rights themselves is not a table: it is a closed list in the code, and a right that
nothing declares is not a right but a typo.

## Screens and states

This agreement adds no screen. The only thing a person sees by it is a section that opened or a
refusal that came instead.

## Cross-cutting requirements

### Locales

The admin panel is written in one language, and the names of the roles are entered by a person.
The names of the rights are not shown to a person by this agreement at all.

### SEO

Not applicable: the admin panel is closed by a sign-in and is not given to search.

### Mobile layout

Not applicable: no screen is added.

### Several objects

There is one receiver, and the roles in it are shared. Several ownerships are out of scope.

## Decisions

- **The model is taken from the law of access, not invented anew.** The law already describes a
  right as a pair, a role as a named set and pointed edits over it. Rejected: two or three fixed
  roles without pointed edits — cheaper, but it cannot express "one extra right to one person";
  and a boolean sign "may edit / only looks" — it cannot express "look at the analyses without
  closing them".
- **The set of rights lives in the code, not in the storage.** A right is named by an operation's
  declaration, and a declaration refers to a name that exists. A table of rights would let a row be
  created that no operation reads, and it would look like a right.
- **The refusal by a right does not name the right.** The difference of refusals is a way to read a
  foreign account's rights one request at a time.

## Open questions

- **Whether the roles are created by the owner or come with the receiver.** A set that comes with
  the receiver is ready to work at once and goes stale as sections are added; created ones are
  empty on a fresh node. Decided by the task of the page of roles, `#1901`.

## History of changes

- 8 September 2026 — written as a draft of the task RT-1897.
