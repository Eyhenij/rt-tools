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
- **Whether the first record is still to be created is answered by a public operation.** The
  answer is one word: yes while the storage holds not one account, no otherwise. It carries
  nothing else: an empty storage is not a secret, and a full one says nothing about who is in it.
- **The first record is created by a public operation, and only while the storage holds not one
  account.** With a record in the storage the operation refuses with a conflict, whatever the
  input: the screen is closed forever, and a request past the screen is refused the same way.
- **The first record takes the owner role that comes with the receiver.** A first person without
  a right would sign in and see nothing, and there would be nobody to give them a role. A node
  without the owner role refuses the creation naming the role: the migration did not run.
- **The first record is created and signed in by one operation.** The answer is the same as the
  answer of the sign-in, with the same cookie: the person who typed the pair a moment ago is the
  person who will use it, and asking them to type it again is a second screen for nothing.
- **An empty name and an empty password are refused before the write.** The same words as the
  panel of creating a person: the name waits, the password waits.
- **Two first records at once give one record.** The creation counts the records inside its
  transaction and gives up the second one: the answer of the second request is the conflict of a
  closed screen.
- **The startup line about an empty storage names the screen, not a command.** The line stays a
  warning: the node is up and nobody can read it yet.

**The admin panel.**

- **The sign-in screen asks whether the first record is still to be created, and sends to the
  first-run screen while it is.** The person opens the address of the admin panel and lands on
  the screen the node needs. The sign-in form is drawn at once, and the person is sent as soon as
  the answer arrives. A node with records is the usual case, and an empty card on every sign-in
  would cost every person every time.
- **The first-run screen sends to the sign-in when the first record is already created.** A
  bookmark of the first-run address stays harmless.
- **The first-run screen asks the name and the password once and says the person will sign in
  with them.** The word of the receiver on a refusal stands above the fields, and the input stays.
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

| Operation       | Access | What it does                                                                                                        |
| --------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| GET /api/setup  | public | `{ "open": true }` while the storage holds not one account, `{ "open": false }` else                                |
| POST /api/setup | public | creates the first record with the owner role by `name` and `password`; answers like the sign-in and sets its cookie |

### Refusal codes

Not applicable: the receiver answers with a code of the answer of HTTP, not with named codes of the
domain. Where the operations are obliged to refuse instead of staying silent:

| What happened                        | Code  | What it says                             |
| ------------------------------------ | ----- | ---------------------------------------- |
| the storage already holds a record   | `409` | that the first record is already created |
| the name or the password is empty    | `400` | which of the two waits                   |
| the owner role is not in the storage | `409` | that the role is missing: the migration  |

## Data

Nothing new is stored: the first record is an account with the owner role and a hash, as any
record created from the people section; the sign-in is a session, as any sign-in.

## Screens and states

| State                                 | What is on the screen                                                  |
| ------------------------------------- | ---------------------------------------------------------------------- |
| the storage is empty, any address     | the first-run screen: the name, the password, "Завести"                |
| the storage holds a record, first-run | the sign-in screen                                                     |
| the request refused                   | the word of the receiver above the fields; the input stays             |
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
