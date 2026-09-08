# The look of a field of input in the setting of the kit

**Status:** in force · **Revision:** 31 August 2026 · **Scenario prefix:** `SC-UK`
**Depends on:** none
**Laws:** `frontend-application`
**Procedures:** none

The subdomain names where the components of the kit take the look of a field of input from and in which
order the values are overridden.

## Why

The look of a field of input was sewn in as the default of an input in two places. An application needing
another look passed it by an input at every use — and the selectors have five uses, counting the nested
ones. A missed one differs from the rest by the look of the field, and that is noticeable only by the eyes
on the assembled screen.

The setting of the kit at that already exists, and the order of the resolving is declared in it. The look
of a field was not in that order at all.

## Terminology

| Term                       | What it is                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| the look of a field        | the design of a field of input: with a filling or with an outline                                        |
| the order of the resolving | what overrides what: the input, the section of the component, the common section, the default of the kit |

### What it is called in the interface

Not applicable: the setting is not visible on the screen, what is visible is its work on the fields.

## Rules

- **The look of a field is resolved by the same order as the rest of the defaults of the kit.** A second
  order for one and the same question would diverge from the first at the first edit.
- **The default of the input is emptiness, and the former value stands at the end of the chain.** A value
  left as the default of the input wins over the setting always: the input is set, and the chain ends at it
  — the setting does not work once and looks broken.
- **The resolved value is counted once, and the templates read it.** A chain repeated in every template
  diverges from the setting at the very first place they forgot to look into.
- **A nested component gets an already resolved value, it does not resolve it anew.** Otherwise it comes out
  with a chain of its own, and the look of a field inside a popup window differs from the look of a field
  under it.

## What is out of scope

- The look of the fields of the second kit: it has a setting of its own and fields of its own.
- The other properties of a field — the density, the size of the label: they are not created in the setting
  until they are asked for.

## Contract

Not applicable: the surface is the section of the setting and the inputs of the components, the subdomain
serves no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| State                               | What is visible                                           |
| ----------------------------------- | --------------------------------------------------------- |
| there is no setting                 | the fields with a filling — the former default of the kit |
| the section of the component is set | the fields of the look named in the section               |
| the input is set at the place       | the field of the look named by the input                  |

## Cross-cutting requirements

### Locales

Not applicable.

### SEO

Not applicable.

### Mobile layout

Nothing of its own.

### Several objects

Not applicable.

## Decisions

- **The look of a field entered the existing order of the resolving** — it is already written at the button
  and is repeated here one to one. Rejected: a sign of the injection of its own under the look of a field.
- **The default of the input became emptiness** — otherwise the setting does not work once. Rejected: to
  leave `'fill'` as the default of the input and to read the setting only at an empty value passed from
  outside — that is the same thing but expressed unopenly.

## Open questions

- `Q-6` — whether the rest of the fields of the kit need the same section. The work goes with the assumption
  that the section is created by the name of the component and the next one will add its own name without
  touching this one.

## History of changes

- 31 August 2026 — the subdomain was created: the look of a field in the setting of the kit.
