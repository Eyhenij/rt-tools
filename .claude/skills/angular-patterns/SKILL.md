---
name: angular-patterns
kind: rule
law: frontend-application
description: Rule under the frontend-application law. Load when editing any Angular class — a component, store, service, directive, pipe, guard or interceptor. Names the signal input API, OnPush, zoneless, inject and where a subscription lives. Pattern angular-patterns-state.
---
<!-- rt-kit v0.37.1 · rules/angular-patterns.md · 88a386d6a018 · правится надстройкой, не здесь -->

# Screen reactivity — how it works here

Rule under the law `docs/constitution/frontend-application.md`. Cold part: `pitfalls.md` — the whole
text, every section and article with its reasons.

## How the law applies here

- **A subscription is declared once, not in the action method.**
- **A subscription dies with its owner.**
- **An action source carries the suffix `Source` in its name.**
- **A service call inside `computed` does not become a dependency.**
- **A list store inherits the shared base.**

## Pitfalls

- **A derived value is computed with `computed`, not with an effect.**
- **There are no getters in components.**
- **A static attribute without a value sets the input to an empty string, not to the default.**
- **A subscription on every method call gives no way to choose what to do with the previous
  request.**

## Names and techniques

- Every component is `OnPush`; inputs and outputs are `input()`, `output()`, `viewChild()`.
- Subscribe in the constructor, `ngOnInit` or a field initializer, with a `*Map` operator.
- End a subscription with `takeUntilDestroyed(this.#destroyRef)` in the same stream.
- Inside `computed`, read the service's signal, not its method.
- Not for `libs/api/**` and `apps/api/**`: NestJS.
- An input with a meaningful default coerces `''` back by `transform` or in `computed`.
- DOM setup after the first render is `afterNextRender()`, not `ngAfterViewInit`.
- `viewChild` cannot be a `#` field; declare it `protected`.
