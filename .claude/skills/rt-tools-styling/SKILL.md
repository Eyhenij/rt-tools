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
- **Scope to `:host`.** Use `:host(.rtui-button-full)` for host state classes.
- **Media queries via mixins**: `@include mixins.media-breakpoint-down($device-sm)`.
- **Global Material/CDK overrides go in `styles/components/_material-bridge.scss`**
  (one file to review on a Material upgrade); component-scoped piercings stay with
  their component. `::ng-deep` is allowed by stylelint (`ignorePseudoElements`).
- Property order is enforced by `stylelint-config-idiomatic-order`; prettier runs
  through `stylelint-prettier`.
- `.c-button` (`styles/base/_button.scss`) is **deprecated** — `.rtui-btn`
  (`_rtui_button.scss`) is the system. Migration map in TOKENS.md.

## Verify

```bash
pnpm exec stylelint "projects/**/*.scss"
pnpm run build:tokens   # regenerates dist/ui-kit/styles/tokens.css for non-sass consumers
```

Touching `styles/base/_tokens.scss` or `_color-scheme.scss` → run
`projects/ui-kit/src/styles/color-scheme.spec.ts` (`pnpm exec nx test @rt-tools/ui-kit`).
