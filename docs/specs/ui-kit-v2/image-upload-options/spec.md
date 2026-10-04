# The download button, the choose button and the preview of the image uploader

**Status:** in force · **Revision:** 4 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the image uploader, the icon button and the button of the second kit
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-2522.

## Why

An application moving from the first kit sizes the download button and its icon its own way, sets
its own blur under the button, draws the choose button in its own look and icon, and has no gap
under the picture. The second kit's uploader takes the button size from the shared icon button,
writes the blur as a number, writes the choose look and icon in the template and leaves a 4 px gap
under the preview.

## Terminology

| Term                | What it is                                                         |
| ------------------- | ------------------------------------------------------------------ |
| the download button | the round button over the picture's corner that saves the image    |
| the choose button   | the button inside the empty uploader's drop zone that opens a file |
| the preview         | the box around the applied picture                                 |

### What it is called in the interface

A person sees a picture with a download button in its corner, or an empty frame with a choose
button; the properties and the inputs are invisible to them.

## Rules

- **The download button takes its size from the uploader's property, and keeps its step without it.**
- **The download icon takes its size from the uploader's input, and from the button size without it.**
- **The blur under the download button comes from the uploader's property.**
- **The choose button takes its look and icon from the uploader's inputs.**
- **The preview stands on the top of its line, with no gap under the picture.**
- **Without the new values the uploader draws as before, apart from the gap.**

## What is out of scope

- An icon size in pixels: the icon button takes the icon size in steps.

## Contract

Not applicable: the surface is inputs and properties of a kit component.

### Refusal codes

Not applicable.

## Data

Not applicable: the component keeps nothing.

## Screens and states

| State              | What is visible                                         |
| ------------------ | ------------------------------------------------------- |
| the picture        | the picture, its download button, no gap under it       |
| the empty uploader | the frame with the choose button in the consumer's look |

## Cross-cutting requirements

### Locales

Not applicable: the kit adds no words.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

Not applicable: the properties and the inputs act the same at every width.

### Several objects

Every uploader holds its own inputs; a property set on one uploader does not reach another.

## Decisions

- **The icon size is an input, not a property.** The icon writes its size inline, and a property
  would silently do nothing.
- **The download size is handed to the button as its public size.** An uploader that sets it wins
  over a size set for icon buttons higher on the page; without it the button keeps its step.
- **The gap is removed without a switch.** Nobody designed it, and a consumer has nothing to do with
  it.

## Open questions

None.

## History of changes

- 4 October 2026 — the agreement was written from the consumer's request by task RT-2522.
