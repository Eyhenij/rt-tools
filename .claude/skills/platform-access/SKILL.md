---
name: platform-access
kind: rule
law: frontend-application
description: Rule under the frontend-application law. Load when an edit touches the global object or the runtime — window, globalThis, PLATFORM_ID, localStorage. Names the DI tokens and the pitfalls of server-side page rendering. Does not apply under libs/api and apps/api. Pattern platform-access-di.
---
<!-- rt-kit v0.38.0 · rules/platform-access.md · 60423ec040e1 · правится надстройкой, не здесь -->

# Browser environment — how it works here

Rule under the law `docs/constitution/frontend-application.md`. Cold part: `pitfalls.md`; where it
lives — `implementation.md`. Not for `libs/api/**` and `apps/api/**`: NestJS. Same law: state, file,
styles, server layer — `angular-patterns`, `component-structure`, `styling-bem`, `api-layer`.

## What it is called here

| Direct call | Here |
| --- | --- |
| `globalThis.open(...)`, `window.open()` | `inject(WINDOW).open(...)` |
| `globalThis.crypto.randomUUID()` | `inject(WINDOW).crypto.randomUUID()` |
| `isPlatformBrowser(inject(PLATFORM_ID))` | `inject(PlatformService).isPlatformBrowser` |
| `document.defaultView` | `inject(WINDOW)` |
| direct `document` | `inject(DOCUMENT)` from `@angular/common` — as before |
| DOM initialisation after rendering | `afterNextRender()` |

`WINDOW`, `PlatformService` and `StorageService` come from `@rt-tools/core`.

## How the law applies here

- **The global object comes by the `WINDOW` token, not taken directly.** Cast it to `Window & typeof
  globalThis`; DI-less `*.logic.ts` and `*.util.ts` take it as a parameter.
- **The environment is checked through `PlatformService`, not through `typeof window`.** Storage
  needs none: `StorageService` falls back to memory.
- **A direct call to the global object is refused by the linter.** Sixteen names on front-end trees;
  deliberate places are listed in the config, never disabled per line. Banned by name, not path:
  `this.#document.defaultView` passes; only reading tells it from a bypass.

## What of the law is not here

Direct access stays in three places: the theme script in `index.html`, the startup handler in
`main.ts`, `page.evaluate` in end-to-end specs. A new one needs the owner's word.

## Pitfalls

- **The `WINDOW` factory throws if the document has no `defaultView`.** `Window is not
  available`. SSR has one: a root service's field inject is safe; else take it in a method under an
  environment check.
- **A service created at startup that gains `WINDOW` is checked on a running SSR server too.**
- **An end-to-end spec does not prepare state by writing to storage.** It walks the user's steps.

## Patterns

- `platform-access-di` — ready-made injects and checks.
