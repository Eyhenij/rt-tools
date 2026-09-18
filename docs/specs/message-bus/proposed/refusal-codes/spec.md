# The intake refuses by a code, and the word for it is drawn by the admin application

**Status:** proposed · **Revision:** 2026-09-18 · **Scenario prefix:** `SC-MB`
**Depends on:** the subdomain of the shell — `docs/specs/message-bus/admin-shell/spec.md`
**Laws:** `frontend-application`, `observability`
**Procedures:** none — the operations are declared by the specs of the sections

## Why

The intake refuses a rejected request by a ready Russian sentence: forty such throws, and every one
of them goes to the person as it is. The admin application shows what came. A person who chose
English gets the screen in English and the refusal on it in Russian.

The dictionary of the labels already exists, and the screens of the sections draw their words from
it. The refusal is the last place where the word comes off the wire instead of the dictionary, and
no choice of a language reaches it.

## Terminology

- **A code of a refusal** — the name of the reason a request was rejected for. One for both sides.
- **The set of the codes** — every code the intake names. It lies in the shared lib, in one place.
- **The substitutions of a refusal** — the named values of the reason: the name of a role, the name
  of an account, the right.
- **An unknown code** — a code the admin application has no text for.
- **The word of the intake** — the sentence the intake puts into the body of the answer today.

### What it is called in the interface

There is no name for it on the screen. A person sees a refusal in the same panel and the same toast
as now; only its text starts to follow the chosen language.

## Rules

- **The intake refuses a request of a person by a code, not by a sentence.** A sentence lives in one
  language and cannot be translated by whoever shows it: it is not found by a key and not handed to a
  translator.
- **The code is named by the side that refuses.** The admin application invents no codes; it holds a
  text for every one of them. A new refusal of the intake brings a new code, and the texts for it
  in both sets by the same change.
- **The set of the codes lies in the shared lib, one for both sides.** A copy of the set at one side
  diverges from the other silently: the intake names a code nobody has a text for.
- **The code is the key of the dictionary.** One name instead of two and a table between them: a key
  built out of a code by string arithmetic is not found by a search for the key, and a table between
  them goes stale with nothing next to it changed.
- **The reason is named by the code, the values go beside it by name.** The name of a role, the name
  of an account, the right — and the text of the dictionary holds the places for them. A code
  assembled out of a value is a sentence again, only written differently.
- **Every code has a text in both sets, and that is proved by a call.** A set walked by eye diverges
  at the first code added, and the divergence shows at the person, not at the check.
- **An unknown code is visible by a sign, not by emptiness.** The dictionary already answers an
  unfound key by its name in quotes, and a code arrives as a key. An empty string on the screen
  reads as "there is no refusal here" and lives until a person complains.
- **The admin application never shows the word of the intake.** While the body carries both the code
  and the sentence, a fallback to the sentence brings the Russian word back on every code the set
  does not hold, and it does so silently.
- **The answer keeps the code of HTTP it carries today.** The code of the refusal names the reason,
  not the kind of the answer: the entry, the rights and the absence of a record are already told
  apart by the number of the answer, and the panels read it.
- **An internal error of the intake is not a refusal and gets no code.** A request the intake did
  not carry out because of its own mistake is read by whoever holds the intake, not by a person: its
  text is written in English on a par with the rest of what a session reads, and it names no reason
  for the person to fix.
- **The sentence stays in the body while the trees do not know the codes.** A tree in the field
  prints the word of the intake to its owner, and this work does not roll the trees out. The
  sentence is assembled out of the same code by one table of the shared lib.

## What is out of scope

- The refusals of the intake of the cargo and of the edit of a state are not touched: they are read
  by a tool of a tree, and it prints them to its owner itself.
- The English set is not filled whole: that is RT-2213. Until then a code without an English text is
  visible by the sign of an unfound key.
- A check forbidding a line past the dictionary is not put up: that is RT-2214.
- The refusals of a selection of a list are not named by a code: they say which parameter of the
  request is written wrongly, and they reach no person — a screen answers a refusal of a reading by
  a word of its own, and the admin application builds the selection itself. Whoever writes a client
  of the reading reads them, and for them the name of the parameter is the whole answer.
- The word of the intake does not leave the body of the answer: it leaves with the work that teaches
  the trees the codes.

## Contract

The surface is the body of an answer with a refusal. The set of the operations, their addresses and
their rights stay as they are. The body of a refusal carries three fields:

- `code` — the code of the refusal out of the set of the shared lib.
- `params` — the named substitutions of the reason; there is none where the reason has no values.
- `message` — the sentence for a tree, assembled out of the same code by the shared lib.

### Refusal codes

Not applicable in the form this section is read by: the codes of this work are not named `Code.X`
and belong to no procedure of a domain of its own. The set itself:

