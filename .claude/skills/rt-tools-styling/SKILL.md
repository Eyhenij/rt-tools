---
name: rt-tools-styling
description: Write or edit SCSS in this kit — BEM class shapes produced by rtBlock/rtElem/rtMod, the three-tier --rt-* design tokens, the per-component SCSS map that emits tier-3 vars, rem values, and the no-hardcoded-design-tokens stylelint rule. Use when touching any *.scss, adding a component style, recoloring something, or reaching for a hex value or a magic number.
---

# Styling

Component styles are BEM, scoped to `:host`, and consume CSS custom properties.
Nothing in `projects/ui-kit/src/lib/**` may hardcode a design value.

Reference: `projects/ui-kit/src/lib/ui-kit/toggle/rtui-toggle.component.scss`.
Token system docs: `projects/ui-kit/src/styles/TOKENS.md` (+ Storybook
`projects/ui-kit/docs/*.mdx`). Read TOKENS.md before inventing a token name.

## Golden rule

`stylelint` blocks hardcoded values in `projects/ui-kit/src/lib/**/*.scss`:
`color-no-hex: true` plus the workspace rule
`rt-tools/no-hardcoded-design-tokens` (`tools/stylelint-rules/no-hardcoded-design-tokens.cjs`).
Only `var(--rt-*)`, `var(--mat-*)`, `var(--mdc-*)` are accepted var prefixes;
colors, magic numbers in spacing/radius/font-size/border-width, SCSS color
functions and `$var` / `#{}` interpolation in token-aware properties are all
rejected. `calc/min/max/clamp`, `color-mix`, `0` and universal keywords pass.
Story/demo styles under `**/stories/**` (and the legacy `**/strories/**`) are
exempt — they are scaffolding, not shipped CSS.

## Token tiers

```
Tier 1  primitives   --rt-color-*                    styles/base/_tokens.scss
Tier 2  semantic     --rt-{bg,text,icon,border}-*    styles/base/_tokens.scss (light-dark())
Tier 3  component    --rt-<component>-<el>-<token>   per-component SCSS map
```

Light is the default; `.rt-dark` is the global switch, `data-rt-theme` scopes a
nested context, `.rt-theme-auto` follows the OS (`RtThemeService` /
`RtThemeDirective`). Semantic tokens are `var(--mat-sys-*, light-dark(…))`
fallback chains for the Material hybrid.

## Tier-3 pattern (how a component emits its vars)

Declare a SCSS map of `element → (property: value)`, emit it through
`mixins.generateCssVar`, then consume the vars in the rules:

```scss
@use '../../../styles/base/mixin' as mixins;

$toggle: (
    toggle-track: (
        background-color: var(--rt-control-track),
        border-radius: 2.5rem,
    ),
    label: (
        color: var(--rt-text-base-secondary),
        font-size: 0.875rem,
    ),
);

:host {
    @each $element, $elements in $toggle {
        @each $style-token, $value in $elements {
            #{mixins.generateCssVar('toggle', #{$element}, #{$style-token})}: #{$value};
        }
    }

    .rtui-toggle-container__label {
        color: var(--rt-toggle-label-color);
        font-size: var(--rt-toggle-label-font-size);
    }
}
```

`generateCssVar('toggle', 'label', 'color')` → `--rt-toggle-label-color`
(prefix from `$styles-prefix: 'rt'` in `styles/base/_variables.scss`).

Emission scope decides override semantics (TOKENS.md): vars emitted at `:root`
(global stylesheets, `ViewEncapsulation.None` components) are overridable from any
ancestor; vars emitted at `:host` sit on the element and beat inherited values, so
consumers need an element-targeted override. Prefer keeping a new themable var in
the tier-3 map rather than adding a new public size hook — the public tier-3 API
is only `--rt-<component>-*-{color,background-color,bg,shadow,indicator}` plus the
documented size hooks listed in TOKENS.md.

## Rules of thumb

- **rem, not px.** Component values are authored in rem (`0.875rem`, `2.5rem`).
  `mixins.rem(16)` converts against a 16px context if you have a px spec.
  Breakpoint `$device-*` variables in `_variables.scss` are the px exception.
