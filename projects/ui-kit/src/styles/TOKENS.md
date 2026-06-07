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
- Foundations: `--rt-spacing-{0..64}` (px-named, rem values), `--rt-radius-*`,
  `--rt-font-*`, `--rt-shadow-*`, `--rt-transition-*`, `--rt-z-index-*`.
- Legacy `--clr-*` variables are emitted as **deprecated aliases**.
- Prebuilt CSS for non-sass consumers: `dist/ui-kit/styles/tokens.css`
  (`pnpm run build:tokens`).
- Figma parity: collections `core` (`rt/color/*`) and `theme` (`rt/{bg,text,icon,border}/*`,
  Light/Dark modes) in the “RT-Tools UI Kit” file mirror these names 1:1.
- App-defined (never set by the kit): `--clr-avalon`, `--font-default`, mat theme colors.
