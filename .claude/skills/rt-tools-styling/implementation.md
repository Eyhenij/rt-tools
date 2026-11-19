# rt-tools-styling — what is this tree's own

The rule belongs to this tree whole: the intake package does not carry it, and there is nothing to
move from here into it. The law's technique is named by the rule `styling-bem`, and what is its
own lies in the `implementation.md` next to it.

## What it is called here

- **In the rule** — Here
- **a kit** — a component package under `projects/`: each has its own tokens, themes and cascade layers

## Where it lives

- **the tokens and theme handles** — `projects/*/src/styles/`
- **the kit's styling layer** — assembled by the package build, not edited by hand
- **the styles linter rule** — `stylelint.config.js`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). The machine judges styling weakly: the styles linter catches a
class without a rule and forbidden properties, while the agreement of a threshold, the liveness of
a token and a theme's contrast it does not.

- **The narrow screen has one threshold.** — Not checked by a machine: held by reading the rule and by a measurement in the browser
- **Styling is taken as a token.** — `tools/check-tokens-styles.mjs` judges the shape of a value against its accepted list; `tools/check-tokens-graph.mjs:DECLARATION_RE` sorts a referenced name into declared, handle or dead, and it runs only in the push gate — `.claude/rt-kit/project.sh:rt_push_checks`
- **A component reads a step through its own property, not at the place of use.** — Not checked by a machine: held by reading the rule and by a measurement in the browser
- **A component stylesheet stays under the 9 kB budget.** — `apps/message-bus-admin/project.json:anyComponentStyle`, `apps/auth-example-admin/project.json:anyComponentStyle`, `apps/chat-talks-page/project.json:anyComponentStyle` — only the production builds of these applications in the push set check it
- **A size query asks a box whose size is not from its content.** — `projects/ui-kit-v2/src/lib/components/file-drop/rt-file-drop.component.scss:__overlay` carries the container sign, and `projects/ui-kit-v2/src/lib/components/file-drop/rt-file-drop.component.scss:__frame` carries the offsets the query reassigns; the agreement is `docs/specs/ui-kit-v2/overflowing-text/`
- **State outweighs styling.** — Not checked by a machine: held by reading the rule and by a measurement in the browser
- **`rtElem` needs a `BlockDirective`; a host class is not one.** — Not checked by a machine: held by reading the rule and by a measurement in the browser
- **A styling preset is a second layer of assignments, not a scale or a theme.** — `tools/build-tokens-v2.mjs:lightByName` — the build refuses a preset name absent from the base assignments and a scale step the preset rewrites
- **The preset flag sits on the page root or a container; the kit does not switch it.** — `projects/ui-kit-v2/src/styles/_preset-material.scss:rt-preset-material-tokens` — the three selectors of the flag; there is no service, and there is nothing to bind to
- **A node-scoped theme or preset declares the whole set, not the difference.** — `tools/build-tokens-v2.mjs:SCOPE_NOTE`. Four rules of the island, each including the whole set and cutting the root out
- **The dark theme beats a preset by file order, not specificity.** — `projects/ui-kit-v2/src/styles/_index.scss:preset-material` — the preset is forwarded between the assignments and the dark theme
- **A preset name from a foreign theme keeps that theme's reference under dark too.** — `tools/build-tokens-v2.mjs:materialDark` — the Material chains of the preset with the light step swapped for the dark answer. The theme-scope file lays them after the dark answers, on the root and on the nodes of the set
- **The dark theme declares `color-scheme: dark`, a light island `light`.** — `tools/build-tokens-v2.mjs:COLOR_SCHEME_NOTE` — the dark mixin opens with the scheme, and the light island rule of the theme scope carries `light`
- **A preset's silence about a colour has a reason, or is derived.** — `tools/check-preset-complete.mjs:followsPreset` — the reference chain is walked to the end, and only what does not follow the preset is asked for the field `presetShared`
- **Readability is counted in every look the kit can take, not in two themes.** — `tools/tokens-looks.mjs:LOOKS` — the four looks the pairs are measured in, with the accepted list in `tools/tokens-theme-allowlist.json`
- **A kit rule lives in a cascade layer.** — `tools/check-cascade-layer.mjs:OUTSIDE_MARK` — the file's wrapper, the order of the sublayers and the tail past the closing brace. A rule after the wrapper without the mark `rt-layer-outside` fails the check, and its own scenarios are run by `npm run test:checks`. That exactly the disputed part was taken out is judged by the probe `projects/ui-kit-v2/src/lib/components/aside/rt-aside-overlay.styles.spec.ts:split`
- **A transition takes names of its own.** — `tools/check-gradient-stops.mjs:gradientsOf` — every gradient of the kit is taken apart into ends, each end is resolved in the four looks, and a look in which they all come out one paint fails the run; its own scenarios are run by `npm run test:checks`
