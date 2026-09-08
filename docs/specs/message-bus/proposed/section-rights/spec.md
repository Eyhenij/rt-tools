# A section closed by a right: the menu item and the address

**Status:** proposed · **Revision:** 8 September 2026 · **Scenario prefix:** `SC-MB`
**Depends on:** `docs/specs/message-bus/access-rights/spec.md`
**Laws:** `access`, `navigation`
**Procedures:** none — the operations are declared by the controllers of the receiver

An agreement about the product written before the code. It merges into the subdomain of the right,
the role and the check that reads them, and does not reach the main branch as a separate document.

## Why

The rights exist, and nothing is closed by them. The menu of the admin panel is the same for
everyone who signed in, and the routes are closed by one guard over the whole branch: let in —
means let into all four sections. A section cannot be hidden by markup: the address opens by a
direct link anyway, and the receiver answers the request of anyone signed in.

So the rights of the previous task are read by nobody: a person is given a role, and they see the
same admin panel as before.

This agreement names what closes a section: one declaration for the item and the address, the same
right on the receiver's side, and what a person sees when no section is open to them.

## Terminology

| Term                   | What it is                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| A section              | A screen of the admin panel with an address of its own; a menu item leads into it                               |
| The right of a section | The right of reading that section: `postmortems:read`, `proposals:read`, `summaries:read`, `invites:read`       |
| The declaration        | The record of the menu item: the label, the address, the icon and the right                                     |
| The guard by a right   | The check standing on the children of the closed branch: it reads the right of the item whose address is opened |
| An open section        | A section whose right the signed-in person holds                                                                |

### What it is called in the interface

A person sees no word "right" anywhere: a section they have no right for is simply absent from the
top row. Where no section at all is open to them, the screen says that access has not been given
and names whom to ask.

## Rules

**The menu and the address.**

- **A menu item carries the right that opens its section, and the address is closed by that same
  declaration.** A second declaration of the link "an address and a right" — next to the routes —
  diverges from the first silently, and the result is "the item is not visible, and the page
  opens".
- **An item whose right the signed-in person does not hold is not drawn.** Not drawn greyed out,
  not drawn with a hint: the admin panel of the receiver has no sections a person may ask for.
- **The address of a closed section does not open by a direct link either.** The guard by a right
  stands on the children of the closed branch rather than on the branch itself: a guard of the
  branch runs once per page load and does not see moves between sections.
- **Until the answer about who signed in has arrived, nothing is hidden.** An empty top row after a
  network failure looks like a broken admin panel and leaves no way out; a request without a right
  is refused by the receiver anyway.
- **A person to whom no section is open sees the admin panel without sections, with their name and
  the way out.** They signed in, and the sign-in is not a defect: what is missing is the rights,
  and the screen says so instead of showing an empty page.
- **The root of the admin panel leads into the first section open to the person, not into the first
  of the list.** Otherwise whoever has no right for the first one lands on a refusal right after
  signing in.

**The receiver.**

- **The operations a section lives by are closed by the read right of that section.** A hidden item
  by an open operation closes the section only in appearance: the data is given away by a direct
  request to whoever signed in.
- **The set of rights is declared once and read by both sides.** The receiver names the rights of
  the operations, the admin panel the rights of the items; a second list of names diverges from the
  first silently, and both sides stay green — one closes by its name, the other asks by its own.
- **A right taken away closes the section on the next move, not on the next sign-in.** The rights
  arrive with the answer about the signed-in person, and the guard by a right asks the store, which
  the answer of the receiver fills.

## What is out of scope

- **The actions inside a section.** Closing a discussion, issuing an invitation and the rest are
  closed by the `manage` rights of their sections, and this agreement does not touch them.
- **Editing roles and rights.** Nothing creates a role yet — that is the page of roles and rights,
  a task of its own.
- **Dividing the cargo by trees.** Who sees the cargo of which tree stays as it is.
- **The tree token.** The intake of the cargo is closed by it as before, and no right of a person
  opens it.
- **The operations that serve several sections at once.** The list of trees and the list of cargo
  versions fill the filters of every section, and the closing of records by a publisher touches two
  kinds of cargo in one packet. One right of one section cannot be written on any of them, and they
  stay closed by a sign-in; the question of what closes them is open below.

## Contract

The receiver gains no operation of its own by this agreement. What changes is the declaration of
the operations that already exist: where they were closed by a person's sign-in, they are closed by
the read right of their section.

### Refusal codes

Not applicable: the receiver answers with a code of the answer of HTTP, not with named codes of the
domain. Where an operation of a section is obliged to refuse instead of staying silent:

| What happened                                                         | Code  | What it says                                                  |
| --------------------------------------------------------------------- | ----- | ------------------------------------------------------------- |
| there is no sign-in, it expired, it was revoked or the account is off | `401` | that the operation demands a sign-in                          |
| there is a sign-in, and the read right of the section is not held     | `403` | that the operation demands a right; which one it does not say |

## Data

The storage gains nothing by this agreement. The right of a section is a name from the closed set,
and where that set lies is named by the subdomain of the right and the role.

## Screens and states

| The state of the person                               | What the top row shows               | What the body shows                                           |
| ----------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| the answer about the signed-in person has not arrived | all the items                        | what the address asks for                                     |
| some sections are open                                | the items of the open sections alone | the section the address names, or the first open one          |
| no section is open                                    | the name and the way out, no items   | a word that access has not been given, and whom to ask for it |

## Cross-cutting requirements

### Locales

The word about access not given goes through the dictionary of the admin panel, like every label
of the shell.

### SEO

Not applicable: the admin panel is closed by a sign-in and is not indexed.

### Mobile layout

Nothing of its own: the top row of the sections is drawn by the kit and stays as it is; an item
fewer changes no layout.

### Several objects

Not applicable: there is one receiver and one set of sections in it.

## Decisions

- **The right stands at the menu item rather than at the route.** The item already carries the
  address, and the guard reads the right from it: one declaration instead of two that diverge.
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
  one is enough, or a check inside by the parameter naming the section — and each of the three is
  wider than this task.
- **Whether a person without a single right should be told which rights exist at all.** Today the
  screen names whom to ask and nothing else. Naming the sections one has no access to would answer
  the question "what is here" — and would also give away what the receiver holds.

## History of changes

- 2026-09-08 — the agreement is written before the code by the task RT-1898.
