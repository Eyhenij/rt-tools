# Roles and rights on a screen

**Status:** in force · **Revision:** 15 September 2026 · **Scenario prefix:** `SC-MB`
**Depends on:** `access-rights`, `people-list`
**Laws:** `access`, `entity-editing`, `lists`, `navigation`
**Procedures:** none

## Why

The rights model stands: a role is a named set of rights, and a person carries pointed edits over
their role. What is missing is a place to set any of it: a role is composed and a person is given
one only by a query to the storage on the node. The owner who has nobody at the node cannot give
a second person a look at the analyses without giving them the closing of those analyses.

The agreement adds the section of roles and the panel of a person's access: the roles are listed
with their rights, a role is created, recomposed, renamed and deleted from a panel; a person is
given a role and pointed edits from the people list, and next to every right the panel says what
comes out of the role and the edits together.

## Terminology

- **A role** — a named set of rights, given to a person whole. Its key is what the storage and the
  seed refer to; the name is what a person reads.
- **A pointed edit** — one right given or taken away from one person over their role. Per right
  it is one of three: the role decides, given, taken away.
- **The access of a person** — their role together with their pointed edits; what comes out of
  the two is the set of their rights.
- **The own record** — the record the signed-in person came with.

### What it is called in the interface

| In the agreement          | On the screen                                                                     |
| ------------------------- | --------------------------------------------------------------------------------- |
| the section of roles      | the item "Роли" in the top row and the page "Роли"                                |
| a role                    | a row: the name, the rights in words, how many people hold it                     |
| the entry of creating     | the button "Завести роль" in the toolbar of the section                           |
| the panel of a role       | the curtain "Новая роль" or "Роль": the name and a checkbox per right by section  |
| deleting                  | the item "Удалить" of the row menu and the question behind it                     |
| the access of a person    | the item "Права" of the row menu of the people list                               |
| the panel of access       | the curtain "Права: <name>": the role and three words per right, with the outcome |
| the three words per right | "По роли", "Дано", "Отнято"                                                       |
| the outcome per right     | "есть" or "нет" next to the right                                                 |

## Rules

**The operations of the receiver.**

- **Everything about roles and about the access of a person is closed by the right
  `roles:manage`.** The reading of roles, their edits, and the role and the pointed edits of a
  person. The right to edit people does not open them: otherwise whoever manages records could
  give themself every right.
- **A role is created by a name and a set of rights, and its key is derived from the name once.**
  A renamed role keeps its key: the key is what the seed and the pointed edits refer to.
- **A role's name is unique the way a person's name is — by the key, not by the letters.** Two
  roles that differ by a letter case read as one to a person choosing from a list.
- **A right outside the closed set is refused, in a role and in a pointed edit alike.** A typo
  would make a role that permits nothing and looks like one that permits.
- **A role held by somebody is not deleted.** The people would be left without a role in silence;
  the refusal names how many hold it.
- **The access of a person is replaced whole: the role and all the pointed edits in one
  transaction.** Apart, there is a moment between the two in which the person holds the old role
  with the new edits.
- **An edit that would leave the signed-in person without `roles:manage` is refused with the
  reason.** Recomposing the own role, and editing the access of the own record alike: the next
  move after the save would be a refusal of the very page the person is standing on.
- **A role and a person nobody has are refused as not found.** The answer says what to look at.
- **Every operation answers with the record after the edit.** The screen shows what the storage
  holds, not what it sent.

**The section of roles.**

- **The item "Роли" and the address of the section are closed by `roles:manage`, by the one
  declaration of the menu.** Without the right the item is not drawn and the address does not
  open.
- **A row names the role, its rights in words and how many people hold it.** A role without a
  single right says so in words: an empty cell reads as not loaded.
- **The button of creating and the row menu are drawn only with the right.** Until the rights
  arrive nothing is hidden.
- **The panel of a role lives at «roles/new» and «roles/<key>» in the outlet `ro`.** The panel of
  an existing role reads the role by the key from the address, not from the list.
- **The rights in the panel are grouped by section, one checkbox per right.** A person composes
  a role by what it opens, not by a flat list of pairs.
- **The item "Удалить" is drawn only for a role nobody holds, and it asks a question naming the
  role.** The answer is not returned by any action.
- **A successful edit closes the panel, one notification says the outcome, and the list is re-read
  whole.** A refused one keeps the person in the panel with their input and the word of the
  receiver.

**The access of a person.**

- **The item "Права" of the people list row is drawn only with `roles:manage`.** The other items
  of the row keep their own right.
- **The panel of access lives at «people/<name>/access» in the outlet `ro` and reads the access by
  the name from the address.** It names the role of the person and, for every right of the set,
  one of three words and the outcome.
- **A right the role says nothing about shows "нет" while its word is "По роли".** The silence of
  the role is read on the page, not derived by the reader.
