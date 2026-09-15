# The entry into the admin application

**Status:** in force · **Revision:** 2026-08-21 · **Scenario prefix:** `SC-MB`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`
**Procedures:** none — the operations are declared by the controllers of the intake

A subdomain of the domain "the intake of the cargo": what a person introduces themselves to the
intake by and how their account is created. What they read after the entry — the subdomain next to
it: `docs/specs/message-bus/admin/`.

## Why

The service goes out into the internet. Knowing the tokens of the trees alone, it would give what
was taken in to anyone who reached its address and would not answer the question of who read it.
Hence the entry of a person: a name, a password and the cookie the browser introduces itself by
further on.

The accounts at that are created by whoever has access to the node — the service has no admin
application of the accounts at all, and that is a decision, not an unfinished piece of work.

## Terminology

The vocabulary of the domain whole is in the spec of the domain. Here only what lives in the entry:

| Term                  | What it is                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| An account            | The name and the password of one person. The first is created by the first-run screen, the rest by the people section |
| The entry             | The state in which the intake knows who is asking. It lives by a term and is broken off by the exit                   |
| The term of the entry | The time after which the entry stops being accepted and a person introduces themselves anew                           |

### What it is called in the interface

| In the agreement      | On the screen                                                                   |
| --------------------- | ------------------------------------------------------------------------------- |
| the entry             | a screen with two fields and a button; a person sees no other screens before it |
| a refusal of the pair | one line under the form: the pair is not accepted, and what exactly is not said |

## Rules

**The entry and the account.**

- **Not a single operation gives the cargo without an entry.** The giving out of the application
  itself the entry does not guard: without the cargo it is empty, and closed statics demand a proxy
  the work has none of.
- **A person introduces themselves by the name of an account and a password.** There is no second way
  of the entry: the service has no mail at all, and a token common to all does not answer the
  question of who read, while its change knocks everybody out at once.
- **The browser carries the entry by a cookie unavailable to scripts and sends it only to its own
  address.** The value of the entry lying where a script of the page reaches leaks away together with
  any foreign line on it; a cookie with the reading by a script forbidden and the sending by a
  foreign transition forbidden neither leaks nor is forged by a foreign page.
- **The intake holds only the hash of the password.** A dump of the base that was taken gives no
  access: the password is not restored from the hash.
- **A refusal of the entry does not name what exactly did not match, and answers in the same time.**
  Different answers to an unknown name and to a wrong password go through the names of the accounts
  for whoever is guessing them; a different time of the answer answers the same question silently, so
  an unknown name is checked against a stub of a hash, it is not rejected at once.
- **The password gets neither into the journal, nor into the answer, nor into the address.** The
  journal is read to understand what broke; a password that got into a row of the journal lives there
  as long as the journal itself.
- **An unsuccessful attempt of the entry is written into the journal with the name of the account.**
  Otherwise the guessing of a password cannot be told from silence, and the first sign of it becomes a
  foreign reading of the cargo.
- **Unsuccessful attempts in a row lengthen the answer.** The service stands in the internet, and a
  run-through answering at the same speed is limited only by the network. The account at that is not
  locked: there is nobody to unlock a locked record — there is no admin application of the accounts.
- **The entry lives by a term and stops being accepted at its expiry.** A person introduces themselves
  anew; an everlasting entry outlives both a lost machine and a person who left.
- **One record has several entries, and the exit breaks off the one that was come by.** Two browsers
  mean two entries; an exit breaking off all of them knocks a person out where they did nothing.
- **A token of a tree does not open the admin application, and the entry of a person does not open the
  intake of the cargo.** The two ways of introducing oneself live apart: otherwise a token that leaked
  from a tree reads the whole cargo of all the trees.
- **Every operation declares its way of access openly.** The default "open until it is closed" opens
  outward every new operation the author did not think about; the default here is the reverse, and
  openness is named in the operation itself.
- **An account is created, changes its password and is switched off from the screens.** The first
  record is created by the first-run screen, the rest by the people section under the right to edit
  people; the launch line knows no account commands — with the screens they were a second way in
  that nobody checked.
- **The name of an account is taken by one person, and the case is not told apart in it.** The
  creating refuses at a taken name instead of creating a second record: `Иван` next to `иван` means
  the entry stopped answering who exactly entered.
- **A record that is switched off creates no entry, and its former entries stop being accepted.** A
  switching off that leaves a live entry means "one cannot enter again", not "the access is closed".
- **The name of an account is unique by the brought-to form.** A constraint of the storage, not a
  check by reading: two creations started in a row are not told apart by a check by reading.
- **The password lies only as a hash.** There is neither a column under the password itself nor a copy
  of it in the journal on any path.
- **The service says at the start that there is not a single account.** A fresh node otherwise looks
  like a breakage of the entry: any pair is refused by the same refusal, and there is nothing to tell
  "you were wrong" from "there is nobody to create" by. The line names the first-run screen.
- **A person sent to the entry from the address of a section lands after the entry where they were
  going.** Otherwise a link to a section works only for whoever has already entered.

## What is out of scope

- **The creating of accounts and the first record.** The people section creates, switches off and
  changes the password — subdomain `people-editing`; the first record of an empty node is the
  subdomain `first-run`.
- **The restoring of a password by mail.** The service has no mail at all.
- **Roles and rights inside the admin application.** The word of the owner: whoever entered sees
  everything.
- **The requirements of the password itself.** The records are created by whoever has access to the node.
- **A second way of the entry.** The service has neither mail nor an external recognition.

## Contract

| Operation             | What it does                                    |
| --------------------- | ----------------------------------------------- |
| POST /api/auth/login  | accepts a name and a password, creates an entry |
| POST /api/auth/logout | breaks off the entry that was come by           |
| GET /api/auth/session | says who entered and whether the entry is alive |

The browser carries the entry by a cookie unavailable to scripts; not a single operation passes it by
a header.

### Refusal codes

Not applicable: the intake answers with a code of the answer of HTTP, not with named codes of the
domain. Where the entry is obliged to refuse instead of staying silent:

| What happened                                                | Code  | What it says                                                |
| ------------------------------------------------------------ | ----- | ----------------------------------------------------------- |
| there is no name or password in the request                  | `400` | which field is missing                                      |
| the name or the password did not match                       | `401` | that the pair is not accepted; what exactly it does not say |
| there is no entry, it has expired or the record is taken off | `401` | that the operation demands an entry                         |

## Data

| Entity     | What is in it                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| An account | the name, the hash of the password, the sign of being switched off, the date of the creating, the time of the last entry |
| An entry   | the account, the time of the creating, the time of the expiry, the mark about the exit                                   |

## Screens and states

| Screen    | States                                                                         |
| --------- | ------------------------------------------------------------------------------ |
| The entry | an empty form · the sending · a refusal of the pair · a refusal of the service |

The table of the states is checked by nothing: a state the code does not know how to come into reads
here as a description of something working. The states are confirmed by scenarios.

## Cross-cutting requirements

### Locales

The language is one — Russian. The labels of the screen of the entry lie in the dictionary of the
application, not in the markup.

### SEO

Not applicable: the screen of the entry promises nothing to the search engines, and everything else
stands behind it.

### Mobile layout

The form of the entry on a narrow screen is not cut: the two fields and the button stand as a column.

### Several objects

An account belongs to the service, not to a tree: whoever entered gets the cargo of all the trees, and
there are no rights inside the admin application.

## Decisions

- **The entry is by a password, and the accounts are created from the screens.** The service goes
  out into the internet — an entry is needed. The commands of the launch line held the creating
  until the screens came; with the screens in place they were removed as a second way in nobody
  checked. The first record of an empty node is created by the first-run screen.
- **The entry is carried by a cookie unavailable to scripts.** The admin application and the intake are
  given out from one name, so the cookie has no second source. Rejected: a header with a token — it
  demands keeping the value where a script of the page reaches.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-09-15 — the commands of the launch line for the accounts were removed: the first record is
  created by the first-run screen, the rest by the people section. The scenarios of the commands
  were reworded to the operations under the same numbers: `SC-MB-42`, `SC-MB-43`, `SC-MB-58`,
  `SC-MB-59`.

- 2026-08-21 — the subdomain was split out of the spec of the reading of what was taken in, which had
  outgrown the length limit. The rules of the entry, the scenarios `SC-MB-33`…`SC-MB-45`,
  `SC-MB-56`…`SC-MB-61`, `SC-MB-79` and `SC-MB-80`, their bindings, the operations of the entry, the
  codes of its refusals and both entities of its own moved here as they were: the scenario numbers
  were not recounted.
