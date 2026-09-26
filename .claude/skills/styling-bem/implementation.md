# styling-bem — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. A separate file because the rule speaks by
technique and travels between repositories whole, while everything below is true only here and
goes stale at every renaming.

Here the styling is itself the subject of delivery: the tree publishes token sets together with
the components, and "a raw value in place" leaves for the consumer forever.

## What it is called here

- **In the rule** — Here
- **a styling token** — the custom property `--rt-*` in three tiers: primitive, semantic, component
- **the block class directive** — `rtBlock` from `@rt-tools/core`
- **the element class directive** — `rtElem`
- **the modifier directive** — `[rtMod]` — accepts a record "modifier name → sign"
- **the shared layout layer** — `projects/<kit>/src/styles/` — the theme switch and the breakpoints are there too
- **the component tier of tokens** — a map `element → (property: value)` in the component's styles file, unfolded by `generateCssVar`

## Where it lives

- **the primitive and semantic tiers of the first kit** — `projects/ui-kit/src/styles/base/_tokens.scss`
- **the description of the token set** — `projects/ui-kit/src/styles/TOKENS.md`
- **the token set of the second kit** — `projects/ui-kit-v2/src/styles/`
- **the rule about raw values** — `tools/stylelint-rules/no-hardcoded-design-tokens.cjs`
- **the rule about the host in the second kit** — `tools/stylelint-rules/no-host-selector.cjs`
- **the cascade layer of the second kit** — `projects/ui-kit-v2/src/styles/_layers.scss`
- **the cascade layer check** — `tools/check-cascade-layer.mjs`
- **a sample of component styles** — `projects/ui-kit/src/lib/ui-kit/toggle/rtui-toggle.component.scss`
- **the bridge to Material** — `projects/ui-kit/src/styles/components/_material-bridge.scss`
- **the aggregator of the second kit's styling layer** — `projects/ui-kit-v2/src/styles/_index.scss`
- **the admin panel's shared layout layer** — `apps/message-bus-admin/src/styles/`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **Styling is taken as a `--rt-*` token, not written as a value in place.** — `tools/stylelint-rules/no-hardcoded-design-tokens.cjs:RULE_NAME` — it refuses a colour, a number in a padding, a rounding, a font size and a border width, colour functions and the substitution of build variables; accepted are only `var(--rt-*)`, `var(--mat-*)`, `var(--mdc-*)`, computations and zero. Plus `color-no-hex` from the bundle. The showcase's demonstration styles are taken out from under the rule.
- **Every element class has its own style rule.** — `tools/check-styles.mjs:ELEM_RE` — it reads `rtElem="…"` over all roots of the tree (`projects`, `apps`, `libs`) and looks for a declaration `__<element>` in any styles file. A match is counted by the element name rather than by the pair "block — element", so a class with a rule on a foreign block passes. What accumulated lies in `tools/styles-allowlist.json`; only a new class without a rule gives a refusal.
- **A class is set by a directive, not by a string in an attribute.** — `tools/eslint-rules/rules/require-bem-directives.ts:BINDING_TYPE_CLASS` — it refuses `class="…"`, `[class.x]`, `[ngClass]`. Declared as a warning, but it fails the run on a par with an error: the `lint` target has `maxWarnings: 0`. In the showcase's demonstration markup the rule is switched off.
- **One thing is called by one name in every place it occurs.** — **Not checked by anything.** Three blocks with shared names in different meanings lie in one layer and are indistinguishable to the linter from the vocabulary of one: it judges the shape of the name, not what the name means. It is caught by reading all the places where the thing occurs — here that is the form as a page, as an editing panel and as a dialog.
- **The layout is declared in the application's shared layer, not in the screen's styles.** — `apps/message-bus-admin/src/styles/_page.scss:admin-page` — the admin panel's shared layer: the page base, the page, the panel; it is included from `apps/message-bus-admin/src/styles.scss` after the kit, where the last word is left to the application. Layout declared by classes the kit gives outward only through the aggregator `projects/ui-kit-v2/src/styles/_index.scss`; a component's styles file holds only its own differences.
- **The sheet and the window are opened by the kit service, not by a layer number.** — `projects/ui-kit-v2/src/lib/components/dialog/rt-dialog.service.ts:RtDialogService` — the service takes the markup out to `<body>`, and there is nothing left to compare layer numbers with.
- **The layer number is taken from the scale, not written as a number in the component file.** — **Not carried out.** The kit has no layer scale yet: the only number stands in `projects/ui-kit-v2/src/styles/_login.scss`, and starting a scale is work of its own.
- **A width limit is declared together with the fate of what did not fit.** — `projects/ui-kit-v2/src/lib/components/table/copy-cell/rt-copy-cell.component.scss:text-overflow` — the cell content has clipping, an ellipsis and a ban on wrapping; `min-width: 0` next to it only allows shrinking. It is not judged by a linter rule: a width limit is also set where the content is knowingly shorter
- **Truncation goes in a pair with a tooltip.** — `projects/ui-kit-v2/src/lib/components/table/copy-cell/rt-copy-cell.component.ts:measureTruncation` — the cell shows a tooltip with the whole value, and only on a truncated one: the truncation is measured at the moment of hovering
- **The size of a control is chosen by the pointer sign, not by the screen width.** — `projects/ui-kit-v2/src/styles/_coarse-pointer.scss:coarse` — the control steps are switched by a media query on the pointer sign, not by the window width.
- **A styles file is no longer than 500 lines.** — `tools/check-file-size.mjs:LIMIT` — the limit is shared with code and texts; stylelint does not judge length at all.
- **A stylelint warning fails the run the same as an error.** — `.claude/rt-kit/project.sh:rt_lint_for` — the styles linter with the threshold `--max-warnings 0`. It is called from the push guard, from the sweeping runs `check:all` and `check:affected` and as a separate CI step; the styles-file edit hook runs it with the same threshold.