- **The outcome follows the choice at once, before the save.** The person sees what the save will
  give before giving it.
- **A successful save closes the panel and re-reads the people list.** The role in the row is
  what the storage holds now.

## What is out of scope

- A role assigned at creating a person: the panel of creating stays as it is.
- The screen for a person without a single right after the sign-in — a question of the epic.
- Roles per ownership: one receiver, one set of roles.
- A history of who gave which right to whom.

## Contract

The operations are closed by the sign-in of a person and the right `roles:manage`; the token of a
tree does not open them.

| Operation                      | What it does                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------ |
| GET /api/roles                 | the page of roles: key, name, rights, how many people hold it; ordered by name |
| GET /api/roles/:key            | one role by the key                                                            |
| POST /api/roles                | creates a role by `name` and `rights`; answers with the role                   |
| PUT /api/roles/:key            | replaces the name and the rights of the role; answers with the role            |
| DELETE /api/roles/:key         | deletes a role nobody holds; answers with nothing                              |
| GET /api/accounts/:name/access | the role key of the person, their pointed edits and the rights that come out   |
| PUT /api/accounts/:name/access | replaces the role and the pointed edits whole; answers with the access         |

The page of roles takes the same query as every list: the page, its size, the sort field (only
`name`) and the direction.

### Refusal codes

Not applicable: the receiver answers with a code of the answer of HTTP, not with named codes of the
domain. Where the operations are obliged to refuse instead of staying silent:

| What happened                                               | Code  | What it says                            |
| ----------------------------------------------------------- | ----- | --------------------------------------- |
| the name of a role is empty                                 | `400` | that the role waits for a name          |
| a right outside the closed set, or one named twice          | `400` | which right is not known                |
| the name is taken by another role                           | `409` | that a role with this name exists       |
| the role to delete is held by somebody                      | `409` | how many people hold it                 |
| the edit would leave the signed-in person without the right | `409` | that the edit would lock the person out |
| there is no role or no person with the key or the name      | `404` | that there is nothing to change         |
| a request without a sign-in                                 | `401` | that nobody introduced themself         |
| a sign-in without the right                                 | `403` | that the operation needs a right        |

## Data

Nothing new is stored: the role and the pointed edit are the records of `access-rights`. Creating
writes a role with the key, the name and the rights; the edit rewrites the name and the rights;
deleting removes the row; the access of a person rewrites the role reference and replaces the rows
of the pointed edits of that person.

## Screens and states

| State                         | What is on the screen                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| the section with the right    | the button above the list, the menu on every row; "Удалить" only where nobody holds |
| the section without the right | no item in the top row; the address leads to the first open section                 |
| the list is empty             | the emptiness view naming the button of creating                                    |
| the panel of a new role       | the name and the checkboxes by section; "Завести" and "Закрыть"                     |
| the panel of a role           | the same, filled; "Сохранить" and "Закрыть"                                         |
| the panel of access           | the role, three words per right and the outcome; "Сохранить" and "Закрыть"          |
| the request refused           | the word of the receiver above the fields; the input stays                          |
| the request succeeded         | the panel closed, one notification, the list re-read                                |
| the question of deleting      | the name of the role; "Удалить" and the way back                                    |

## Cross-cutting requirements

The right is read on every call, not taken from the issued sign-in.

### Locales

The words of the section, the panels and the rights live in the admin dictionary next to the other
words. A right is named by the section and the action: «Разборы происшествий — чтение».

### SEO

Not applicable: the admin panel is closed.

### Mobile layout

The panels take the whole width, as the panels of the neighbouring sections do; the rights column
wraps.

### Several objects

One receiver and one set of roles in it.

## Decisions

- **One right for the whole subject.** Rejected: a read right of its own for the section — the
  list of roles says what each opens, and whoever may read that may as well be the one who edits;
  a third right would need a migration for the sake of a distinction nobody asked for.
- **Both ways of getting roles: two come with the receiver, the rest the owner creates.** The
  question of `access-rights` is closed by this. Rejected: a fixed set — stale with every section.
- **The access of a person is edited from the people list, not on the roles page.** The person is
  found where people are. Rejected: a table of people on the roles page — the same list twice.
- **Three words per right instead of a checkbox with an override mark.** A checkbox cannot say
  "taken away over the role". Rejected: two lists — given and taken away — a right in both at
  once has no meaning.
- **The lock-out is refused by the receiver, not only hidden by the screen.** A direct request
  would still lock the person out.
- **The roles list answers as a page.** The shared list base reads a page, and a list of another
  shape would be read bypassing it.

## Open questions

- Whether a role should be assignable at creating a person. Until decided, the role is given a
  move later from the same row.

## History of changes

- 2026-09-15 — the agreement was written before the code.
- 2026-09-15 — merged into the domain by the task RT-1901: the receiver, the section, the two
  panels and the end-to-end suite are in the tree; every rule is bound to code in
  `implementation.md` next to it.
