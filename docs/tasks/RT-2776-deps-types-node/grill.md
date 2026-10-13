# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already has

- The root manifest holds `@types/node` 24.13.4. The last published versions per major line are
  22.20.5, 24.19.2, 25.9.9 and 26.6.5.
- The tree runs on Node 22: `.nvmrc` holds 22.22.3, every pipeline sets up 22.22.3, and the root
  manifest declares `"node": ">=22.22.3"`.
- The types already describe a newer runtime than the one the tree runs on: 24 against 22. A
  higher line describes still more of an API Node 22 does not have, and the build accepts a call
  that fails at run time.
- Vitest 5 accepts `@types/node` `^22.0.0 || >=24.0.0`.

## Decisions

- **The upper bound is the runtime, not the registry:** the types line follows the Node line the
  tree runs on. Raising to 26 is not done while the tree runs on Node 22.
- **The 24 line takes its last release, 24.19.2:** the owner asked for the latest, and inside the
  line already installed that changes no runtime promise. Rejected: moving down to the 22 line —
  that is a correction of its own, not a raise, and the epic does not take it.
