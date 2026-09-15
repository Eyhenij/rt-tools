# A right, a role and the check that reads them

**Status:** in force · **Revision:** 10 September 2026 · **Scenario prefix:** `SC-MB`
**Depends on:** `docs/specs/message-bus/admin-auth/spec.md`
**Laws:** `access`
**Procedures:** none — the operations are declared by the controllers of the receiver

A subdomain of the domain "the intake of the cargo": what a person may do after the entry. The
entry itself — who came and how long that lasts — is described by the subdomain of the entry of a
person next to it; who the sections and the menu items are shown to — by the subdomain of the shell
of the admin application.

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
- **The rights are given by the same change that closed the operations.** Closing alone leaves
  every account that existed before it with an empty role, that is with no rights at all, and the
  intake answers a refusal to everyone, the owner included. The state before the closing is
  restored by the change itself, not by a query afterwards: a query is made on one machine and is
  absent from every other copy of the storage.

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

**The sections closed by a right.**

- **A menu item carries the right that opens its section, and the address is closed by that same
  declaration.** A second declaration of the link "an address and a right" — next to the routes —
  diverges from the first silently, and the result is "the item is not visible, and the page
  opens".
- **An item whose right the signed-in person does not hold is not drawn.** Not drawn greyed out,
  not drawn with a hint: the admin panel of the receiver has no sections a person may ask for.
- **The address of a closed section does not open by a direct link either.** The check by a right
  stands on the children of the closed branch rather than on the branch itself: a check of the
  branch runs once per page load and does not see moves between sections.
- **A person to whom no section is open sees the admin panel without sections, with their name and
  the way out.** They signed in, and the sign-in is not a defect: what is missing is the rights,
  and the screen says so instead of showing an empty page.
- **The root of the admin panel leads into the first section open to the person, not into the first
  of the list.** Otherwise whoever has no right for the first one lands on a refusal right after
  signing in.
- **The operations a section lives by are closed by the read right of that section.** A hidden item
  by an open operation closes the section only in appearance: the data is given away by a direct
  request to whoever signed in.
- **The set of rights is declared once and read by both sides.** The receiver names the rights of
  the operations, the admin panel the rights of the items; a second list of names diverges from the
  first silently, and both sides stay green — one closes by its name, the other asks by its own.
- **A right taken away closes the section on the next move, not on the next sign-in.** The rights
  arrive with the answer about the signed-in person, and the check by a right asks the store, which
  that answer fills.

## What is out of scope

- **The screens.** The list of people, the panel of creating them and the page of roles are the
  tasks that follow; this agreement gives them what to stand on.
- **The division of the cargo by trees.** A right closes a section and an action in it; everyone
  who signed in sees the cargo of every tree, as before.
- **A password change by the person themselves.** The law names it an open question of its own,
  `Q-A-2`.
- **A second ownership.** The law speaks of a role per ownership; here there is one receiver and
  one set of roles in it.
- **The operations that serve several sections at once.** The list of trees and the list of cargo
  versions fill the filters of every section, and the closing of records by a publisher touches two
  kinds of cargo in one packet. One right of one section cannot be written on any of them, and they
  stay closed by a sign-in; the question of what closes them is open below.

## Contract

The receiver gains no operation of its own by this agreement. What changes is the answer of the
operation that already exists — the one about the signed-in person: next to the name it carries the
list of the rights of that person, computed at the minute of the request.

### Refusal codes

Not applicable: the receiver answers with a code of the answer of HTTP, not with named codes of the
domain. Where an operation closed by a right is obliged to refuse instead of staying silent:

| What happened                                                         | Code  | What it says                                                  |
| --------------------------------------------------------------------- | ----- | ------------------------------------------------------------- |
| there is no sign-in, it expired, it was revoked or the account is off | `401` | that the operation demands a sign-in                          |
| there is a sign-in, and the declared right is not among the rights    | `403` | that the operation demands a right; which one it does not say |
| a token of a tree was presented to an operation closed by a right     | `401` | the same as without a sign-in                                 |

## Data

| What                 | Fields                                                       | Why so                                                                                    |
| -------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| a role               | a key, a name shown to a person, the set of its rights       | the key is what an operation and a pointed edit refer to; the name is what a person reads |
| the role of a person | one reference from the account to the role                   | one role per person: two would have to be added up                                        |
| a pointed edit       | the person, the right, and whether it is given or taken away | one row per right: a row absent means the role decides                                    |

The set of rights themselves is not a table: it is a closed list in the code, and a right that
nothing declares is not a right but a typo.

## Screens and states

No screen of its own is added. What the rights change is what the admin panel shows of the ones it
has:

| The state of the person                               | What the top row shows               | What the body shows                                           |
| ----------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| the answer about the signed-in person has not arrived | all the items                        | what the address asks for                                     |
| some sections are open                                | the items of the open sections alone | the section the address names, or the first open one          |
| no section is open                                    | the name and the way out, no items   | a word that access has not been given, and whom to ask for it |

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
- **The right stands at the menu item rather than at the route.** The item already carries the
  address, and the check reads the right from it: one declaration instead of two that diverge.
- **The item is hidden rather than shown disabled.** A disabled item tells a person about a section
  they will not be given anyway; the admin panel of the receiver shows what one may work with.
- **The root leads into the first open section rather than into a fixed one.** A fixed root would
  meet with a refusal exactly those whose rights start from the second section.
- **The screen without sections is a screen, not a redirect to the sign-in.** Whoever signed in and
  was thrown back to the sign-in reads it as a broken sign-in and repeats it.

## Open questions

- **What closes an operation that serves several sections at once.** A declaration names one right,
  while the list of trees and the list of versions are asked by the filters of all the sections, and
  the closing of records by a publisher moves records of two kinds in one packet. Three answers are
  visible — a right of its own for such an operation, a declaration of several rights of which any
  one is enough, or a check inside by the parameter naming the section.
- **Whether a person without a single right should be told which rights exist at all.** Today the
  screen names whom to ask and nothing else. Naming the sections one has no access to would answer
  the question "what is here" — and would also give away what the receiver holds.

## History of changes

- 8 September 2026 — written as a draft of the task RT-1897.
- 8 September 2026 — the sections closed by a right joined it from the draft of the task RT-1898.
- 15 September 2026 — the question where roles come from is closed by the subdomain `roles-page`:
  two roles come with the receiver by the migration, the rest the owner creates on the screen.
