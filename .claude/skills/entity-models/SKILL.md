---
name: entity-models
kind: rule
law: entity-models
description: Rule under the entity-models law. Load when declaring or editing a record model and its mapper, when editing shared models and when editing the contract description. Names the model namespace and its levels. Pattern entity-models-new.
---
<!-- rt-kit v0.37.0 · rules/entity-models.md · 81396a26982f · правится надстройкой, не здесь -->

# Entity models — how it works here

Rule under the law `docs/constitution/entity-models.md`. Cold part: `pitfalls.md`. Where it lives: the
table in `implementation.md` next to it.

## How the law applies here

- **An entity has two sides, and both lie in the namespace `I<Entity>`.** `Api` repeats the
  contract, `State` is normalised.
- **The contract side is not written by hand — it is declared as an alias.**
- **A mapper inheriting `BaseMapper` stands between the sides, and screens read only `State`.**
- **Empty is expressed by an empty string or zero, not by a missing field.** No `null` or
  `undefined` in `State`; the meaning of zero is a comment next to the field.
- **A cast goes through `this.typeCast`, not through `??`.**
- **The page, order and filter types are taken from `@rt-tools/utils`.** `rt-pagination` takes
  `IPageModel` from there.

## Patterns

- `entity-models-new` — declare a model and a mapper: the namespace, the levels, `typeCast`,
  contract regeneration.
