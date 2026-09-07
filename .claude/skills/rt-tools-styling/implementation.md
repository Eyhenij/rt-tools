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
- **State outweighs styling.** — Not checked by a machine: held by reading the rule and by a measurement in the browser
- **The block class and the block directive.** — Not checked by a machine: held by reading the rule and by a measurement in the browser
- **A kit rule lives in a cascade layer.** — `tools/check-cascade-layer.mjs:OUTSIDE_MARK` — the file's wrapper, the order of the sublayers and the tail past the closing brace. A rule after the wrapper without the mark `rt-layer-outside` fails the check, and its own scenarios are run by `npm run test:checks`. That exactly the disputed part was taken out is judged by the probe `projects/ui-kit-v2/src/lib/components/aside/rt-aside-overlay.styles.spec.ts:split`
