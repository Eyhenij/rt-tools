# The list of people

**Status:** in force · **Revision:** 10 September 2026 · **Scenario prefix:** `SC-MB`
**Depends on:** `access-rights`
**Laws:** `lists`, `navigation`, `access`
**Procedures:** none

## Why

Who is created in the receiver is not visible from the admin panel at all: the list of people exists
only as a command on the node. Whether an account is disabled or in force, whether anybody ever
signed in with it — the same way.

The section answers one question: who has access to the cargo. It is the first screen of the rights
half of the epic, and the editing screens go after it — there must be somebody to assign a role to.

## Terminology

- **A person** — an account of the receiver: a name, a role, a state and the last sign-in.
- **The state of an account** — in force or disabled. A disabled one signs in nowhere, and its
  earlier sign-ins are cut.
- **The last sign-in** — empty means the account never signed in.

### What it is called in the interface

The section is called "Пользователи". The column of the state says "Действует" or "Отключена"; an account
that never signed in shows a dash instead of a date.

## Rules

- **The section shows the name, the role, the state and the last sign-in.** These four answer who
  has access and whether that access is alive; the rest is asked of the editing screens.
- **The section is closed by the right `accounts:read`.** The list itself says who reaches the
  cargo, so a signed-in person without that right neither sees the item nor opens the address.
- **The receiver's read operation is closed by the same right.** Otherwise the section is hidden and
  its data is given away by a direct request.
- **A person without a role is shown as without a role, not as an empty cell.** An empty cell reads
  as a defect of the screen; "роли нет" is the answer.
- **The list only reads.** Creating, disabling and changing a password come with the next task: it
  must first be visible whom you are editing.

## What is out of scope

- Creating a person, disabling them and changing a password — the task after this one.
- The page of roles and rights — the task after that.
- Dividing the cargo by trees: the list says who has access, not to what.

## Contract

The surface is one read operation of the receiver: it answers with a page of people. The admin panel
asks it from the section and shows the answer.

### Refusal codes

Not applicable: the receiver answers with a code of the answer of HTTP, not with named codes of the
domain. Where the reading is obliged to refuse instead of staying silent:

| What happened                    | Code  | What it says                     |
| -------------------------------- | ----- | -------------------------------- |
| a request without a sign-in      | `401` | that nobody introduced themself  |
| a sign-in without the read right | `403` | that the operation needs a right |

## Data

Nothing new is stored. The four fields are read from the account and from its role.

## Screens and states

| State               | What is on the screen                                  |
| ------------------- | ------------------------------------------------------ |
| the list is loading | the table skeleton                                     |
| there are people    | the rows: name, role, state, last sign-in              |
| the request refused | a message and a repeat, the rows are not shown         |
| no right            | the item is not in the menu, the address does not open |

## Cross-cutting requirements

The right is read on every call, not taken from the issued sign-in.

### Locales

The section labels live in the admin dictionary alongside the other four sections.

### SEO

Not applicable: the admin panel is closed.

### Mobile layout

The table scrolls sideways, as in the other sections.

### Several objects

One receiver and one list of people in it.

## Decisions

- **The section is closed by a right, not by a sign-in.** Rejected: showing it to everyone signed in
  — the list itself is the answer to who reaches the cargo.
- **The list only reads.** Rejected: making it at once with the editing panel — then nothing would
  be checkable separately, and the screen is needed before the editing.

## Open questions

- Whether to show the pointed edits of rights over a role. It does not hold the work: the edits are
  made by the task of the roles page, and until it there is nowhere to create them.

## History of changes

- 2026-09-10 — the agreement was written before the code.
- 2026-09-10 — the agreement was merged into the domain as a subdomain of its own: the receiver
  answers with a page of people, the admin panel shows the section, and both are closed by the right
  `accounts:read` (RT-1899). It was not merged into the spec of the rights next to it: that one
  describes what a person may do after the entry, and together they outgrow the length limit.
