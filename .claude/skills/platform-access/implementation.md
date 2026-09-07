# platform-access — how it is arranged here

The names of this tree, next to the rule `SKILL.md` beside it. A file of its own because the rule
speaks by technique and travels between repositories whole, while everything below is true only
here and goes stale at every rename.

For a library this rule is stricter than for an application: the kit code runs both where the page
is served by a server and in the spec environment without a browser — and in foreign trees, where
there is nobody to fix what broke.

## What it is called here

- **In the rule** — Here
- **the window** — the injection token `WINDOW` from `@rt-tools/core`
- **the browser information** — the token `NAVIGATOR` from the same place
- **the document** — `DOCUMENT` of the framework
- **the environment sign** — `PlatformService.isPlatformBrowser`
- **browser storage** — the storage services of the base: local, session, in memory, in the browser database
- **a layout observer** — `ResizeObserver` and the like — taken from the global scope, not from the window interface

## Where it lives

- **the window token** — `projects/core/src/lib/tokens/window.token.ts`
- **the browser information token** — `projects/core/src/lib/tokens/navigator.token.ts`
- **the environment sign** — `projects/core/src/lib/services/platform.service.ts`
- **the device parsing** — `projects/core/src/lib/services/device-detector.service.ts`
- **the storage services** — `projects/core/src/lib/storage/`, `projects/core/src/lib/idb-storage/`
- **a sample of work under the environment check** — `projects/ui-kit/src/lib/ui-kit/theme/rtui-theme.service.ts`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section «How the law applies
here» (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **The global object comes by the `WINDOW` token, not taken directly.** — `projects/core/src/lib/tokens/window.token.ts:WINDOW` — the factory raises the document view and throws a refusal if there is none; the browser information comes the same way.
- **The environment is checked through `PlatformService`, not through `typeof window`.** — `projects/core/src/lib/services/platform.service.ts:PlatformService` — eight places of the tree go through it; there are no «is there a window» checks in the tree.
- **A direct call to the global object is refused by the linter.** — **Not carried out.** There is no linter rule against a direct call in the config: the role of the list is played by the tokens themselves and the environment service, and a new call is caught by review.

## What else is worth knowing when reading the code

- The window token factory refuses when the document has no view. So a service obliged to work
  without markup too takes the window inside a method under the environment check, not as a class
  field.
- Around the storage services no environment check is needed: outside the browser they fall back
  to memory by themselves.
- Pure functions have no injection — the window is accepted as a parameter, and the caller injects
  it.
- The spec environment is not a browser: there is nothing to measure the window width with, and
  components that rebuild by it take a substituted breakpoints service (the rule `testing`).

## What this is checked by

- `pnpm exec nx lint @rt-tools/<package>` — the common set; there is no separate rule against a
  direct call to the global object here.
- `pnpm exec nx test @rt-tools/core` — the storage and device-parsing specs run in an environment
  without a browser: a direct call falls exactly there.
