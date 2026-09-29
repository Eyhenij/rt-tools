# One rounding input for the second kit

**Status:** proposed · **Revision:** 2026-09-29 · **Scenario prefix:** `SC-UKV`
**Depends on:** `docs/specs/ui-kit-v2/tokens` (the scale of steps and the component's own properties),
`docs/specs/ui-kit-v2/tag` (the tag's shape gives way to the input)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A product agreement written before the code. It merges into the spec of the second kit as a
subdomain by the last commit of the PR, with the same scenario numbers.

## Why

The kit has one scale of rounding steps, and every component already routes its corners through a
property of its own. But an application cannot give a component a step of that scale. Four
components answer with four different inputs of different values, two of them off the scale, and
the rest take nothing. A consumer who needs a square card or a fully rounded input overrides a
property by name, and every name is different. The mockup gives every component a rounding of its
own and lets any instance take any step: the kit promises the same by one input.

## Terminology

| Term               | What it is                                                                      |
| ------------------ | ------------------------------------------------------------------------------- |
| The scale          | The nine steps of rounding: none, xs, sm, ms, md, lg, xl, 2xl, full             |
| The step           | One value of the scale, named by its key                                        |
| The rounding input | The input `radius` of a component; it takes a step or nothing                   |
| The own default    | The step a component has when the input is empty; it differs between components |
| The surface        | The box of a component whose corners are drawn: a button, a field, a card       |
| The own property   | The custom property `--rt-<block>-radius` the surface takes its corners from    |

### What it is called in the interface

| In the domain   | On the screen                                              |
| --------------- | ---------------------------------------------------------- |
| The step        | how rounded the corners are: square, slightly, fully round |
| The own default | the corners a component has when nobody asked for others   |

## Rules

- **The scale is one, and the step type names all nine steps.** A component that takes a part of
  the scale leaves the consumer without the step the mockup draws, and the next component takes a
  different part.
- **Every component with a surface takes the rounding by one input named `radius`.** One name and
  one type across the kit: a consumer who learnt it on a button uses it on a card without reading.
- **An empty input keeps the component's own default, and the default is the one of the mockup.**
  The input changes nothing until it is given: an application that never names it sees the kit as
  it was drawn.
- **The step reaches the component by an attribute on its host, not by an inherited property.** A
  custom property inherits into every nested component: a rounded card would round every button in
  it. The attribute is read only by the rules of its own host.
- **The rule of a step reassigns the component's own property and nothing else.** The surface keeps
  taking its corners from the own property, so a consumer's override of that property still wins
  over the kit, and a state rule of the component still stands where it stood.
- **A component whose surface lives in several parts gives the step to its main surface.** Inner
  parts — a badge, a dot, a focus ring — keep their own rounding: they are separate parts in the
  mockup, and a step for the whole box does not fit a dot.
- **No rounding of a component stands off the scale.** A literal like `999px` or `12px` in a place
  of a step looks right on one screen and diverges from the neighbour that took the step.
- **The old shape inputs are gone, and their values map onto the steps.** The tag's `shape` and
  `radius`, the icon button's `shape`, the button's `rounded` and the skeleton's `borderRadius` are
  replaced by `radius`. Two ways to set one thing is what the kit complained about.
- **The skeleton keeps its geometry apart from the corners.** Its `shape` says circle, square or
  rectangle — the proportions of the box, not only its corners — and stays.
- **The kit setting of the button's roundness names a step.** An application that set the button
  round once for all of them names the step `full` instead of a flag.

## What is out of scope

- **The rounding of overlay panels.** A select panel, a menu, a tooltip and a dropdown are separate
  parts in the mockup with rounding of their own; the input of the field does not reach them.
- **The material look.** It keeps its own control rounding; that look is drawn apart.
- **The shared style layer.** Forms, the sign-in screen and the scrollbar are not components and
  take no input.
- **The first kit.**

## Contract

Not applicable: the surface of the subdomain is an input of the kit's components, it serves no
procedures.

### Refusal codes

Not applicable: a step outside the type is refused by the compiler, not at run time.

## Data

| The step | The token          | The value |
| -------- | ------------------ | --------- |
| none     | `--rt-radius-none` | 0         |
| xs       | `--rt-radius-xs`   | 2px       |
| sm       | `--rt-radius-sm`   | 4px       |
| ms       | `--rt-radius-ms`   | 6px       |
| md       | `--rt-radius-md`   | 8px       |
| lg       | `--rt-radius-lg`   | 10px      |
| xl       | `--rt-radius-xl`   | 15px      |
| 2xl      | `--rt-radius-2xl`  | 20px      |
| full     | `--rt-radius-full` | 9999px    |

The old values map so:

| The old input                          | The step                     |
| -------------------------------------- | ---------------------------- |
| tag `shape="pill"`                     | `full`                       |
| tag `shape="square"`                   | `sm`                         |
| tag `radius` none/sm/md/lg/full        | the step of the same name    |
| icon button `shape="square"`           | `md`                         |
| icon button `shape="circle"`           | `full`                       |
| icon button `rounded-sm`, `rounded-lg` | the nearest step: `lg`, `xl` |
| button `rounded`                       | `full`                       |
| skeleton `borderRadius` xs/sm          | the step of the same name    |
| skeleton `borderRadius` md             | `ms` (it was 6px)            |
| skeleton `borderRadius` lg             | `lg`                         |
| skeleton `borderRadius` xl             | `full` (it was 999px)        |

## Screens and states

| The state                               | What is visible                                          |
| --------------------------------------- | -------------------------------------------------------- |
| the input is empty                      | the corners of the mockup for that component             |
| a step is named                         | the corners of that step, the rest of the look unchanged |
| a step on a nested parent               | the child keeps its own corners                          |
| the consumer overrides the own property | the consumer's corners, whatever the step says           |

## Cross-cutting requirements

### Locales

Not applicable: the input carries no text.

### SEO

Not applicable: the kit stands in applications behind an entry.

### Mobile layout

Not applicable: the step is the same on every width; a narrow screen changes the layout, not the
corners.

### Several objects

Not applicable: the kit knows nothing of the owner of the data.

## Decisions

- **The step is an attribute of the host rather than a class modifier of the block.** The argument:
  one host directive gives the attribute to every component the same way, while a modifier would be
  written in every template. Rejected: a modifier class per step — nine classes in every template.
- **The old inputs are removed rather than kept as aliases.** The argument: the package is 0.x, and
  an alias keeps the two ways the task was started against. Rejected: a period of both inputs — it
  needs a rule which one wins, the very rule the tag already had and the consumer had to learn.

## Open questions

The subdomain has no open questions.

## History of changes

- 2026-09-29 — the agreement was written for RT-2371: the kit had one scale and no way to give a
  component a step of it.
