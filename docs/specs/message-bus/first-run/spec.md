# The first record and the end of the account commands

**Status:** in force · **Revision:** 15 September 2026 · **Scenario prefix:** `SC-MB`
**Depends on:** `admin-auth`, `people-editing`, `roles-page`
**Laws:** `access`, `navigation`
**Procedures:** none

## Why

Creating, a new password and disabling came to the screen of the people section, and the same
three actions stayed as commands of the launch line. Two ways to one action diverge in silence: a
condition edited in one does not reach the other, and the test of one says nothing about the
other.

The commands also held the only way to the first record: a fresh node has no account, no account
means nobody can sign in, and nobody signed in means nobody can create a record from the screen.
The agreement removes the four commands and closes that hole with a first-run screen, open
exactly while the storage holds not one account and closed forever after the first one.

## Terminology

- **The first record** — the account created on a node whose storage held none.
- **The first-run screen** — the screen that creates the first record; it stands behind the same
  address as the sign-in.
- **The owner role** — the role with every right of the closed set; it comes with the receiver.

### What it is called in the interface

| In the agreement     | On the screen                                                       |
| -------------------- | ------------------------------------------------------------------- |
| the first-run screen | the screen "Первая запись": the name, the password, "Завести"       |
| the sign-in screen   | the screen "Вход", as before                                        |
| the outcome          | the admin panel opens on the first section, the person is signed in |
| the closed first run | the address of the first-run screen shows the screen "Вход"         |

## Rules

**The receiver.**

- **The four commands of accounts are not in the tree.** `account:add`, `account:passwd`,
  `account:disable` and `account:list` leave together with their parse and their report; the tree
  commands stay. A command kept "just in case" is the second way the agreement removes.
- **The intake serves no operation of the first run.** The accounts live in Keycloak, and the
  first person is created there by whoever holds the node. An empty storage of the intake says
  nothing about who can sign in, so the intake neither asks it nor warns about it at the start.

**The admin panel.**

- **The sign-in screen asks whether the first record is still to be created, and sends to the
  first-run screen while it is.** The person opens the address of the admin panel and lands on
  the screen the node needs. The sign-in form is drawn at once, and the person is sent as soon as
  the answer arrives. A node with records is the usual case, and an empty card on every sign-in
  would cost every person every time.
- **The first-run screen sends to the sign-in when the first record is already created.** A
  bookmark of the first-run address stays harmless.
- **The first-run screen asks the name and the password once and says the person will sign in
  with them.** The text of the refusal on a refusal stands above the fields, and the input stays.
- **After the creation the person lands in the admin panel signed in.** The same road as after the
  sign-in: the first open section.
- **The first-run screen is not a section: no item in the top row, no right over it.** It stands
  next to the sign-in, outside the shell.

**The stand and the texts.**

- **The end-to-end stand seeds the account by the first-run operation and the people by the
  operations of the people section.** The seed goes the way a person goes; a hash computed by the
  seed itself would be a second copy of the receiver's way.
- **The texts naming the commands name the screen instead.** The surface table of the domain, the
  rules and the decisions of the sign-in, the refusal of the intake about the service account.

## What is out of scope

- A "no sections" screen for a person without a single right — a question of the epic.
- A password typed twice on the first-run screen.
- Recovery of a forgotten password of the only owner: a node whose only owner lost the password is
  restored from the storage, as before.
- The tree commands of the launch line.

## Contract

Not applicable: the intake serves no operation of the first run. `GET /api/setup` and
`POST /api/setup` left together with the entry by a password.

### Refusal codes

Not applicable: there is no operation to refuse.

## Data

Nothing new is stored: the first record is an account with the owner role and a hash, as any
record created from the people section; the sign-in is a session, as any sign-in.

## Screens and states

| State                                 | What is on the screen                                                  |
| ------------------------------------- | ---------------------------------------------------------------------- |
| the storage is empty, any address     | the first-run screen: the name, the password, "Завести"                |
| the storage holds a record, first-run | the sign-in screen                                                     |
| the request refused                   | the text of the refusal above the fields; the input stays              |
| the request succeeded                 | the admin panel on the first open section, the person signed in        |
| the receiver did not answer           | the word about the receiver above the fields, as on the sign-in screen |

## Cross-cutting requirements

The first-run operations are public by declaration, with the reason in the operation itself.

### Locales

The words of the screen live in the admin dictionary next to the words of the sign-in.

### SEO

Not applicable: the admin panel is closed.

### Mobile layout

The screen takes the layout of the sign-in: one card in the middle of the viewport.

### Several objects

One receiver, one first record.

## Decisions

- **A first-run screen, not a pair from the environment.** A password in the environment lives in
  the deploy files and in the process list of the node. Rejected also: a command kept for the
  first record only — the very duplication the agreement removes.
- **The first record is the owner.** Rejected: a first record without a role — it would sign in
  and see nothing, and nobody could give it a role.
- **Created and signed in by one operation.** Rejected: creation followed by the sign-in screen —
  a second screen for the pair typed a moment ago.
- **The scenarios about the commands are reworded, not renumbered.** SC-MB-42, 43, 58 and 59
  speak of the people section now and are carried by the tests that stay; the command tests
  leave with the commands.
- **The sign-in screen draws its form before the answer about the first run.** Rejected: an empty
  card until the answer — paid by everyone on every sign-in for the one first run of the node.

## Open questions

- Whether the first-run screen should ask the password twice. Until decided, once.

## History of changes

- 2026-09-15 — the agreement was written before the code.
- 2026-09-15 — merged into the domain by the task RT-1902. The receiver, the screen, the stand and
  the texts are done; the rule about the sign-in form names the form drawn at once.
- 2026-10-06 — the operations of the first run left the intake by the task RT-2576: the accounts
  live in Keycloak. The screens leave by the same task.
