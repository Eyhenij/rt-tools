# Creating, disabling and a new password from a screen

**Status:** in force · **Revision:** 15 September 2026 · **Scenario prefix:** `SC-MB`
**Depends on:** `people-list`, `access-rights`
**Laws:** `entity-editing`, `access`, `navigation`
**Procedures:** none

## Why

A record of the receiver is created, disabled or given a new password only from the node, by a
command over ssh. The owner who has no access to the node at hand cannot give access to anybody, and
cannot take it away either.

The three actions move to the section of people: a panel next to the list creates a record, a
second panel gives a record a new password, an item of the row menu disables it. The launch-line
commands stay until task #1902 removes them.

## Terminology

- **Creating** — a new record by a name and a first password. The one creating names both; the
  password reaches the person past the receiver.
- **A new password** — the replacement of the password of an existing record. The live sign-ins of
  the record are not cut: the password was changed by whoever manages the records, and a person in
  the middle of their work is not thrown out by it.
- **Disabling** — the record signs in nowhere from that moment, and its live sign-ins are cut in
  the same motion. There is no switching back: a record needed again is created anew.
- **The own record** — the record the signed-in person came with.

### What it is called in the interface

| In the agreement        | On the screen                                                                     |
| ----------------------- | --------------------------------------------------------------------------------- |
| the entry of creating   | the button "Завести пользователя" in the toolbar of the section                   |
| the panel of creating   | the curtain "Новый пользователь" to the right of the list: the name, the password |
| the panel of a password | the curtain "Новый пароль" to the right of the list: the password                 |
| a new password          | the item "Сменить пароль" of the row menu                                         |
| disabling               | the item "Отключить" of the row menu and the question behind it                   |

## Rules

**The operations of the receiver.**

- **The three operations are closed by the right `accounts:manage`, and the read right does not
  open them.** Reading says who reaches the cargo; changing who does is a right of its own, and a
  person given the list is not thereby given the records.
- **Creating refuses a taken name and leaves the existing record as it was.** Otherwise a repeated
  creating would silently replace a neighbour's password. The name is compared the way the sign-in
  compares it: by the key, not by the letters.
- **Creating and a new password refuse an empty password.** An empty one would create a record
  nobody can sign in with, and it would look like a created one.
- **Disabling cuts the live sign-ins of the record in the same transaction.** Apart, there is a
  moment between the two in which the disabled record still reads the cargo.
- **The own record is not disabled.** Disabling cuts every sign-in of the record, the current one
  included; the person would disable themselves and be thrown out in the same second. The
  operation refuses it by name, and the screen does not draw the item for the own row.
- **A disabled record is not disabled twice, and a name nobody has is refused as not found.** The
  second disabling would rewrite the time of the first, and the answer to a missing name says what
  to look at.
- **Every operation answers with the row of the list after the change.** The screen shows what the
  receiver holds, not what it sent.

**The screen.**

- **The button and the row menu are drawn only with `accounts:manage`.** The admin panel decides
  what to show by the rights it received; without the right the section is the list and nothing
  else. Until the rights arrive nothing is hidden.
- **The panel of creating lives at «people/new» in the outlet `ro`; the panel of a password at
  «people/<name>/password».** A panel by an address survives a reload and is closed by the same
  motion as the details of the neighbouring sections.
- **A successful creating closes the panel and the list carries the new row at once.** The
  password is shown nowhere after the success: the receiver holds a hash and has nothing to show
  back.
- **A refused request keeps the person in the panel with their input, and the text of the refusal
  is drawn out of the dictionary by its code.** A taken name and an empty password are about what
  the person did; a breakage of the service is not, and it is answered by the shared line of the
  section.
- **Disabling asks a question that names the record and the consequence.** The answer is not
  returned by any action, and the question says so.
- **The outcome of every action is said by one notification, and the list is re-read whole.** While
  the panel was open the neighbouring rows could change too.

## What is out of scope

