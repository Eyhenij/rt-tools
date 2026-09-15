# The receiver opens to other people, and what each of them may do is set on a screen

Today the receiver is used by one person. A second one is created only by a command on the node
itself — `account add` over ssh — and once created gets exactly what the owner has: all four
sections and the right to close any cargo record. There is nothing to give somebody a look at the
incident analyses without giving them the closing of those analyses.

This epic starts rights: it makes the receiver a place several people work in, and makes what each
of them may do a thing the owner sets from a screen rather than from a database query.

## What already stands and works

| What                        | Where                                                                    | The state                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| the account                 | `prisma/schema.prisma`                                                   | a name, a password hash, a disabled sign, the last sign-in; no role and no rights                                   |
| creating an account         | `libs/message-bus-api/accounts/feature/`                                 | four commands of the launch line: `add`, `passwd`, `disable`, `list`; there is no creation from the web at all      |
| the access check            | `libs/message-bus-api/access/feature/`                                   | one guard over the whole application, three kinds of access: public, a tree token, a person's sign-in               |
| the access declaration      | `libs/message-bus-api/access/util/`                                      | a mark on the class or the operation; an undeclared operation answers nobody                                        |
| the refusal                 | the same guard                                                           | one answer for every branch — 401; "you did not introduce yourself" and "this is not for you" are indistinguishable |
| the admin panel route guard | `libs/message-bus-admin/auth/shell/`                                     | one guard on the whole closed branch; sections are not told apart                                                   |
| the menu                    | `libs/message-bus-admin/common/container/util/`                          | four items, the same for everyone who signed in                                                                     |
| the law and the rule        | `docs/constitution/application/access.md`, `.claude/skills/permissions/` | rights, roles, presets and overrides are described; the companion says the tree has none of it                      |

## Decisions

- **The rights model is taken from the law, not invented anew.** A right is the pair "resource and
  action", a role is a named set of rights, and over the role a person carries pointed edits. The
  law already describes this whole, and the rule's companion holds the line "there are no rights
  here" — the epic closes exactly that half.
- **A person is created by a name and a first password, and the one creating them names both.** The
  receiver has no mail of its own, so an invitation code would need a second sign-in screen and a
  second entity in the storage for the sake of not passing a password by hand. The password reaches
  the person past the receiver.
- **The rights are read on every call, not taken from the issued sign-in.** A sign-in lives for
  hours; a right taken away would otherwise keep the section open until the end of the day.
- **A right the role says nothing about counts as not given.** The default is the same as the
  receiver's access guard already holds: what declared nothing is refused rather than let through.
- **The commands of the launch line go away at the end, not at the start.** While the screens are
  not there, they are the only way in; while they stand next to the screens, one action has two
  paths and they drift apart in silence. Their removal is the last task, and it also closes the
  hole they were holding: there is nobody to create the first record from the web.
- **The branches stand each on the epic branch, not in a stack.** The tasks are merged in the order
  of the table, and the next branch is created after the previous one is merged: everything from
  the second onward stands on the rights of the first, and a stack of six would mean six requests
  the run stalls on at once. The epic branch is `RT-1896-access-rights`, taken from the main branch
  after the first two tasks had already been merged straight into it: those two are not in it, and
  it starts from a main branch that already carries them.

## The tasks

| №   | Task                                                                      | Why here                                                                                                                                           |
| --- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | #1897 — a right, a role and a check that reads them                       | Without it nothing else is made: there is nothing to close a section by. It also splits the refusal in two — without a sign-in and without a right |
| 2   | #1898 — a menu item and a section address are closed by one declaration   | The cheapest use of the rights, and the one the owner sees first. Until the rights arrive the admin panel hides nothing                            |
| 3   | #1899 — the list of people                                                | The screen that answers "who has access to the cargo at all". It reads, it does not edit — so it goes before editing                               |
| 4   | #1900 — creating, disabling and changing a password from a screen         | The three actions of the launch line move to a panel next to the list                                                                              |
| 5   | #1901 — the page of roles and rights                                      | The set of a role and the pointed edits over it. It goes after the list: there must be somebody to assign a role to                                |
| 6   | #1902 — the commands are removed, the first record gets a path of its own | Last: until then the commands are the only way in when the admin panel does not come up                                                            |
| 7   | #2134 — the section is called «Пользователи»                              | Added by the owner's word when the epic was taken up again; one word in the dictionary, done before the editing tasks so their frames carry it     |

## What was found along the way

- **Two migrations of one backfill met at the merge of the main branch into the epic branch.** The
  epic branch carried `20260910090000_rights_backfill`, the main branch
  `20260910100000_grant_rights_to_existing_accounts`; the second creates a role for the cargo triage
  besides the owner one. Applied one after the other, the first would give the triage account the
  owner role, and the second would no longer see it: both look for an empty role. The branch's own
  migration is removed, the tests move onto the one that is in the main branch — and gain what it
  answers for on its own: the order of the two updates.
- **#2018 — the rights migration took the access away from everybody.** Task 1 created the tables
  and the column and put not a single row: every account made before it keeps an empty role, that is
  no rights at all, and the panel shows no section. It is fixed by a follow-up migration that
  carries the former access over. Found on production by the owner.

The order holds to the end of the epic. A reconsideration is the owner's decision, not the
executor's.

## What this epic does not do

- **It does not divide the cargo by trees.** Rights close a section and an action in it; who sees
  which tree's cargo stays as it is — everyone signed in sees all of it. If that is needed, it is a
  task of its own after the epic.
- **It does not start a password change by the person themselves and a recovery of a forgotten
  one.** The law names both an open question of its own, `Q-A-2`; the epic gives a change of
  another person's password to whoever holds the right to edit people, and no more.
- **It does not touch the tree token.** The cargo intake and the editing of its state by a tree are
  closed as before, and no right of a person opens them.
- **It does not start a second ownership.** The law speaks of a role per ownership; here there is
  one receiver and one set of roles in it.

## Open questions

- **How the first record is created once the commands are gone.** The proposal is a first-run
  screen open exactly while the storage holds no account and closed forever after the first one.
  Decided in task #1902, not before: until then the commands hold this.
- **Whether a role is assigned at creation or after it.** Creating without a role gives a person
  who signed in and sees nothing; creating with a role means the role list must be ready by task
  #1900, that is, before #1901. Decided by task #1900 by what is on disk by then.

## What the epic ends with

- The owner creates a second person from a screen, gives them a role, and that person sees exactly
  the sections the role names — checked by the end-to-end suite, not by reading.
- A request without a sign-in and a request without a right answer differently, and the admin panel
  tells them apart on the screen.
- `account add`, `account passwd`, `account disable` and `account list` are not in the tree, and the
  first record has a path named in the spec of the domain.
- The companion of the rule `permissions` no longer carries the line "there are no rights here":
  every article of the rule has a line with a binding.
