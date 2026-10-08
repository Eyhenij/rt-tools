# The run status of the assistant

**Status:** in force · **Revision:** 2026-10-08 · **Scenario prefix:** `SC-UKV`
**Depends on:** the icon, the spinner, the timeline and the tooltip of the kit
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about `rt-ai-run-status`: the line that shows how an AI assistant is
working on an answer, how it ended, and which steps it went through.

## Why

While a model works on an answer, a person sees one line of the current step or nothing. They
cannot tell that the model is still working, how long it took, whether it was stopped or failed,
and which steps it made. The mockup of the assistant chat draws a status line with a mark, a label,
a time and a list of steps that opens under it.

## Terminology

- **The run** — one answer of the assistant from the question to the end.
- **The state** — where the run is: working, done, stopped by the person, failed.
- **The label** — the current step while the run works, the result after it ends.
- **The meta** — the short line to the right of the label: the time of the step or the number of
  steps.
- **The steps** — the steps the run went through, each with its own label and time.

### What it is called in the interface

| In the domain | On the screen                                           |
| ------------- | ------------------------------------------------------- |
| The state     | the spinner or the round mark left of the label         |
| The label     | «Fetching daily performance briefing», «Worked for 31s» |
| The meta      | «14s», «3 steps» right of the label                     |
| The steps     | the vertical list under the line                        |
| Show steps    | the chevron and the tooltip «Show steps» / «Hide steps» |

## Rules

- **The mark shows the state: a spinner while the run works, a green check when done, a muted cross
  when stopped, a red exclamation when failed.** The mark is 16px, the kit's icon or spinner.

- **While the run works, a highlight runs across the label, and with reduced motion the label is
  muted and still.** The highlight goes from the muted text colour to the primary action colour.

- **A stopped label is muted, a failed label is red, a done label has the text colour.**

- **The meta stands right of the label in the small muted text and is not drawn when empty.**

- **With steps, the whole line is a button that opens and closes the list of steps.** The chevron
  points down when closed and up when open; the tooltip and the accessible name say «Show steps» or
  «Hide steps»; `aria-expanded` follows the list.

- **Without steps, the line cannot be opened and is announced as a status.** There is no chevron
  and no button.

- **The steps are the kit's timeline, and the state of the list is given and read by the
  consumer.** The list is closed by default.

## What is out of scope

- How the steps are taken from the model's events: the consumer passes the ready list.
- Timing: the consumer formats the time into the meta and the step labels.

## Contract

None: the line is a layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own.

## Screens and states

| state         | what is drawn                                           |
| ------------- | ------------------------------------------------------- |
| running       | the spinner, the running highlight, the meta            |
| done          | the green check, the label, the meta                    |
| stopped       | the muted cross, the muted label                        |
| failed        | the red exclamation, the red label                      |
| with steps    | the chevron down; the tooltip «Show steps»              |
| open          | the chevron up and the timeline of steps under the line |
| without steps | no chevron, the line is not a button                    |

## Cross-cutting requirements

### Locales

«Show steps» and «Hide steps» are kit labels, English in the package and translated by the
consumer's translator. The label, the meta and the steps come from the consumer.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The line keeps its layout on a narrow screen; a long label wraps.

### Several objects

Not applicable.

## Decisions

- **The line is its own molecule, not a mode of the timeline.** The timeline draws steps; the line
  draws the state of a whole run and opens the timeline.
- **The whole line is the button, not the chevron alone.** A target of 16px is too small, and the
  label is what a person reads before clicking.

## Open questions

None.

## History of changes

- 2026-10-08 — written by the task RT-2651 of the epic RT-2649, which brings the assistant chat
  into the kit.
