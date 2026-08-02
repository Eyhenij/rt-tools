---
name: rt-tools-typescript
description: TypeScript conventions enforced across this repo — mandatory explicit types and member accessibility, member ordering, # private fields, the Source suffix for Subjects, and terminated subscriptions. Use when writing or editing any *.ts (service, directive, pipe, store, function, token) before running lint.
---

# TypeScript conventions

Every rule below is enforced at `error` by `eslint.config.cjs` or the workspace
plugin in `tools/lint-rules/`. Toolchain: TypeScript 6, Angular 22, `strict`

- `noPropertyAccessFromIndexSignature`, target ES2022, `useDefineForClassFields: false`.

## Golden rule

Nothing is implicit. `@typescript-eslint/typedef` demands a type annotation on
parameters, arrow parameters, property declarations, variable declarations,
member variables and array destructuring;
`@typescript-eslint/explicit-function-return-type` and
`explicit-member-accessibility` (constructors: `no-public`) complete the set.

```typescript
readonly #devToolsManager: DevToolsManagerService | null = inject(DevToolsManagerService, { optional: true });

public patchState(callbackFn: (state: STATE_TYPE) => STATE_TYPE, actionName?: string): void {
    this.#store.update((currState: STATE_TYPE): STATE_TYPE => callbackFn(currState));
}
```

Yes, this means annotating locals you would normally infer
(`const fixture: ComponentFixture<X> = TestBed.createComponent(X);`).

## Privacy and ordering

- **`#` private fields**, not the `private` keyword — 167 uses vs ~10 legacy spots.
- `@typescript-eslint/member-ordering` fixes the layout: private fields →
  protected fields → public fields → signature → constructors → public methods →
  static/abstract → protected methods → private methods.
- `readonly` on anything not reassigned.

## RxJS

Two workspace rules, both `error`, both currently at 0 violations — keep it that way:

- **`rt/require-source-suffix-for-subjects`** — a class field initialized with
  `new Subject()` / `BehaviorSubject` / `ReplaySubject` / `AsyncSubject` must end in
  `Source`. The writable source is `#refreshSource`; the public read-only
  `asObservable()` view carries no suffix.
- **`rt/require-take-until-destroyed`** — every `.subscribe()` must sit after a
  `.pipe()` containing a terminating operator: `takeUntilDestroyed`, `takeUntil`,
  `take`, `first`, `last`, `toPromise`, `firstValueFrom`, `lastValueFrom`. A
  genuinely non-RxJS `.subscribe()` (e.g. the Redux DevTools handle) takes an
  explicit disable comment — that is the only precedent for opting out.

## State

Signal stores extend `BaseStoreService` / `BaseAsyncStoreService`
(`projects/store/src/lib/`): a `WritableSignal` behind `store.asReadonly()`, a
`MessageBus`-backed `dispatch`/`onDispatch`, and `patchState(fn)`. Cleanup hangs
off `inject(DestroyRef).onDestroy(...)`, not `ngOnDestroy`.

## Naming and shape

- Interfaces `I`-prefixed (`IAction`, `IRtUiConfig`, `IModsObject`); enum-like
  consts as `*_ENUM` in `*.type.enum.ts` (`TOGGLE_SIZE_TYPE_ENUM`).
- `export namespace` is the sanctioned way to group a feature's public types —
  `@typescript-eslint/no-namespace` is off on purpose
  (`IRtuiButton`, `IRtUiConfig`, `ITable`, `IModal`, `ISideMenu`, …).
- Files: `*.component.ts`, `*.directive.ts`, `*.pipe.ts`, `*.service.ts`,
  `*.interface.ts`, `*.types.ts`, `*.type.enum.ts`, `*.function.ts`, `*.spec.ts`.
- Cross-package imports use `@rt-tools/core|store|utils` (mapped in
  `tsconfig.base.json`), never relative paths across `projects/*`.

## Style

`no-console`, `no-debugger`, `no-var`, `no-bitwise`, `no-eval`, `prefer-const`,
`semi`, single quotes — all `error`. Prettier: 140 columns, 4-space tabs, single
quotes, `trailingComma: es5`, LF. Import order is
`@angular/*` → `rxjs` → `ng*` → third-party → relative, separated by blank lines
(`.prettierrc.json` `importOrder`).

Comments and JSDoc **are** used here — short doc blocks on non-obvious public API
and on the "why" of a workaround are the house style
(`rtui-button.component.ts`, `tools/lint-rules/*`).

## Verify

```bash
pnpm exec nx lint @rt-tools/<package>     # or: pnpm run lint
pnpm run check:affected                   # lint + test + build for touched packages
```

`lint-staged` runs `eslint --fix` + `prettier` on commit via husky.