## What else is worth knowing when reading the code

- Component values are written in `rem`; `mixins.rem(16)` converts from pixels. The exception is
  the breakpoint variables `$device-*`, they are in pixels.
- The component tier is declared as a map and unfolded by `generateCssVar('toggle', 'label',
'color')` → `--rt-toggle-label-color`. The place of declaration decides who can override it: on
  `:root` it is overridden by any ancestor, on the host — only pointedly by the element.
- The second kit is entirely on `ViewEncapsulation.None`, and `:host` there matches nothing — a
  rule written through it silently does not apply. Hence `rt/no-host-selector`: instead of the
  host the block class `.rt-<block>` is written, and where the class hangs both on the host and
  on the template root — a selector by the element name.
- The property order is held by `stylelint-config-idiomatic-order`, the formatting by
  `stylelint-prettier`. Comments switching off the styles linter are not set here.
- The `.c-button` bundle is out of use together with its file; the live one is `.rtui-btn`, and
  its rules lie in parts in `projects/ui-kit/src/styles/components/button/`, while
  `projects/ui-kit/src/styles/components/_rtui_button.scss` stayed as the entry and sets their
  cascade order. The transition map is in `projects/ui-kit/src/styles/TOKENS.md`.

## What this is checked by

- `pnpm run lint:styles` — both own rules and the whole bundle, with the warning threshold. It
  judges `projects/**/*.scss`: the linter does not read the applications' styles at all, and a
  rule written in the admin panel's shared layer is judged by no check.
- `pnpm run check:styles` — an element class without a rule, over all roots of the tree.
- `pnpm run check:cascade-layer` — a second-kit styles file without a layer, a rule before the
  wrapper, the order of the sublayers and a root declaration that rode into the layer.
- `pnpm run build:tokens` and `pnpm run build:tokens-v2` — rebuilding the ready-made token set
  for consumers that do not build SCSS.
- An edit of `_tokens.scss` or `_color-scheme.scss` — `pnpm exec nx test @rt-tools/ui-kit`, the
  spec `projects/ui-kit/src/styles/color-scheme.spec.ts`.
