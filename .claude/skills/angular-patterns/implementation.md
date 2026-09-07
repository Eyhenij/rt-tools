# angular-patterns — how it is arranged here

The names of this tree, next to the rule `SKILL.md` beside it. A file of its own because the rule
speaks by technique and travels between repositories whole, while everything below is true only
here and goes stale at every rename.

There is no frontend application here: the tree publishes libraries, and a «screen» for it is the
showcase and a spec. Everything the rule says about state and streams holds exactly the same, but
the owner of a subscription turns out to be a kit component or service, not a page.

The only application of the tree — the cargo intake — is on NestJS, and this rule does not apply to
it at all: there is no signal API and no `inject()` there, and the dependencies arrive by the
constructor.

## What it is called here

- **In the rule** — Here
- **a reactive value** — `signal()`, and for inputs and outputs `input()`, `output()`, `model()`
- **a derived value** — `computed()`
- **an action source** — a field with the suffix `Source`: `#refreshSource = new Subject<void>()`
- **quenching a subscription** — `takeUntilDestroyed()` in the pipe before `.subscribe()`
- **cleanup on destruction** — `inject(DestroyRef).onDestroy(...)`, not a lifecycle method
- **the shared store base** — `BaseStoreService` and `BaseAsyncStoreService` from `@rt-tools/store`
- **the store message bus** — `dispatch(...)` and `onDispatch(...)` of the same base

## Where it lives

- **the store bases** — `projects/store/src/lib/base-store.service.ts` and `base-async-store.service.ts`
- **the source suffix rule** — `tools/eslint-rules/rules/require-source-suffix-for-subjects.ts`
- **the subscription quenching rule** — `tools/eslint-rules/rules/require-take-until-destroyed.ts`
- **the kit services that outlive a screen** — `projects/ui-kit-v2/src/lib/platform/` — the theme, the breakpoints, the notification bus

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section «How the law applies
here» (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **A subscription is declared once, not in the action method.** — **Not checked.** There is no linter rule of its own against a subscription in a method here. Long-lived subscriptions are declared at the creation of the owner — `projects/ui-kit-v2/src/lib/platform/theme.service.ts`.
- **A subscription dies with its owner.** — `tools/eslint-rules/rules/require-take-until-destroyed.ts:RULE_NAME` — a refusal on any `.subscribe()` without a terminating operator in the pipe; 0 violations in the tree, and the single deviation is signed by a comment at the Redux DevTools handle.
- **An action source carries the suffix `Source` in its name.** — `tools/eslint-rules/rules/require-source-suffix-for-subjects.ts:REQUIRED_SUFFIX` — a refusal on a source field without the suffix; an observable raised from it through `asObservable()` does not carry the suffix.
- **A service call inside `computed` does not become a dependency.** — **Not checked.** Neither the build nor the linter sees a method call inside a derived value: the value stays as it was at the moment of the first computation. It is held by review.
- **A list store inherits the shared base.** — `projects/store/src/lib/base-store.service.ts:BaseStoreService` and `base-async-store.service.ts` next to it — the records, the loading state, updating a part of the state and the message bus are already there.

## What else is worth knowing when reading the code

- A derived value is declared as computed, not as an effect: an effect that puts a value into a
  reactive field lags behind the source, and that is not noticed at once.
- There are no getters in components here — a recomputation on every redraw whose cost is visible
  nowhere in the code.
- Both stream rules do not look at spec files: in `eslint.config.mjs` the tree own rules are
  declared with an exception for `**/*.spec.ts`, the showcase and the demos.
- The spec stand is zoneless, so a redraw in a spec is moved explicitly —
  `fixture.detectChanges()`, and for content in an overlay also `ApplicationRef.tick()`.

## What this is checked by

- `pnpm exec nx lint @rt-tools/<package>` — both stream rules and the rest of the set.
- `pnpm exec nx test @rt-tools/store` — the specs of the store bases: the state, the bus, updating
  a part of the state.
