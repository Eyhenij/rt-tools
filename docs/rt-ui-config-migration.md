# RT_UI_CONFIG — migration plan

## Why

The library currently renders controls from two visual generations:

- **`rtui-*` design-system controls** (e.g. `rtui-button`) styled by the `--rt-*` design tokens — the target look;
- **raw Material buttons hardcoded inside composite components** — e.g. the footers of
  `rtui-aside-container` and `rtui-multi-selector-popup` use `mat-button` / `mat-flat-button`
  (the latter still carrying the dead legacy `c-button` class and a hardcoded uppercase label).

Consumer apps cannot pick which look they get, and the two looks diverge (height, radius,
typography, colors). `RT_UI_CONFIG` makes the look a **consumer decision** at three levels:

```
instance input  >  components.<name>  >  global  >  library default
```

## The config (shipped in Phase 0)

```typescript
provideRtUi({
    global: {
        theme: 'auto', // initial theme when nothing is persisted
        colorScheme: 'my-brand', // initial brand ramp when nothing is persisted
        design: 'custom', // default design for every design-aware control
    },
    components: {
        button: { design: 'material', size: 'md', radius: 'full', appearance: 'text' },
    },
});
```

- `RT_UI_CONFIG` is an `InjectionToken<IRtUiConfig.Config>` with a root factory of `{}` —
  every setting is optional and the absence of the provider preserves today's behavior exactly.
- `RtThemeService` uses `global.theme` / `global.colorScheme` as the _fallback_ when the user
  has no persisted preference; a persisted choice always wins.
- `rtui-button` resolves `design`, `size`, `radius`, `appearance` through the chain above.
  `design: 'material'` renders the pill as an M3 filled button (`--mat-sys-primary`), and
  `appearance: 'text'` under material as an M3 text button; `variant: 'danger'` maps to the
  M3 error role. All other variants map to primary (M3 has no success/warning roles).

## Phases

### Phase 0 — foundation (this change)

- `IRtUiConfig` types, `RT_UI_CONFIG` token, `provideRtUi(config?)` (backward compatible).
- `rtui-button`: new `design` input (`'material' | 'custom'`, default `'custom'`),
  config-resolved `size`/`radius`/`appearance`, `--design-*` BEM modifier, M3 style block.
- `RtThemeService`: config-driven initial theme / color scheme.

### Phase 1 — migrate composite-component footers onto `rtui-button`

Replace the hardcoded Material buttons inside the library with `rtui-button` so the config
governs them. Inventory (grep `mat-button|mat-flat-button|mat-stroked-button|c-button` in
`projects/ui-kit/src/lib/ui-kit`):

| Component                        | Spot                                 | Notes                                       |
| -------------------------------- | ------------------------------------ | ------------------------------------------- |
| `rtui-aside-container`           | footer Cancel/Submit                 | keep `cdkFocusInitial` on Cancel            |
| `rtui-multi-selector-popup`      | footer Cancel/SUBMIT                 | drop `c-button` class + hardcoded uppercase |
| `rtui-modal` footers             | confirm/cancel actions               | check all modal templates                   |
| other spots surfaced by the grep | file/image uploaders, table controls | case by case                                |

**Compatibility rule:** during Phase 1 these internal buttons resolve their design from the
config with a **`'material'` fallback** (not the library default `'custom'`), so a consumer
that upgrades without providing a config sees no visual change. Expose the knob as
`components.aside.footerDesign` / `components.multiSelector.footerDesign` or, simpler, one
shared `components.compositeFooters.design` — decide when the first footer migrates.

### Phase 2 — extend `IRtUiConfig.Components` to the rest of the kit

- Add entries for other design-aware components as real needs appear (aside, multi-selector,
  table density, snack-bar). One entry per component, same resolution chain.
- Factor the resolution into a tiny shared helper (`resolveUiSetting(input, componentCfg, globalCfg, fallback)`)
  once a third component adopts the pattern — two copies are fine, three are not.
- Every new entry ships with spec coverage of the resolution chain (see
  `rtui-button.component.spec.ts` as the template).

### Phase 3 — flip the transitional fallbacks

Once consumers have had a release cycle to set `design` explicitly:

- switch the Phase-1 internal fallbacks from `'material'` to the library default (`'custom'`),
  in a **minor release with a loud changelog entry** — this is the visual cutover;
- consumers that want to keep the Material look permanently set
  `global.design: 'material'` (or per-component entries) and nothing changes for them.

### Phase 4 — cleanup

- Remove the dead `c-button` classes and hardcoded label casing from templates.
- Deprecate (JSDoc `@deprecated`, one minor release) and then remove any per-component
  inputs that merely duplicated what the config expresses better.
- Storybook: add a global toolbar toggle that re-provides `RT_UI_CONFIG` so every story can
  be viewed in both designs.

## Testing per phase

- Unit: resolution-chain specs per component (input > component entry > global > default).
- Visual: Storybook story per migrated spot rendered in both designs.
- Consumer smoke: build a consumer app against the local `dist/` before each publish and
  verify no unconfigured visual diffs (the compatibility rule above is the contract).