- **BEM class shapes come from the directives**, not from hand-written strings:
  `rtBlock="rtui-toggle"` → `.rtui-toggle`, `rtElem="label"` → `.rtui-toggle__label`,
  `[rtMod]="{ sizeMd: true }"` → `.rtui-toggle--size--md`. Style those shapes;
  `selector-class-pattern` is disabled because BEM, `.--state` modifiers and
  `.mdc-*` internals all coexist.
- **Scope to `:host`** — в первом ките (`projects/ui-kit/`, префикс `rtui-`), где
  инкапсуляция эмулируется. Для `:host(.rtui-button-full)` — состояния на хосте.
  Во втором ките (`projects/ui-kit-v2/`) `:host` запрещён — см. раздел ниже.
- **Media queries via mixins**: `@include mixins.media-breakpoint-down($device-sm)`.
- **Global Material/CDK overrides go in `styles/components/_material-bridge.scss`**
  (one file to review on a Material upgrade); component-scoped piercings stay with
  their component. `::ng-deep` is allowed by stylelint (`ignorePseudoElements`).
- Property order is enforced by `stylelint-config-idiomatic-order`; prettier runs
  through `stylelint-prettier`.
- `.c-button` (`styles/base/_button.scss`) is **deprecated** — `.rtui-btn`
  (`_rtui_button.scss`) is the system. Migration map in TOKENS.md.

## `projects/ui-kit-v2/` — `:host` не применяется

Второй кит (`@rt-tools/ui-kit-v2`, префикс `rt-`) целиком на
`ViewEncapsulation.None`. Под `None` Angular селектор не переписывает, а в
обычном документе `:host` не совпадает ни с чем — правило, написанное через
него, оказывается мёртвым, и молча: синтаксически оно верно, стиль просто не
применяется. Ровно так в ките лежали неработающими `display: contents` у
`rt-aside` / `rt-dialog` и тёмная тема активной плитки `rt-section-nav`.

Поэтому `:host`, `:host()` и `:host-context()` в `projects/ui-kit-v2/src/lib/**`
запрещены правилом `rt-tools/no-host-selector`
(`tools/stylelint-rules/no-host-selector.cjs`). Чем их заменять:

| Вместо                                  | Писать                                 |
| --------------------------------------- | -------------------------------------- |
| `:host`                                 | `.rt-<блок>` — класс блока и есть хост |
| `:host(.rt-блок--мод)`                  | `.rt-<блок>--мод`                      |
| `:host-context([data-theme='dark']) .x` | `[data-theme='dark'] .x`               |

**Оговорка про совпадение имён.** У части компонентов класс блока висит и на
хосте (`host: { class: BEM_BLOCK }`), и на корне шаблона (`rtBlock` на реальном
элементе — `<article>`, `<button>`, `<div>`). Тогда `.rt-<блок>` бьёт по обоим,
и правила рамки достались бы ещё и хосту. У таких компонентов хост адресуется
**по имени элемента**, а правила блока вложены в него:

```scss
rt-card {
    display: block;

    .rt-card {
        padding: var(--rt-space-lg);
        background: var(--rt-color-bg-surface);
    }
}
```

Определить, какой случай перед вами, можно по шаблону: `rtBlock` на
`<ng-container>` класс не ставит (директива пропускает comment-ноду), значит
класс только на хосте — работает `.rt-<блок>`. `rtBlock` на реальном
элементе — класс двойной, нужен селектор по имени элемента.

Стили компонента под `None` глобальны: вложенные правила остаются под классом
блока, но верхнеуровневый селектор бьёт по всему документу. Новый
верхнеуровневый селектор, не начинающийся с класса блока или имени элемента, —
повод остановиться и проверить, что протечка задумана.

## Verify

```bash
pnpm exec stylelint "projects/**/*.scss"
pnpm run build:tokens   # regenerates dist/ui-kit/styles/tokens.css for non-sass consumers
```

Touching `styles/base/_tokens.scss` or `_color-scheme.scss` → run
`projects/ui-kit/src/styles/color-scheme.spec.ts` (`pnpm exec nx test @rt-tools/ui-kit`).
