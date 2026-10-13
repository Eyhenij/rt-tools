# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already has

- The root manifest held `vitest`, `@vitest/coverage-v8` and `@vitest/ui` 4.1.11.
- 93 projects run Vitest: the receiver and its admin panel libraries, the shared library, the
  chat widgets, the auth example API and the tree's own lint rules. The Angular libraries run it
  through `@analogjs/vitest-angular` 2.8.0.
- Vitest 5 accepts Vite 6.4 to 8 and Node 22.12 or later; its peer ranges are accepted by
  `@nx/vitest` 23.3.0 and `@analogjs/vitest-angular` 2.8.0.

## Decisions

- **5.0.3 for all three packages:** 5.0.4 came out on 2026-10-12 and was younger than a day.
- **No config or spec edits:** the full run passed on Vitest 5 as it was — 96 runs, 1201 tests.
