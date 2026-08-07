---
name: rt-tools-component
description: Author or edit an Angular component in this kit — rtui- selector, signal-only API (input/output/viewChild), OnPush, grouped imports, BEM template directives, RT_UI_CONFIG defaults. Use when creating a new component, editing any *.component.ts / *.component.html, adding an input/output, or wiring a component into the kit's config and theming.
---

# Component authoring

Every shipped component lives in `projects/ui-kit/src/lib/ui-kit/<feature>/` as a
co-located triple `rtui-<name>.component.{ts,html,scss}`, exported through the
feature's `public-api.ts`.

Reference implementation: `projects/ui-kit/src/lib/ui-kit/buttons/unified-button/rtui-button.component.ts`.

## Golden rule

Signals only. There are **zero** `@Output` and **zero** `@ViewChild` in
`projects/`; the 6 remaining `@Input()`s live in the BEM directives
(`projects/core/src/lib/bem/block.directive.ts`, `elem.directive.ts`) and one
story wrapper. Do not add new ones.

## Decorator shape

```typescript
@Component({
    selector: 'rtui-button',
    templateUrl: './rtui-button.component.html',
    styleUrl: './rtui-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        NgTemplateOutlet,

        // rt-tools
        BlockDirective,
        ElemDirective,
        ModDirective,

        // components
        RtuiIconComponent,

        // material
        MatButton,
        MatRipple,
    ],
})
```

- `selector` is `rtui-<name>` (the Nx `prefix` for the library is `rt`).
- `styleUrl` singular, never `styleUrls`.
- `OnPush` on every component. `@angular-eslint/prefer-on-push-component-change-detection`
  is only a `warn` because 3 legacy components predate it — new code has no excuse.
- Во втором ките (`projects/ui-kit-v2/`, префикс `rt-`) у каждого компонента ещё и
  `encapsulation: ViewEncapsulation.None` — кит целиком на одной инкапсуляции, и
  стили там пишутся по классу блока, а `:host` запрещён (см. `rt-tools-styling`).
- `imports` are grouped with the `// angular` / `// rt-tools` / `// components` /
  `// directives` / `// material` comments.
- Cross-package imports go through `@rt-tools/core|store|utils`, never relative paths.

## Class members

Explicit types on **every** field — `@typescript-eslint/typedef` and
`explicit-member-accessibility` are `error`:

```typescript
readonly #config: IRtUiConfig.Config = inject(RT_UI_CONFIG);

protected readonly resolvedSize: Signal<IRtuiButton.Size> = computed(() => this.size() ?? this.#buttonConfig?.size ?? 'md');

public readonly type: InputSignal<IRtuiButton.Type> = input<IRtuiButton.Type>('icon');
public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
});
public readonly clicked: OutputEmitterRef<void> = output<void>();
```

- Order: `#` private fields → `protected` → `public` (inputs/outputs) →
  constructor → public → protected → private methods (`member-ordering`).
- `inject()` over constructor DI (60 `inject(` calls vs 1 component constructor).
- `#` for privates (167 uses) — the `private` keyword survives in ~10 legacy spots only.
- Boolean inputs take `transform: booleanAttribute`; string inputs take
  `transform: transformStringInput` from `@rt-tools/utils`.
- Group a component's public type unions in a namespace beside the class
  (`export namespace IRtuiButton { export type Size = 'xs' | 'sm' | 'md' | 'lg'; }`) —
  `@typescript-eslint/no-namespace` is off deliberately.

## Config-driven defaults

Components with themable defaults resolve them in this order — **instance input →
`components.<name>` → `global` → library default** — via `RT_UI_CONFIG`
(`projects/ui-kit/src/lib/ui-kit/config/`):

```typescript
protected readonly resolvedDesign: Signal<RtUiDesign> = computed(
    () => this.design() ?? this.#buttonConfig?.design ?? this.#config.global?.design ?? 'custom'
);
```

Never read config in a field initializer that a consumer could override — resolve
it in a `computed()`.

## Templates

- BEM via directives only: `rtBlock` / `rtElem` / `[rtMod]` from `@rt-tools/core`.
  `rt/require-bem-directives` (warn) rejects `class="…"`, `[class.x]`, `[ngClass]`;
  the only escape hatch in `[class]` is `… | concatClasses`, and raw classes are
  tolerated today solely for the Material bridge (`class="rtui-button-material"`).
- **Using `rtMod` obliges you to put `ModDirective` in `imports`** —
  `rt/require-mod-directive-import` is `error`. Without it the directive is
  tree-shaken and modifiers silently vanish in prod (13 components had this bug).
- Build the modifier record in a `computed()` and bind it once:
  `[rtMod]="modifiers()"` where `modifiers()` returns `{ 'size-md': true, loading: … }`.
- Control flow is `@if` / `@for` / `@switch`. Template cyclomatic complexity max is 25.
- **Never repeat `<ng-content />` across `@if` branches** — projected nodes bind to
  the first slot only. Declare it once in an `<ng-template #projectedContent>` and
  render it with `[ngTemplateOutlet]` per branch (see `rtui-button.component.html`).
- Alias Material behaviour with `hostDirectives` instead of re-declaring inputs:

    ```typescript
    hostDirectives: [{ directive: MatTooltip, inputs: ['matTooltip: tooltip', 'matTooltipPosition: tooltipPosition'] }],
    ```

## Host class

Current reality: components use a string-literal `host: { class: 'rtui-icon' }`
(`icon`, `modal`, `aside`) or a bound state class
(`'[class.rtui-button-full]': 'fullWidth()'`), and many declare no host class at
all. `rt/require-host-bem-block` (which wants a local `const BEM_BLOCK`) is
deliberately at `warn` pending a convention decision — match the neighbouring
component, do not mass-migrate to silence the warning.

## Before you finish

```bash
pnpm exec nx lint @rt-tools/ui-kit
pnpm exec nx test @rt-tools/ui-kit --testFile=<spec>
```

New public component → wire its barrel (see the **rt-tools-public-api** skill),
add a story (**rt-tools-storybook**), and style it with tier-3 tokens
(**rt-tools-styling**).
