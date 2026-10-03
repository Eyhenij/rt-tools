# The options, focus, pending state and properties of the side panel

**Status:** in force · **Revision:** 2 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the side panel and the dialog of the second kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2480 of the epic RT-2472.

## Why

An application moving from the first kit waits for the panel's result even when the panel leaves
with a navigation, ties the panel to the component that opened it, answers a refused Escape with
its own question, keeps the keyboard inside the panel, covers it while a request runs, puts a row
under the title and sets the panel's padding its own way. The second kit's panel does none of this,
and a panel or dialog disposed without closing leaves its subscriber waiting forever.

## Terminology

| Term              | What it is                                                       |
| ----------------- | ---------------------------------------------------------------- |
| disposal          | the overlay of a panel or dialog is removed without `close()`    |
| the owner         | the component whose injector opened the panel                    |
| a close request   | Escape or a backdrop click the panel did not answer by closing   |
| the pending layer | a layer with a spinner over the whole panel while a request runs |
| the header row    | the place under the header title across the whole header         |

### What it is called in the interface

A person sees a panel at the edge of the page; while a request runs it is covered by a spinner. The
options, the stream and the properties are invisible to them.

## Rules

- **A panel or dialog disposed without closing finishes its result with nothing.**
- **A panel or dialog closed with a result reports that result once.**
- **A panel opened with an owner's injector takes the owner's providers and closes when the owner is destroyed.**
- **A closing gesture the panel refused is reported as a close request.**
- **A panel with a focus trap keeps Tab inside, takes focus on opening and returns it after leaving.**
- **A pending panel is covered by a spinner layer and marked busy.**
- **The header shows a row under its title across the whole header, and an empty row takes no room.**
- **The panel's padding, footer layout, title line height and error margin come from properties.**
- **Without the new options, inputs, slot and properties the panel draws as before.**

## What is out of scope

- An owner's injector for the dialog.
- The tabs layout of the panel: its strip keeps the panel's common inset.

## Contract

Not applicable: the surface is a service config, a handle stream, inputs, a slot and properties of
kit components.

### Refusal codes

Not applicable.

## Data

Not applicable: the components keep nothing.

## Screens and states

| State        | What is visible                                         |
| ------------ | ------------------------------------------------------- |
| pending      | a translucent layer with a spinner over the whole panel |
| a header row | an element under the title across the whole header      |

## Cross-cutting requirements

### Locales

Not applicable: the kit adds no words.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

The panel keeps its full-window width on a narrow screen; the pending layer and the header row
follow it.

### Several objects

Every open panel holds its own owner, close requests, focus trap and pending layer; the properties
apply to all panels under the node that sets them.

## Decisions

- **A disposal finishes the result with nothing, and after `close()` it adds nothing.** A subscriber
  waits for exactly one answer.
- **The owner's destruction calls `close()`.** The subscriber hears the same nothing as after a
  disposal, and the panel plays its leaving.
- **A close request is every refused gesture, whatever refused it.** Under `disableClose` and with
  the gesture switched off alike, the user asked to close and the panel stayed.
- **The focus trap is the CDK one with automatic capture, and it is off by default.** That is the
  panel's behaviour today.
- **The properties the first kit already names get names of their own.** One application holds both
  kits, and a shared name would paint one kit's panel with the other's values.

## Open questions

None.

## History of changes

- 2 October 2026 — the agreement was written from the consumer's request by task RT-2480.