| The code                                                                                              | When it is answered                                                 | Substitutions    |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------- |
| `accountNameTaken`                                                                                    | an account of that name is already created                          | `name`           |
| `accountNotFound`                                                                                     | there is no account of that name                                    | `name`           |
| `accountSelfDisable`                                                                                  | a person disables their own account                                 | —                |
| `accountAlreadyOff`                                                                                   | the account is already disabled                                     | `name`           |
| `accountGone`                                                                                         | the record disappeared between the edit and the answer              | —                |
| `roleNameTaken`                                                                                       | a role of that name is already created                              | `name`           |
| `roleNotFound`                                                                                        | there is no role with that key                                      | `key`            |
| `roleHeld`                                                                                            | the role is held by accounts                                        | `name`, `people` |
| `roleRightsLost`                                                                                      | the edit would leave the person without the right to the roles      | —                |
| `roleNameEmpty`                                                                                       | the role arrived without a name                                     | —                |
| `rightUnknown`                                                                                        | the right is not in the set                                         | `right`          |
| `rightRepeated`                                                                                       | the right is named twice                                            | `right`          |
| `editMalformed`                                                                                       | the edit does not name the right and whether it is given            | —                |
| `inviteNameEmpty`                                                                                     | the issue is asked without the name of the project                  | —                |
| `inviteProjectExists`                                                                                 | the project is already created                                      | `name`           |
| `inviteAlreadyIssued`                                                                                 | a valid invitation for the project is already issued                | `name`           |
| `inviteNotFound`                                                                                      | there is no valid invitation for the project                        | `name`           |
| `inviteRejected`                                                                                      | the code of the invitation is not accepted                          | —                |
| `postmortemNotFound`                                                                                  | there is no incident analysis with that sign                        | —                |
| `proposalNotFound`                                                                                    | there is no proposal with that sign                                 | —                |
| `summaryNotFound`                                                                                     | there is no record of a month with that sign                        | —                |
| `treeUnknown`                                                                                         | the tree with that sign is not known to the intake                  | `slug`           |
| `personNameEmpty`                                                                                     | the account arrived without a name                                  | —                |
| `personPasswordEmpty`                                                                                 | the account arrived without a password                              | —                |
| `setupClosed`                                                                                         | the first account is already created                                | —                |
| `ownerRoleMissing`                                                                                    | the role of the owner is not in the storage                         | `key`            |
| `signInEmpty`                                                                                         | the request carries no name or no password                          | —                |
| `enrollThrottled`                                                                                     | there are more requests from one client than the limit              | —                |
| `enrollMalformed`                                                                                     | the request awaits the code of an invitation and the sign of a tree | —                |
| `treeTaken`                                                                                           | a tree with that sign or that name is already created               | —                |
| `signInRequired`                                                                                      | the operation demands an entry                                      | —                |
| `rightRequired`                                                                                       | the entry has no right to the operation                             | —                |
| `treeTokenRequired`                                                                                   | the operation demands a token of a tree                             | —                |
| `treeTokenRejected`                                                                                   | the token is not accepted                                           | —                |
| `accessUndeclared`                                                                                    | the operation declared no access                                    | —                |
| The last five never reach the screen: the admin application answers the number of such an answer by   |
| the entry, not by a text. They have a code all the same — a refusal of the intake is named by a code, |
| and an exception of one kind for one of them would be the place where the Russian sentence stays.     |

## Data

The work adds no storage and no field to one. The set of the codes lies in the code of the shared
lib, the texts for them in the sets of the labels of the admin application.

| What         | Where                       | What it holds                       |
| ------------ | --------------------------- | ----------------------------------- |
| the code     | the shared lib              | the name of the reason of a refusal |
| the text     | the sets of the labels      | the sentence of its own language    |
| the sentence | the table of the shared lib | the word for a tree, in Russian     |

## Screens and states

| The state                       | What is on the screen                                                     |
| ------------------------------- | ------------------------------------------------------------------------- |
| the request is rejected         | the text of the dictionary for the code, in the chosen language           |
| the language is switched        | the text of the refusal changes in place, without a reload                |
| the set has no text of the code | the sign of an unfound key instead of the text                            |
| the service is broken           | the word of the screen, as now: the breakage is not explained to a person |

## Cross-cutting requirements

### Locales

This is the subject of the work: the text of a refusal starts to follow the choice of the language
on a par with the labels of the screens. The choice lives on the device, and the intake is not told
about it: the code is one for both languages.

### SEO

Not applicable: the admin application is closed by the entry and is not indexed.

### Mobile layout

The work does not change the markup. The length of a refusal changes with the translation, and it
is looked at where refusals are shown — in the panels of the edits and in the toasts.

### Several objects

Not applicable: the set of the codes is one for the intake.

## Decisions

- **The code is the key of the dictionary, and there is no table between them.** A second name for
  one reason diverges from the first silently, and an unknown code gets the ready sign of an unfound
  key for nothing.
- **The sentence stays in the body of the answer until the trees learn the codes.** This work does
  not roll a tree in the field out, and an answer without a word would leave its owner with the
  number of the answer alone.
- **The Russian text of a refusal is written in one place — the table of the shared lib.** Left at
  the throw, it stays where the check of the texts does not reach it.

## Open questions

- What a tree does with a code once it learns to read one: a set of texts of its own, or the
  sentence of the intake to the end. It is decided by the work that rolls the trees out, and no
  number is given to the question in the law: the law of the frontend application has no section for
  them, and the answer belongs to the side of the intake.

## History of changes

- 2026-09-18 — the agreement is written: the intake refuses by a code, the admin application draws
  the text for it out of the dictionary, an unknown code is visible by a sign.
