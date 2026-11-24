# The right group of the page header

**Status:** in force · **Revision:** 15 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the page header, the notifications bell, the chat in a workspace with cards
**Laws:** `frontend-application`, `verifiability`, `reuse-first`, `mockups`
**Procedures:** none

A subdomain of the second kit about the right end of `rt-page-header`: the header buttons the
application gives by the template `<ng-template rtHeaderBell>` and the profile button. Written by task RT-3345
together with the fill fix of the chat.

## Why

Each node of the slot and the profile stood in the header row on their own, and the row spread its
members across the width. With two buttons in the slot and only the burger on the left, the bell
went to the middle of the header. The bell drew only its own icon, so a second header button in
the same look could not be put next to it. On a phone the profile took the width of a circle, a
name and a caret. And a chat with `fill` under the workspace strip pushed the reply field below the
column on a long thread.

## Terminology

- **The right group** — the slot buttons and the profile button, standing together at the right
  edge.
- **A header button** — `rt-notifications-bell` with any kit icon.

### What it is called in the interface

| In the domain       | On the screen                                        |
| ------------------- | ---------------------------------------------------- |
| The right group     | the buttons and the profile at the right edge        |
| A header button     | an icon button like the bell, with a dot when unread |
| The compact profile | one `user` icon in the profile button                |

## Rules

- **The slot buttons and the profile stand in one group at the right edge, 8 apart, in the order
  of the markup.** The group pushes itself to the right edge and does not shrink; the row of
  sections keeps its place on a wide screen.
- **The bell draws any kit icon given by its `icon` input, `bell` by default.** An empty value
  keeps the bell.
- **Up to 768 inclusive the profile button shows only the `user` icon.** The circle with the
  letter, the name and the caret are hidden; the button keeps its padding and its tap area.
- **The profile button is named by the user's name.** On a phone the name is hidden, and the
  button has no other caption.
- **A chat with `fill` shrinks under the strip above it in a flex column.** The reply field stays
  at the bottom of the column on a long thread; a short thread and a wide screen keep their layout.

## What is out of scope

- The order of the slot buttons: the application sets it by its markup.
- What a header button opens: the application handles its click.

## Contract

None: the part is a control and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own: the user and the buttons come from the application.

## Screens and states

| state             | what is drawn                                                  |
| ----------------- | -------------------------------------------------------------- |
| one button, wide  | sections, then the bell and the full profile at the right edge |
| two buttons, wide | sections, then the assistant, the bell and the full profile    |
| up to 1080        | the burger on the left, the right group at the right edge      |
| up to 768         | the burger, the right group with the profile as one icon       |

## Cross-cutting requirements

### Locales

The kit adds no words: the button captions and the user's name come from the application.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

Up to 768 inclusive the profile is one icon; the threshold follows the place of the page, as every
narrow rule of the kit does.

### Several objects

Not applicable: one header has one right group.

## Decisions

- **A second header button is the same bell with another icon, not a component of its own.** The
  look, the `--rt-nav-*` tokens, the unread dot and the rounding step already live in the bell; a
  separate button would repeat its styles one to one.
- **The compact profile is drawn by the styles, not by a condition in the template.** Both forms
  stand in the markup, and the threshold decides which one shows.

## Open questions

None.

## History of changes

- 15 November 2026 — written by the task RT-3345 straight into the kit spec.
