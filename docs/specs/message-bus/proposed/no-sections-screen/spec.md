# The screen of the person to whom no section is open

**Status:** proposed · **Revision:** 16 September 2026 · **Scenario prefix:** `SC-MB`
**Depends on:** `docs/specs/message-bus/access-rights/spec.md`, `docs/specs/message-bus/admin-shell/spec.md`
**Laws:** `frontend-application`, `navigation`, `access`
**Procedures:** none — nothing is asked of the receiver that it does not answer already

A product agreement of the domain "the intake of the cargo", written before the code. It merges
into `docs/specs/message-bus/admin-shell/` by the last commit of the branch, with the scenario
numbers unchanged.

## Why

A person whose account carries no right signs in successfully and lands on nothing. The sign-in
worked, the receiver answered, the name is known — and the browser shows an empty page: the root
leads into "the first open section", there is none, and the address resolves to emptiness. Whoever
sees this cannot tell a granted-but-empty account from a broken admin panel, and there is nothing
on the page to ask anybody about it with.

Half of the answer is already in the tree: the shell of the admin panel draws an empty state when
the list of open sections comes out empty, and the top row keeps the name and the way out. What is
absent is an address. A state that lives only as "the content zone drew nothing" does not survive a
reload, cannot be linked to, and is not reached at all when the person came by a direct link to a
closed section — the check refuses the move, and the shell that would have drawn the state is never
created.

## Terminology

| Term                      | What it is                                                                    |
| ------------------------- | ----------------------------------------------------------------------------- |
| a closed section          | a section whose menu item declares a right the signed-in person does not hold |
| no sections open          | the state of a person for whom every item of the menu is a closed section     |
| the screen                | what such a person sees instead of a section: why it is empty and whom to ask |
| the address of the screen | the path the screen lives at, on a par with the addresses of the sections     |

### What it is called in the interface

| In the agreement | On the screen                                                          |
| ---------------- | ---------------------------------------------------------------------- |
| no sections open | Доступа ни к одному разделу нет                                        |
| whom to ask      | Права выдаёт владелец приёмника — попросите его открыть нужные разделы |
| the way out      | Выйти                                                                  |

## Rules

- **The screen has an address of its own, and it stands next to the addresses of the sections.** A
  state visible only as "the content zone drew nothing" does not survive a reload: the person who
  returns by the browser's own history lands on the empty page again and reads it as a breakage.
  The address also gives the end-to-end scenario something to ask for and the frame something to be
  taken of.
- **The screen lives inside the shell, not beside it.** The top row carries the name and the way
  out, and both are exactly what the person needs here: a screen drawn outside the shell would have
  to repeat them, and the second copy diverges from the first silently. The address of the screen is
  therefore a child of the closed branch, like a section.
- **The root of the admin panel leads to the screen when no section is open.** Today it leads to
  "the first open section", and with none open the move resolves to an empty address — the person
  lands nowhere. For everyone else the rule of the rights subdomain stays as it is: the root leads
  into the first open section.
- **A direct link to a closed section leads to the screen, not to a cancelled move.** A refused move
  leaves the address where it stood, and on the first load of the page there is nowhere for it to
  stand: the shell is never created and the person sees a blank page. Where there is an open section
  to go to, the move still goes there — this rule is about the case where there is not.
- **The screen is open to whoever has no section open, and leads away everyone else.** A person with
  at least one open section who asks for the address of the screen by hand is taken to their first
  open section: otherwise the admin panel holds an address that says "you have no access" to
  somebody who has it.
- **The screen names the reason and whom to ask, not the rights that are missing.** Naming them
  teaches the set of rights of the receiver to whoever was given none, and the person cannot act on
  the names anyway — they ask the owner either way.
- **The way out from the screen is the same way out as everywhere.** The top row of the shell
  already carries it, and the screen adds no second button of its own. After it the person is on the
  sign-in screen, as from any section.
- **A right that arrives without a reload takes the person off the screen.** The rights come with
  the answer about the signed-in person, and the shell computes the open sections from the store: as
  soon as a section is open, the screen is no longer this person's state. It is not a page that has
  to be left by hand.
- **The screen is not shown while the answer about the signed-in person has not arrived.** Until the
  rights are received they are unknown, not empty — the subdomain of the rights says so about the
  menu, and the screen obeys the same rule. Otherwise it flashes on every page load ahead of the
  answer and reads as a refusal that was then taken back.

## What is out of scope

- **Asking for access from the screen.** Nothing is sent to the owner of the receiver: the screen
  names them in words, and the asking happens outside the admin panel. Sending a request is work of
  its own and has no task.
- **Who granted the account.** The screen names the role that grants rights, not a person by name:
  the link "who created the account" does not exist in the storage.
- **The reading of the rights and the shape of the answer about the signed-in person.** Both are
  described by the subdomain of the rights and are not touched here.
- **The screen of an account that was switched off.** That one is refused at the sign-in and never
  reaches the shell.

## Contract

Not applicable: no operation of the receiver is added or changed. Everything the screen needs — the
name of the person and their rights — arrives with the answer about the signed-in person that the
admin panel already asks for.

### Refusal codes

Not applicable: nothing is asked of the receiver by this agreement.

## Data

Not applicable: the screen owns no record of the storage.

## Screens and states

One screen, at an address of its own inside the shell of the admin panel.

| State                                                 | What the top row shows         | What the body shows                                |
| ----------------------------------------------------- | ------------------------------ | -------------------------------------------------- |
| the answer about the signed-in person has not arrived | every item, no name            | what the address asks for; the screen is not shown |
| the answer arrived, no section is open                | the name and the way out only  | the reason and whom to ask                         |
| the answer arrived, at least one section is open      | the items of the open sections | the section; the address of the screen leads away  |

## Cross-cutting requirements

### Locales

The admin panel is written in one language, and both lines of the screen already lie among the
labels of the admin panel. The address of the screen is a word of the interface and is not
translated.

### SEO

Not applicable: the admin panel is closed by a sign-in and is not given to search.

### Mobile layout

The screen takes the empty state of the second kit, and on a narrow screen it lays itself out the
same way as every other empty state of the admin panel. Nothing of its own is added.

### Several objects

There is one receiver. Several ownerships are out of scope.

## Decisions

- **The screen gains an address instead of staying a state of the content zone.** Rejected: leaving
  it as it is and letting the shell draw the empty state at the empty address — that is what the
  tree does today, and it is exactly what does not survive a reload and is never reached by a direct
  link to a closed section.
- **The address lives inside the shell rather than next to the sign-in.** Rejected: a screen of its
  own outside the shell — it would repeat the name and the way out, and the second copy diverges
  from the first silently.
- **A direct link to a closed section leads to the screen rather than being refused.** Rejected: the
  refusal that stands there today — on the first load of the page it leaves the person on a blank
  page, because the shell that would have said anything is never created.
- **Whoever has a section open is led away from the address of the screen.** Rejected: showing it to
  anyone who asks — the admin panel would then hold an address that tells a person with access that
  they have none.

## Open questions

- **Whether the screen should name the sections the person has no access to.** The subdomain of the
  rights holds the same question about the rights themselves, and this agreement answers neither:
  the screen names whom to ask and nothing else.

## History of changes

- 16 September 2026 — written as the agreement of the task RT-2162.
