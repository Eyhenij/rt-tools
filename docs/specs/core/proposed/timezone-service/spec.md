# The time zone of the reader

**Status:** proposed · **Revision:** 31 August 2026 · **Scenario prefix:** `SC-CR`
**Depends on:** none
**Laws:** `frontend-application`
**Procedures:** none

An agreement about the product written before the code. It is merged into the spec of the domain by the
last commit of the PR — with the former scenario numbers. There is no domain of the core in the tree yet:
the agreement will become its beginning together with the neighbouring proposal, when the owner says to
create the domain.

## Why

A date shown without the zone of the reader names another day at half of those who look at it. Only the
browser knows how to be asked for the zone, and the call it is asked by, at the giving out of a page by the
server, answers with the zone of the machine of the server — an answer that looks real and lies silently.

Hence the service: the address to the environment stands in one place, the environment is asked openly, and
the caller gets either the zone of the reader or an agreed answer they know about.

## Terminology

| Term                   | What it is                                                                     |
| ---------------------- | ------------------------------------------------------------------------------ |
| the zone of the reader | the time zone set in the system of whoever looks at the page                   |
| the agreed zone        | `UTC` — the answer where there is nowhere to learn the zone of the reader from |

### What it is called in the interface

Not applicable: the service is not visible on the screen, its answer is shown by whoever draws the date.

## Rules

- **The zone is asked of the environment only in the browser.** At the giving out of a page by the server
  the same call answers with the zone of the machine of the server: it looks real, and the difference of
  several hours is noticed only by the reader whose date slid away by a day.
- **Where there is nowhere to learn the zone of the reader from, the agreed zone is given.** An empty string
  and an emptiness make every caller write a spare branch of their own, and those branches diverge.
- **The zone is read at every address.** Remembered once, it stays the former one at a reader who moved or
  fixed the setting of the system without reloading the tab.
- **The address to the environment stands in the service, not in the caller.** A direct address builds and
  falls only at the giving out of a page by the server, and nothing checks that.

## What is out of scope

- The bringing of a date into a zone and its showing: that is the work of whoever draws the date.
- The list of the zones and their choice by a person: the service has no setting of its own.

## Contract

| Procedure            | What it accepts | What it gives back                                                           |
| -------------------- | --------------- | ---------------------------------------------------------------------------- |
| `getCurrentTimezone` | nothing         | the name of the zone of the reader, and outside the browser the agreed `UTC` |

### Refusal codes

Not applicable: the service has no refusals — outside the browser it answers with the agreed zone.

## Data

Not applicable: the service has no records of the storage of its own.

## Screens and states

Not applicable: the service draws nothing.

## Cross-cutting requirements

### Locales

Not applicable: the service has no labels.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable.

## Decisions

- **Outside the browser `UTC` is given, not the zone of the machine** — the zone of the machine of the
  server looks real and lies about the reader. Rejected: to give an emptiness — then the spare branch is
  written by every caller, and the branches diverge.
- **The service is injected, it is not called as a function** — it asks the environment of the neighbouring
  service, and the substitution of the environment in a spec goes by the same technique as at the rest of
  the services of the package.

## Open questions

- `Q-2` — whether the bringing of a date into a zone is needed over this. The work goes with the assumption
  that the bringing stays with whoever shows the date.

## History of changes

- 31 August 2026 — the agreement was written.
