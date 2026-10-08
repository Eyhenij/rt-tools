# The inline edit

**Status:** in force · **Revision:** 8 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the text field, the icon button and the tooltip of the kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit about `rt-inline-edit`, written by task RT-2553 of the epic RT-2542,
which moves the applications' shared parts into the kit.

## Why

Two applications that install the second kit let a person change a short value where it is shown: a
report name in a toolbar, a title in a page header, a key in a settings row. One application draws a
badge that is a field all the time and saves on leaving it; the other opens a field with «Save» and
«Cancel» under the row. Each writes its own copy, and the kit has none.

## Terminology

- **The value** — the text the application owns and shows at rest.
- **The draft** — what the person has typed into the open field.
- **At rest** — the value is shown and the field is closed.
- **Editing** — the field is open with the draft and the two buttons.

### What it is called in the interface

| In the domain | On the screen                                             |
| ------------- | --------------------------------------------------------- |
| At rest       | the value as text or as a badge, a pencil after it        |
| Editing       | the kit text field, a check button and a cross button     |
| Saving        | the check button spins, the field and the cross are muted |

## Rules

- **At rest the value is a button that opens the field; an empty value shows the placeholder.** A
  value wider than its place is cut and shows its whole text in a tooltip.
- **The field opens with the value in it, takes the focus and selects the text.**
- **Enter and the check button save; the draft is trimmed before it goes out.** A draft equal to the
  value closes the field and sends nothing.
- **An empty draft is not saved unless the input allows it.** The check button is unavailable, and
  Enter does nothing.
- **Escape and the cross button close the field and send the cancel; the value stays as it was.**
- **The new value goes out by an output, and the component does not keep it.** By default the
  field closes on saving; an application that answers later keeps it open and closes it itself.
- **While saving, the check button spins, and the field and the cross are unavailable.**
- **Leaving the field is kept, saved or cancelled by an input; moving to its own buttons is not
  leaving.**
- **An unavailable component does not open the field.**

## What is out of scope

- Several lines of text and rich text: the field is one line.
- Checking the value beyond emptiness: the application refuses a value by keeping the field open.

## Contract

None: the part is a form element and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own: the value lives in the application.

## Screens and states

| state       | what is drawn                                               |
| ----------- | ----------------------------------------------------------- |
| at rest     | the value or the placeholder, the pencil                    |
| badge look  | the same on a tinted plate with a border                    |
| editing     | the field with the draft, the check and the cross buttons   |
| empty draft | the check button unavailable                                |
| saving      | the check button spins, the field and the cross unavailable |
| unavailable | the value muted, no pencil, a press does nothing            |

## Cross-cutting requirements

### Locales

The names of the pencil, the check and the cross are kit labels, English in the package and
translated by the consumer's translator. The value and the placeholder come from the consumer.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The buttons follow the pointer sign like every kit control; the field takes the width it is given.

### Several objects

Every component holds its own draft; opening one does not close another.

## Decisions

- **The field opens on a press, and the badge look keeps the badge only at rest.** The first
  application's badge is a field all the time, so a person cannot tell it from a filled input. A
  press on the value opens the kit field, which reads as a field in both looks.
- **Saving and cancelling have buttons and keys at once.** The card asks for «Save» and «Cancel»,
  the first application uses Enter and Escape; a touch screen has no keys.
- **Leaving the field keeps it open by default.** Saving on leaving loses a typo to a stray click;
  the first application's way stays one input away.
- **The component hands the value out and does not store it.** The application saves it and may
  refuse, so the value shown at rest is always the application's.

## Open questions

None.

## History of changes

- 8 October 2026 — written by the task RT-2553 of the epic RT-2542.
