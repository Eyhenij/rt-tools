# The tabs of the conversation list and the line under the chat title

**Status:** in force · **Revision:** 2026-10-28 · **Scenario prefix:** `SC-UKV`
**Depends on:** `channel-sign` — the header line stands next to the sign of the channel
**Laws:** `frontend-application`, `reuse-first`
**Procedures:** none

The subdomain names two places of the conversation workspace: a strip of tabs under the search of
the conversation list, and a second line under the title of the correspondence header.

## Why

A screen that gathers conversations divides them into groups — all, waiting for a reply, archived —
and switches between them right under the search. The list header holds only the search and the
filter button, and the rows start right under it: a consumer that puts its tabs above the list puts
them above the search.

The header of an open conversation names the guest and, under the name, the channel and the contact
the reply goes to. The header holds one title line, and a consumer would glue both into one string.

## Terminology

| Term           | What it is                                                    |
| -------------- | ------------------------------------------------------------- |
| The tabs strip | the band under the list header that holds the consumer's tabs |
| The subtitle   | the line under the title of the correspondence header         |

### What it is called in the interface

| In the spec    | On the screen                                                           |
| -------------- | ----------------------------------------------------------------------- |
| The tabs strip | «Все», «Ждут ответа», «Архив» under the search of the conversation list |
| The subtitle   | «WhatsApp · +66 81 234 5678» under the name of the guest                |

## Rules

- **The tabs strip stands under the list header and above the rows.** Its content is the
  consumer's template `rtThreadListTabs`; the kit gives the place and the inset.
- **A list without the tabs template is drawn as before.** The rows follow the header directly.
- **The subtitle stands under the title in one column.** It is small muted text; a long value is
  cut by the ellipsis, and the header buttons keep their place.
- **A header without the subtitle is drawn as before.** The empty line is hidden, and the header
  keeps its height.

## What is out of scope

- **What the tabs are.** The set, the labels and the selected tab are the consumer's.
- **What the subtitle says.** The channel and the contact are the consumer's data.

## Contract

Not applicable: the subdomain describes the surface of components, not an exchange with the server.

### Refusal codes

Not applicable.

## Data

Not applicable: both places are inputs of the components, nothing is stored.

## Screens and states

| State                         | What is visible                                                     |
| ----------------------------- | ------------------------------------------------------------------- |
| A list with the tabs          | the search and the filter button, the tabs under them, the rows     |
| A list without the tabs       | the list as before                                                  |
| A header with the subtitle    | the sign, the title and the line under it, the buttons at the right |
| A header without the subtitle | the header as before                                                |

## Cross-cutting requirements

### Locales

The labels of the tabs and the text of the subtitle arrive from the consumer: the kit translates
neither.

### SEO

Not applicable.

### Mobile layout

The tabs strip takes the width of the list column. The subtitle is cut by the ellipsis on a narrow
screen.

### Several objects

Not applicable.

## Decisions

- **The tabs are a template slot, not an input.** The argument: the consumer decides the set, the
  labels and which tab is selected, and a toggle group of the kit draws them. The price: the kit
  does not check what stands in the slot.
- **The subtitle is an input, not a slot.** The argument: it is text, and the kit owns its size,
  colour and truncation. The price: a consumer that needs markup there has no place for it.

## Open questions

- None.

## History of changes

- 2026-10-28 — created by the work about the tabs of the conversation list and the header line,
  task RT-2977.
