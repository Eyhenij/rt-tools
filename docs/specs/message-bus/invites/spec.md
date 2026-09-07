# The section of the invitations

**Status:** in force · **Revision:** 2026-08-19 · **Scenario prefix:** `SC-MB`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`, `lists`, `entity-editing`, `navigation`
**Procedures:** none — the operations are declared by the controllers of the intake

A subdomain of the domain "the intake of the cargo": what the owner calls a tree to themselves by and
what they get in the section of the invitations. The entry of a person, the shared mechanics of the
lists and the panel of details are described by the subdomain of the reading of what was taken in
next to it; the life of the invitation itself after the issuing — by the subdomain of the intake.

## Why

A tree introduces itself to the intake by a token, and it gets the first token by an invitation — a
one-time code the owner issues. While the invitation was issued by one command of the node, calling a
tree could be done only by whoever has access to the node itself: the owner went to the node and
typed the command there.

Hence this section: the list of the issued invitations with their state, the revocation of one not
used yet and the issuing of a new one — by a panel, from the same admin application.

## Terminology

The vocabulary of the domain whole is in the spec of the domain next to it; the invitation and its
states are described by the subdomain of the intake. Here only what lives in the section:

| Term                           | What it is                                                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| The section of the invitations | The screen with the list of the issued invitations: a row per invitation, the state, the terms                                |
| The entry of creating          | A button above the list, by which the panel of the issuing is opened. It belongs to this one section                          |
| The panel of creating          | The panel where the owner names the name of the future tree and gets the code. It opens by an address of its own              |
| The showing of the code        | The only place and the only time the code of the invitation is visible to a person: the answer to the issuing                 |
| The name of the future tree    | The readable name the tree will be created under, having used the invitation up. It is named by the owner, not by the request |

### What it is called in the interface

| In the agreement        | On the screen                                                            |
| ----------------------- | ------------------------------------------------------------------------ |
| the section             | the menu item "Приглашения" and the page behind it                       |
| the entry of creating   | the button "Пригласить проект" in the toolbar of the section             |
| the panel of creating   | the curtain "Приглашение проекту" to the right of the list               |
| the showing of the code | the field with the code and the button "Скопировать" in the same curtain |
| the term of validity    | the line "Годен до <date and time>" next to the code                     |
| the revocation          | the item "Отозвать" of the menu of the row and the question behind it    |

A tree is called a project on the screen. A word of the vocabulary of the project says nothing to a
person: they open the admin application to look at their projects, not at trees. The analysis of the
miss is the record "2026-08-19-tree-word-shown-to-users" in the intake.

## Rules

**The invitations of the trees.**

- **The invitations are shown by a section of their own, not by a tab of a section of the trees.**
  There is no section of the trees in the admin application at all — the trees live as a dropdown of
  the filter — and no section has tabs: a tab would demand creating both a section and the mechanics
  of the tabs under one list.
- **The section of the invitations is put together by the same list screen as the sections of the
  cargo.** It creates no layout of its own: put together anew, it would diverge from its neighbours
  silently.
- **The code is visible once — in the panel that issued it.** Only the hash lies in the storage, and
  there is nowhere to show the code a second time from: neither the row of the list nor a panel opened
  anew carries it. The row names the name of the future tree, the state, the terms and the sign of the
  tree that was created by this invitation.
- **The section has no filter by tree.** An invitation waits for a tree that does not exist yet, and
  by it only the used-up ones could be narrowed.
- **An empty list names the button an invitation is issued by.** The section has no filter, and there
  is nothing to explain the emptiness by: empty here means that none were issued. Earlier a person in
  an empty section was left to go to the node for the command; now an invitation can be issued from
  here.
- **The admin application has two edits over the records of the intake — the issuing of an invitation
  and its revocation.** It still only reads the cargo; the invitation, though, is created by the
  owner, and there is nowhere else to create it, apart from the node. The revocation is available to
  one waiting invitation: a used-up, an expired and a revoked one are already irreversible, and an
  item shown at them would promise an action that does not exist.
- **The revocation asks for agreement and names the consequence.** A revoked invitation does not come
  back — the tree will need a new one; the question says that, not "are you sure".
- **A revocation that succeeded rereads the list whole.** Over the time the person was looking at the
  screen, the neighbouring invitations could both be used up and expire.
- **About the outcome of the revocation speaks the shared bus of the notifications.** A message of its
  own on the screen diverges from the neighbouring ones in look, in place and in the time of the
  showing.
- **A created tree is named in the row by the sign, not by a link.** There is nowhere for a link to
  lead: a tree has no screen of its own.

**The issuing of an invitation.**

- **The entry of creating stands in the toolbar of the section of the invitations.** The former rule —
  a list page has no entry of creating — was held by the admin application having nothing to create;
  there is something to create at this one section, and the entry is given to it, and to the rest
  still not.
- **The panel of creating is a neighbour of the list in the outlet `ro`, like the panels of details.**
  An address of its own, it outlives a reload, it is closed by a return to the list with the same
  selection.
- **The panel asks nothing except the name of the future tree.** The term of validity is taken by the
  default of the domain, and the sign of the tree the invitation does not know at all: it is counted
  by the tree itself at its own place.
- **The panel does not close by itself after the issuing.** Closed by the answer, it would carry the
  only showing of the code away with it; it is closed by the person, having copied the code.
- **After the issuing the name is locked, and the issuing itself is switched off.** An invitation on
  this name already exists, and a second one the intake will refuse; another name is needed — the
  panel is closed and opened anew.
- **The list is refreshed by the same movement as the issuing.** The new row stands in it as a waiting
  one, with the same name and term: over the time the panel was open, the neighbouring invitations
  could both be used up and expire.
- **A refusal of the issuing speaks by the word of the intake and leaves the entered name in the
  field.** A taken name is the only thing a person can fix themselves, and an erased field makes them
  type it anew; a word about a breakage of the service is not shown to them at that — there is nothing
  to fix there.

## What is out of scope

- **An entry of creating a record at the sections of the cargo.** The admin application reads the
  cargo, it does not create it: a section that creates nothing needs no button of creating. This
  section is the only exception.
- **A term of validity of its own at an invitation.** The panel does not ask for it: two days is the
  default of the domain, and an owner who needs another term calls the command of the node.
- **The edit of an issued invitation.** An issued one either goes out by itself or is revoked — it has
  no edit.
- **A section of the trees.** The trees still live as a dropdown of the filter above the lists of the
  cargo.
- **The issuing and the revocation of the token of a tree from the interface.** The rule of the
  subdomain of the intake stays in force: a tree gets a token by one request for an invitation.

## Contract

The operations of the section are closed by the entry of a person; the token of a tree does not open
them.

| Operation                 | What it does                                               |
| ------------------------- | ---------------------------------------------------------- |
| GET /api/invites          | a page of the invitations with the state of each           |
| POST /api/invites         | issues an invitation by the name and answers with the code |
| DELETE /api/invites/:name | revokes a valid invitation by the name                     |

The issuing carries one field — the name of the future tree — and answers with the name, the code,
the time of the issuing and the time until which the invitation is valid. The code goes away by that
single answer: there is no second place to take it from, neither at the admin application nor at the
intake.

A page of the list is requested by the number, the size and the order; the section has no filter. What
a page of a list asks of a section — the subdomain of the reading of what was taken in next to it.

### Refusal codes

Not applicable: the intake answers with a code of the answer of HTTP, not with named codes of the
domain. Where the section is obliged to refuse instead of staying silent:

| What happened                                      | Code  | What it says                                        |
| -------------------------------------------------- | ----- | --------------------------------------------------- |
| there is no name of the future tree in the issuing | `400` | that the issuing waits for a name                   |
| the name is taken by a valid invitation            | `409` | that a valid invitation on this name already exists |
| the name is taken by a created tree                | `409` | that a tree with such a name is already created     |
| there is no valid invitation on the name           | `404` | that there is nothing to revoke                     |
| there is no entry or it has expired                | `401` | that the operation demands an entry                 |
| a token of a tree was presented to the operation   | `401` | the same as without an entry                        |

## Data

The section creates no records of its own: the invitation lies in the same table the command of the
node puts it into, by the same fields — the name, the hash of the code, the terms, the marks of the
using up and of the revocation, the reference to the created tree. The table is described by the
subdomain of the intake.

## Screens and states

| Screen                          | States                                                                                                                                  |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| The section of the invitations  | reading · a page with rows · empty · a refusal of the reading with a repeat                                                             |
| A row of an invitation          | waiting with an available revocation · used up with the sign of the tree · expired · revoked                                            |
| The revocation of an invitation | a question with the consequence · cancelled · revoked, the list reread · a refusal by a toast                                           |
| The panel of creating           | the name is not entered · the issuing goes · issued: the code, the copying and the term · the name is taken · the intake did not answer |

The table of the states is checked by nothing: a state the code does not know how to come into reads
here as a description of something working. The states are confirmed by scenarios and by a
measurement in the browser.

## Cross-cutting requirements

### Locales

The language is one — Russian. The labels of the section lie in the dictionary of the application, not
in the markup, and the words of the vocabulary of the project are not carried out into them.

### SEO

Not applicable: the section stands behind the entry and is not shown to the search engines.

### Mobile layout

A row of the list on a narrow screen is shown as a card of the table of the kit, and the panel of
creating takes the width of the screen whole — like the neighbouring panels of details.

### Several objects

Whoever entered gets all the invitations: an account belongs to the service, not to a tree. An
invitation is issued one at a time.

## Decisions

- **An invitation is issued by a panel, not by a row in the list and not by a modal window.** The
  panels of details at the neighbouring sections are already put together as a curtain in the outlet
  `ro`; a form of creating of its own would cost a second language at one screen.
- **The panel stays open after the issuing.** The only showing of the code goes away together with a
  closed panel, and a person who missed the button of the copying is left without the code. The price:
  the name in the field is locked after the issuing, and the issuing is switched off — the panel
  issues no second invitation.
- **A refusal of the issuing names the reason, unlike a refusal to a request for a token.** A request
  comes from outside, and a difference of the answers would tell it which codes are created; here the
  asking is done by the owner who entered, to whom the list of the invitations and of the trees is
  visible whole.
- **The panel does not ask for the term of validity.** The default of the domain — two days — covers
  the passing of the code by correspondence; a field of the choice of the term adds a decision at
  every issuing and was not needed once over the life of the intake. Rejected: asking for the term
  every time.
- **There is no revocation at a press on a row: a row opens the details at the neighbours, and here
  there are none.** Everything known about an invitation stands in the row itself, and the revocation
  lives as an item of the menu of the row.

## Open questions

The open questions of the domain are shared, and they live in the spec of the domain next to it.

## History of changes

- 2026-08-19 — the subdomain was split out of the spec of the reading of what was taken in, which had
  outgrown the length limit together with the merged agreement of the task RT-878. The rules of the
  section, its scenarios and the bindings moved here as they were: the scenario numbers were not
  recounted.
