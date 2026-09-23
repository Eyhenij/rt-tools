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

- **The narrow screen.** — Not checked by a machine: held by reading the rule and by a measurement in the browser
- **Styling is taken as a token.** — Not checked by a machine: held by reading the rule and by a measurement in the browser
- **Between a step and a place stands the component's own property.** — Not checked by a machine: held by reading the rule and by a measurement in the browser
- **A query about the size of a box is asked of a box whose size does not come from its content.** — `projects/ui-kit-v2/src/lib/components/file-drop/rt-file-drop.component.scss:__overlay` carries the container sign, and `projects/ui-kit-v2/src/lib/components/file-drop/rt-file-drop.component.scss:__frame` carries the offsets the query reassigns; the agreement is `docs/specs/ui-kit-v2/overflowing-text/`
- **State outweighs styling.** — Not checked by a machine: held by reading the rule and by a measurement in the browser
- **The block class and the block directive.** — Not checked by a machine: held by reading the rule and by a measurement in the browser
- **A styling preset is a second layer of assignments, not a second scale and not a theme.** — `tools/build-tokens-v2.mjs:lightByName` — the build refuses a preset name absent from the base assignments and a scale step the preset rewrites
- **The preset flag is an attribute or a class on the page root or on a container, and the kit does not switch it in code.** — `projects/ui-kit-v2/src/styles/_preset-material.scss:rt-preset-material-tokens` — the three selectors of the flag; there is no service, and there is nothing to bind to
- **A theme or a preset scoped to a node declares the whole set of the assignments on that node, not the difference from the page.** — `tools/build-tokens-v2.mjs:SCOPE_NOTE`. Four rules of the island, each including the whole set and cutting the root out
- **The dark theme wins over a preset, and it wins by the order in the file, not by specificity.** — `projects/ui-kit-v2/src/styles/_index.scss:preset-material` — the preset is forwarded between the assignments and the dark theme
- **A preset's silence about a colour is named as a reason, and the silence that needs no reason is derived rather than written by hand.** — `tools/check-preset-complete.mjs:followsPreset` — the reference chain is walked to the end, and only what does not follow the preset is asked for the field `presetShared`
- **The readability threshold is counted in every look the kit can be drawn in, not in the two themes.** — `tools/tokens-looks.mjs:LOOKS` — the four looks the pairs are measured in, with the accepted list in `tools/tokens-theme-allowlist.json`
- **A kit rule lives in a cascade layer.** — `tools/check-cascade-layer.mjs:OUTSIDE_MARK` — the file's wrapper, the order of the sublayers and the tail past the closing brace. A rule after the wrapper without the mark `rt-layer-outside` fails the check, and its own scenarios are run by `npm run test:checks`. That exactly the disputed part was taken out is judged by the probe `projects/ui-kit-v2/src/lib/components/aside/rt-aside-overlay.styles.spec.ts:split`
- **A transition takes names of its own instead of borrowing two neighbouring roles.** — `tools/check-gradient-stops.mjs:gradientsOf` — every gradient of the kit is taken apart into ends, each end is resolved in the four looks, and a look in which they all come out one paint fails the run; its own scenarios are run by `npm run test:checks`
