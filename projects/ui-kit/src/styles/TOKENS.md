# rt-tools CSS Design Tokens (v2)

GMT-style three-tier CSS custom property system. **Full documentation lives in
Storybook**: Foundation/Design Tokens/{Overview, Colors, Semantic, Spacing},
Foundation/Theming, How to use tokens (`projects/ui-kit/docs/*.mdx`).

```
Tier 1  primitives   --rt-color-*                      base/_tokens.scss
Tier 2  semantic     --rt-{bg,text,icon,border}-*      base/_tokens.scss (light-dark())
Tier 3  component    --rt-<component>-<el>-<token>     per-component SCSS maps
```

Quick facts:

- Light default; `.rt-dark` global switch; `data-rt-theme` nested local contexts;
  `.rt-theme-auto` follows the OS. Runtime: `RtThemeService` / `RtThemeDirective`.
- Angular Material hybrid: semantic tokens are `var(--mat-sys-*, light-dark(…))`
  fallback chains. Opt out: `@use '...main' with ($tokens-use-material: false)`.
- Accent roles `{primary,success,warning,danger,info,neutral}`,
  steps `{subtle,solid,hover,disabled}` (simplified vs GMT).
- Accent indirection: the accent semantic tier derives from `--rt-color-{role}-{0..100}`
  ramps (`{primary,info,success,warning,danger,brand}`). Custom brand palettes
  override only those rows — see **Custom color schemes** below.
- Foundations: `--rt-spacing-{0..64}` (px-named, rem values), `--rt-radius-*`,
  `--rt-font-*`, `--rt-shadow-*`, `--rt-transition-*`, `--rt-z-index-*`.
- Prebuilt CSS for non-sass consumers: `dist/ui-kit/styles/tokens.css`
  (`pnpm run build:tokens`).
- Figma parity: collections `core` (`rt/color/*`) and `theme` (`rt/{bg,text,icon,border}/*`,
  Light/Dark modes) in the “RT-Tools UI Kit” file mirror these names 1:1.
- App-defined (never set by the kit): `--font-default`, mat theme colors.

## Component theming API (Tier 3 contract)

Tier-3 vars are split into a **public theming API** and **internal implementation details**.
Only the public set is a compatibility promise; internal vars may be renamed or stop being
emitted in the next major release.

**Public** (override these from your app):

1. Every var matching `--rt-<component>-*-{color,background-color,bg,shadow,indicator}` —
   the color surface of each component.
2. Documented size hooks proven by consumers:
   `--rt-table-row-height`, `--rt-toolbar-body-height`, `--rt-toolbar-body-mobile-height`,
   `--rt-aside-error-box-height`, `--rt-aside-host-width`,
   `--rt-image-upload-host-min-height`, `--rt-image-upload-image-container-image-max-height`.

**Internal** (everything else): layout paddings/margins/gaps/font-sizes generated from SCSS maps.
They currently _are_ emitted (≈380 vars total, ~14% actually themed by consumers) — in the next
major the internal set stops being emitted and gets inlined into rules.

### `:root` vs `:host` emission — override semantics

- Vars emitted at **`:root`** (global stylesheets + `ViewEncapsulation.None` components like
  aside-panel) are overridable from any ancestor scope: `.dark-mode { --rt-aside-host-background-color: …; }`.
- Vars emitted at **`:host`** are set on the element itself and **win over inherited values** —
  consumers must target the element (`rtui-toolbar { --rt-toolbar-body-height: … !important; }`).
  This asymmetry is why some consumers need `!important` for toolbar/toggle but not for aside/table.
- Planned unification (major): emit defaults via `var(--override, default)` indirection so all
  components are ancestor-overridable without `!important`.

## Buttons: legacy vs rtui

`.c-button` (\_button.scss) is **deprecated**; `.rtui-btn` (\_rtui_button.scss) is the system.
Both stay until the next major because consumers apply `.c-button` classes and override
`--rt-button-*` directly. Migration map:

| legacy `.c-button`        | `.rtui-btn`                                                           |
| ------------------------- | --------------------------------------------------------------------- |
| `--fill-green` / `-light` | `rtui-btn-success` / `-light`                                         |
| `--fill-red` / `-light`   | `rtui-btn-error` / `-light`                                           |
| `--fill-blue`             | `rtui-btn-accent-light`                                               |
| `--fill-base/black/gray`  | `rtui-btn-secondary` (+`-light`)                                      |
| `--outline-{blue,base}`   | `rtui-btn-{accent,secondary}-outline`                                 |
| `--txt-*`, `--fab`        | no equivalent yet — needs a text/icon appearance in `.rtui-btn` first |
| `--size-{sm,md,l}`        | `rtui-btn-{sm,md,lg}` (+`-full`)                                      |

## Material bridge

All **global** Material/CDK overrides live in `styles/components/_material-bridge.scss`
(single file to review on a Material upgrade). Component-scoped piercings stay with their
component; the bridge header keeps the inventory of those locations.

## Custom color schemes (brand palettes)

The accent semantic tier never hardcodes color — it derives from an indirection layer,
the **accent-role ramps** `--rt-color-{role}-{0..100}` for
`{primary, info, success, warning, danger, brand}`. A custom brand palette overrides
**only** those rows; the kit derives `--rt-{bg,text,icon,border}-accent-*`,
hover/subtle/disabled and `--rt-border-focus` from them. The block is scoped to
`[data-rt-scheme="<name>"]` on `<html>`, set raw → it wins over `--mat-sys-*`.

```scss
@use '@rt-tools/ui-kit/src/styles/main' as rt;
@include rt.color-scheme(
    'teal',
    (
        primary: (
            20: #b3e3e1,
            40: #5cb8b5,
            60: #1a9d99,
            100: #008582,
        ),
        brand: (
            20: #e8e8e8,
            100: #008582,
        ),
    )
);
```

```typescript
// runtime twin (browser-only); prefer the Sass path for SSR/brand-critical schemes
theme.registerColorScheme('teal', { primary: { 100: '#008582' /* … */ } });
theme.setColorScheme('teal'); // data-rt-scheme="teal"; persisted to rt-color-scheme
theme.setColorScheme(null); // back to the default palette
```

- Orthogonal to light/dark (one ramp per role serves both modes).
- Δ0: with no scheme the accent layer is byte-for-byte the historical palette
  (regression-tested in `styles/color-scheme.spec.ts`); Sass↔JS generator parity is tested too.
- Full guide: Storybook **Foundation/Theming/Custom color schemes** (`docs/ColorSchemes.mdx`).
