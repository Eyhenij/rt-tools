# Step arrows in the number field

**Status:** in force · **Revision:** 3 November 2026 · **Scenario prefix:** `SC-UKV`
**Dependencies:** kit labels — the arrows are named by two kit labels; the kit icon `chevron-up`
**Законы:** `verifiability`, `frontend-application`
**Procedures:** none

A subdomain of the second kit about the step arrows of `rt-input-number`, written by task RT-2890.
Digit grouping in the same field is the subdomain `number-grouping`.

## Why

The number field of the second kit is a text field with a numeric keyboard. A person who meets a
number field expects to change the value by a step with arrows or with the keyboard, as the
browser's own number field allows. The kit field cannot do that: it has neither a step nor arrows.

## Terminology

| Term           | What it is                                                             |
| -------------- | ---------------------------------------------------------------------- |
| **Step**       | the amount one arrow press adds or subtracts; one by default           |
| **Arrows**     | two buttons at the right edge of the field: up adds a step, down takes |
| **Range edge** | the value equal to `min` or `max`, when that bound is set              |

### What it is called in the interface

The arrows carry kit labels as their accessible names: «Увеличить» and «Уменьшить» in Russian,
«Increase» and «Decrease» in English.

## Rules

- **The field shows two arrows at its right edge, after the clear button.** The up arrow adds a
  step, the down arrow subtracts one.

- **The step is set by an input and is one by default.** A step of 0,5 moves 2 to 2,5.

- **The Up and Down keys in the field do what the arrows do.** The caret does not jump to the start
  or the end of the text.

- **A step from an empty field starts from zero.** The result is then held inside the range.

- **The result of a step is held inside `min` and `max`.** A step past a bound lands on the bound.

- **The arrow towards a reached range edge is disabled.** On `max` the up arrow and the Up key do
  nothing; on `min` the down arrow and the Down key do nothing. The other arrow works.

- **The result is rounded to the digits of the step and of the field.** 0,1 plus 0,2 gives 0,3.

- **Each step gives the value out at once.** The form sees the new value without leaving the field.

- **The arrows are switched off by the `stepper` input and are shown by default.** A field without
  arrows still reacts to the keys.

- **A disabled field disables both arrows.** The keys do nothing there either.

- **A read-only field shows no arrows.** It shows the value as text.

- **The two arrows are one glyph, the lower one turned over.** The kit's up and down chevrons are
  drawn differently and read as arrows of two sizes at 12 px.

- **The small field has smaller arrows, and no field grows for them.** In `sm` the column is 16×24
  with a 10 px glyph, in `md` and `lg` it is 20×32 with a 12 px glyph.

- **The arrows take no Tab stop.** The keyboard path is the Up and Down keys in the field itself.

## What is out of scope

- Repeating the step while a mouse button is held.
- Changing the value by the mouse wheel.

## Contract

The field gets two inputs: `step` — a number, one by default, and `stepper` — a boolean, on by
default. The other inputs and the value the form gets do not change.

### Refusal codes

Not applicable: the component requests nothing and refuses nothing.

## Data

Not applicable: the field draws what the form gives it and stores nothing.

## Screens and states

The mockup is the stepper set of the second kit file, node 6875:432, with the `Size=md` and
`Size=sm` variants, and the number field set 4652:2958. The states:

- hover on the up arrow and on the down arrow;
- the up arrow disabled on `max`, the down arrow disabled on `min`;
- a disabled field with both arrows disabled;
- a field without arrows;
- the small field with the smaller arrows;
- the same states in the dark theme and under the material preset.

## Cross-cutting requirements

### Locales

The two arrow names are kit labels and are translated like every kit label.

### SEO

Not applicable: a library component.

### Mobile layout

Unchanged: the arrows take the right edge of the field, and the field keeps its height in every size.

### Several objects

Not applicable.

## Decisions

- **The down arrow is the up glyph turned over.** The owner's word: «как на макете должно быть ,
  разбирайся». The kit's down chevron is lopsided at 12 px, and the mockup draws one glyph.
- **The small field gets smaller arrows.** The owner's word: «по стрелочкам для инпута маленького
  размера стрелочки нужны меньшего размера». The mockup got the `Size=sm` variant.

## Open questions

None.

## History of changes

- 3 November 2026 — the agreement is written before the code.
- 3 November 2026 — one glyph for both arrows and smaller arrows in the small field.
- 3 November 2026 — the agreement is rolled out and merges into the description of the second kit.
  Task RT-2890.
