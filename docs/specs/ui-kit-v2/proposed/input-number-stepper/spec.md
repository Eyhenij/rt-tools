# Step arrows in the number field

**Status:** proposed · **Revision:** 3 November 2026 · **Scenario prefix:** `SC-UKV`
**Dependencies:** kit labels — the arrows are named by two kit labels; kit icons `chevron-up`, `chevron-down`
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

- **The arrows take no Tab stop.** The keyboard path is the Up and Down keys in the field itself.

## What is out of scope

- Repeating the step while a mouse button is held.
- Changing the value by the mouse wheel.