- Switching a disabled record back on: the launch line has no such command either.
- Assigning a role at creating and the pointed edits — the page of roles, task #1901.
- Removing the launch-line commands and the first record's path — task #1902.
- A person changing their own password from the profile — an open question of the access law.
- A length or a strength rule for the password: the launch line accepts any non-empty one, and the
  owner named no rule.

## Contract

The operations are closed by the entry of a person and the right `accounts:manage`; the token of a
tree does not open them.

| Operation                         | What it does                                                              |
| --------------------------------- | ------------------------------------------------------------------------- |
| POST /api/accounts                | creates a record by the name and the first password; answers with the row |
| POST /api/accounts/:name/password | replaces the password of the record; answers with the row                 |
| POST /api/accounts/:name/disable  | disables the record and cuts its sign-ins; answers with the row           |

Creating carries two fields — `name` and `password`; the new password carries `password`; disabling
carries nothing. The row is the same as the one the list answers with: the name, the role, the state
and the last sign-in.

### Refusal codes

Not applicable: the receiver answers with a code of the answer of HTTP, not with named codes of the
domain. Where the operations are obliged to refuse instead of staying silent:

| What happened                           | Code  | What it says                                      |
| --------------------------------------- | ----- | ------------------------------------------------- |
| the name of a new record is empty       | `400` | that creating waits for a name                    |
| the password is empty                   | `400` | that the record needs a password                  |
| the name is taken by an existing record | `409` | that the record with this name is already created |
| the record to disable is the own one    | `409` | that the own record is not disabled               |
| the record is already disabled          | `409` | that it is disabled already                       |
| there is no record with the name        | `404` | that there is nothing to change                   |
| a request without a sign-in             | `401` | that nobody introduced themself                   |
| a sign-in without the right             | `403` | that the operation needs a right                  |

## Data

Nothing new is stored. Creating writes a record with the name, its key and the hash of the password;
a new password rewrites the hash; disabling writes the time into the record and into its live
sign-ins.

## Screens and states

| State                      | What is on the screen                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------- |
| the list with the right    | the button above the list, the menu on every live row; the own row without "Отключить" |
| the list without the right | the list as it is: no button, no row menu                                              |
| the panel of creating      | the name and the password, "Завести" and "Закрыть"                                     |
| the panel of a password    | the password for the named record, "Сменить" and "Закрыть"                             |
| the request refused        | the text of the refusal above the fields; the input stays                              |
| the request succeeded      | the panel closed, one notification, the list re-read                                   |
| the question of disabling  | the name of the record and the consequence; "Отключить" and the way back               |

## Cross-cutting requirements

The right is read on every call, not taken from the issued sign-in.

### Locales

The words of the panels, the items and the notifications live in the admin dictionary next to the
other words of the section.

### SEO

Not applicable: the admin panel is closed.

### Mobile layout

The panels take the whole width, as the panels of the neighbouring sections do.

### Several objects

One receiver and one list of people in it.

## Decisions

- **Two panels and a menu item, not one panel with three modes.** Disabling has nothing to type,
  and three states of one form read worse than two small panels. Rejected: a details panel of a
  person with the actions inside — everything known about a person stands in the row.
- **The password is typed by the one creating.** The card names who assigns it, and the receiver
  has no mail of its own. Rejected: a generated password shown once — it would need a second
  showing place, and the one creating still has to pass it on.
- **The own record is refused by the receiver and hidden by the screen.** Rejected: hiding alone —
  a direct request would still throw the person out.
- **The text of the refusal is shown by the shared technique of the invites section.** Rejected: a
  copy of it next to the section — two copies of one reading diverge silently.

## Open questions

- Whether the person themselves should change their own password from the profile. The access law
  keeps it as `Q-A-2`; the panel here is for whoever manages the records.

## History of changes

- 2026-09-15 — the agreement was written before the code.
- 2026-09-15 — the agreement was merged into the domain as a subdomain of its own (RT-1900). Not
  merged into the list subdomain next to it: that one describes the reading, and together they
  outgrow the length limit.
