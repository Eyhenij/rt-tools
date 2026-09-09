# The reading of its own records by a tree

**Status:** in force · **Revision:** 2026-09-09 · **Scenario prefix:** `SC-MB`
**Depends on:** `agent-kit` (the command of the launch line the tree reads by)
**Laws:** `access`, `observability`, `verifiability`
**Procedures:** none — the operation is declared by a controller of the intake

An agreement of the subdomain "the cargo of a tree": what a tree reads its own records by and why
the intake, not the request, decides whose records leave.

## Why

A tree sends a proposal and hears nothing back. Everything the intake gives out is closed by the
sign-in of a person: the read controllers ask for a right, and a right belongs to an account. The
consumer has no account — accounts are created by the owner of the intake, and there are as many
consumers as there are trees.

Because of that the state of a record is known to the intake alone. The tree puts a local edit of
the harness next to the laid-out resource and keeps it for ever: the fix came out in a new edition,
and nobody told the tree.

The tree already has a way of introducing itself — the token it sends the cargo by. The subdomain
adds the reading closed by that same token.

## Terminology

| Term                  | What it is                                                       |
| --------------------- | ---------------------------------------------------------------- |
| The token of a tree   | the secret the tree sends the cargo by; it lies outside the tree |
| Its own record        | a record the intake created under the sign of this very tree     |
| The state of a record | new, in work, fixed, released, quarantined                       |

### What it is called in the interface

Not applicable: the operation has no screen. The same records are shown to a person by the admin
panel, and that is a neighbouring subdomain.

## Rules

- **A tree reads its own records by its token, and no account is asked of it.** The account is the
  way of the owner of the intake; the consumer has none and will have none.
- **Whose records leave is decided by the operation, not by the request.** A tree named in the
  request would mean somebody else's records leave for whoever asks; the tree is taken from the
  token, the way the accepting of the cargo takes it.
- **The answer carries the state of a record, its fix and the version of the release.** Without the
  three the reading answers nothing the tree asks.
- **The answer carries no records of other trees, and it says nothing about their number.** A count
  over the whole intake would tell a consumer how many trees send cargo and how much of it.
- **A refused token answers the way an unknown one does.** By a difference of answers it would
  otherwise be checked what is enrolled.
- **A tree without records answers with an empty list and a successful code.** An empty answer is
  not a refusal: the tree sent nothing, or the intake gave nothing back yet.

## What is out of scope

- The move of the state of a record: a neighbouring subdomain of the intake.
- The closing of a record of a foreign tree by the publisher: it goes by an account, not a token.
- Everything the admin panel shows: it reads by the sign-in of a person.

## Contract

| Operation                          | What it takes                                            | What it gives back                         |
| ---------------------------------- | -------------------------------------------------------- | ------------------------------------------ |
| the reading of the cargo of a tree | the token in the header, the kind of the cargo, the page | the records of this tree with their states |

A record of the answer carries its sign, its kind, the resource it is about, the state, the fix and
the version of the release.

### Refusal codes

Not applicable: the intake answers with a code of the answer of HTTP, not with named codes of the
domain. Where the reading is obliged to refuse instead of staying silent:

| What happened                                     | Code  | What it says                                                  |
| ------------------------------------------------- | ----- | ------------------------------------------------------------- |
| there is no token of a tree in the request        | `401` | that the operation demands a token of a tree                  |
| the token is not found or is revoked              | `401` | that the token is not accepted; which of the two is not named |
| the kind of the cargo is not one the intake knows | `400` | that the value is not from the set, and which values are      |

## Data

Not applicable: the subdomain owns no records of its own. It reads what the accepting of the cargo
created.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the answer carries the values of the records, and they are translated by whoever
shows them.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The tree is the object, and it is taken from the token: a second one does not arrive in a request.

## Decisions

- **The reading is closed by the token, not by an account** — the consumer has no account, and the
  token is already in its hands. Rejected: an account for every tree — created by hand, and there
  are as many of them as there are trees.
- **The tree is taken from the token, and the request names no tree** — otherwise the records of a
  neighbour leave for whoever asks for them by name.

## Open questions

- `Q-OR-1` — the reading gives out the records of a tree without a limit of age. A tree that has
  sent cargo for a year reads its whole history by pages. Whether the reading needs a boundary by
  day is decided when such a tree appears; today the oldest of them is two months old.

## History of changes

- 2026-09-09 — the subdomain is created: a tree reads its own records by its token.
