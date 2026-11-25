---
name: entity-models
kind: rule
law: entity-models
description: Rule under the entity-models law. Load when declaring or editing a record model and its mapper, when editing shared models and when editing the contract description. Names the model namespace and its levels. Pattern entity-models-new.
---
<!-- rt-kit v0.40.0 · rules/entity-models.md · 8eb21fcece12 · правится надстройкой, не здесь -->

# Entity models — how it works here

Rule under the law `docs/constitution/entity-models.md`. Cold part: `pitfalls.md`. Where it lives: the
table in `implementation.md` next to it.

## What it is called here

| In the law           | Here                                                                |
| -------------------- | ------------------------------------------------------------------- |
| the contract side    | `Api` — an alias of the generated type from `@<scope>/common/proto` |
| what the screen uses | `State`, all fields `readonly`                                      |
| what goes to a write | `Draft`                                                             |
| the short level      | the nested namespace `Short` with its own `Api` and `State`         |
| translation          | a mapper inheriting `BaseMapper`, one per level                     |

No entity has levels yet — debts `Q-M-1`, `Q-M-2`; a new entity gets them from the start. An edit
of `.proto` is checked by nothing: `buf` is outside the checks and the pipeline.

## How the law applies here

- **An entity has two sides, and both lie in the namespace `I<Entity>`.** `Api` repeats the
  contract, `State` is normalised and does not depend on a contract change.
- **The contract side is not written by hand — it is declared as an alias.** A hand-written copy
  diverges from the contract silently.
- **A mapper inheriting `BaseMapper` stands between the sides, and screens read only `State`.** A
  contract type does not get into the template.
- **Empty is expressed by an empty string or zero, not by a missing field.** The contract has no
  optional scalars, so a scalar's empty is its default. No `null` or `undefined` in `State`; the
  meaning of zero is a comment next to the field.
- **A cast goes through `this.typeCast`, not through `??`.** The contract returns defaults, not
  emptiness: `??` and `undefined` checks never fire here.
- **The page, order and filter types are taken from `@rt-tools/utils`.** `rt-pagination` takes
  `IPageModel` from there; no second set of these types exists.

## Patterns

- `entity-models-new` — declare a model and a mapper: the namespace, the levels, `typeCast`,
  contract regeneration.
