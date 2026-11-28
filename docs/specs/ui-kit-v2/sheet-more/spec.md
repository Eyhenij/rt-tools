# The more of a sheet behind «⋮»

**Status:** in force · **Revision:** 28 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the bottom sheet of the second kit and the header of a sheet
(`../sheet-header-cards/spec.md`)
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written by task RT-3747 of epic RT-3746. Its rules were first
written in the spec of the header of a sheet and moved here with their scenarios when that
subdomain's scenarios reached the file limit.

## Why

A sheet on a phone has one place for its main action and one for the icon buttons of its header.
What is neither — a switch, a further filter — had no place: an application put it into the footer
above the main action, and the owner found it cluttered. The owner's words, 27 November 2026: «по
дефолту ложим доп кнопки в три точки (вертикальные) слева от сброса при нажатии открывается второй
экран ботомшита, но нужно давать возможность ложить и в шапку и в футер».

## Terminology

| Term              | What it is                                                           |
| ----------------- | -------------------------------------------------------------------- |
| the more          | what is neither the main action nor the info line of a sheet         |
| the more template | the application's template `<ng-template rtSheetMore>` with the more |
| the second screen | the same sheet showing the more template, opened by «⋮»              |

### What it is called in the interface

The title of the second screen is the kit dictionary key `bottomSheetMore` («More»); the showcase
reads «Ещё». The kit's `uiMore` is the «read more» of the collapsible text and is not used here.

## Rules

- **A sheet given a more template puts a round «⋮» button on the right of its header.** It stands
  left of the icon buttons of the application, 8 px apart. The sheet keeps the order of those
  buttons as the application puts them, so a delete button is the last on the right when the
  application puts it last. A sheet with no more template has no «⋮» and no second screen.
- **«⋮» opens the second screen of the same sheet.** The chevron back stands on the left, the title
  in the centre — the one the template names, else «More» in the language of the kit, the same words
  naming the dialog for a screen reader — and the template below it, laid out by the application.
- **The chevron, a swipe, Escape and the back request of the template return to the first screen.**
  The application closing the sheet closes both, and the sheet opens again on its first screen; a
  template taken away and put back does not open the second screen by itself.
- **A sheet with its own header gets the sign that it has a second screen and the request to open
  it, and draws «⋮» itself.**
- **The more template belongs to the sheet it is written in and stands as its direct child.** Inside
  a control block or a grouping container it is found, inside an element it is not: a sheet declared
  in the content of another keeps its template to itself.
- **A component that draws the sheet in its own template passes the more template by an input.** The
  side panel and the choice panel do so; the input wins over a template in the content.
- **What must stay in sight an application still puts in the header, the footer or the body.**
- **After the answer «stay» to the question before closing the closed second screen stays out of
  reach.** Tab and a screen reader do not reach it.

## What is out of scope

- The choice panel sheet and the fields of the kit: task RT-3748 passes them the more template.
- The side panel opened as a sheet: task RT-3749.
- Escape on the second screen under the overlay of the choice panel: the overlay closes the whole
  sheet today; task RT-3748 turns it to the first screen.

## Contract

Not applicable: the surface is one template directive, one input and two fields of the own-template
context; they are listed under «Screens and states». The subdomain serves no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| State            | What is visible                                                        |
| ---------------- | ---------------------------------------------------------------------- |
| no more template | the sheet as before, no «⋮»                                            |
| first screen     | «⋮» left of the icon buttons of the header                             |
| second screen    | the chevron back, the title «More» or the template's own, the template |
| own header       | the application's header, its own «⋮» by `hasMore` and `openMore`      |

### The surface

| what                                         | where                    | meaning                                      |
| -------------------------------------------- | ------------------------ | -------------------------------------------- |
| `<ng-template rtSheetMore let-back>`         | the content of the sheet | the more template, `back` returns            |
| `rtSheetMoreTitle`                           | the directive            | the title of the second screen               |
| `moreTemplate: RtSheetMoreDirective \| null` | the sheet's input        | the more template of a component's own sheet |
| `hasMore`, `openMore`                        | the own-template context | the sign and the request for an own header   |

## Cross-cutting requirements

### Locales

One new key of the kit dictionary, `bottomSheetMore`. The showcase carries the Russian label «Ещё».

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

The sheet is a phone surface; the frames were measured at 375 wide.

### Several objects

Every sheet has its own second screen; a sheet inside another keeps its own.

## Decisions

- **The second screen is the same sheet nested in itself, not a new surface.** The kit already opens
  a sheet from a sheet as its second screen with the chevron back; the more reuses that.
- **The title has a key of its own, `bottomSheetMore`.** `uiMore` reads «Подробнее» in the showcase.
- **The template is found among the direct children only.** A search at any depth gave the template
  of an inner sheet to the outer one.

## Open questions

None.

## History of changes

- 27 November 2026 — the more behind «⋮» written in the spec of the header of a sheet with the code
  (RT-3747).
- 28 November 2026 — the input `moreTemplate`, the own header's `hasMore` and `openMore`, the direct
  child rule after two review rounds; the rules and scenarios 1927…1933 moved into this subdomain
  (RT-3747).
