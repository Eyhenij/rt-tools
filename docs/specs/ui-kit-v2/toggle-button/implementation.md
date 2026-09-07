# What it is carried out by — a button with two positions

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The sign of the position has three values: pressed, released, no position at all.** — `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts:pressed`; scenario `SC-UKV-95`
- **The released position is declared on a par with the pressed one.** — `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts:ariaPressed`; scenario `SC-UKV-96`
- **The look of the pressed position is taken from the held press of the button itself.** — `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.scss:pressed`; scenario `SC-UKV-97`
- **The position does not change by itself at a press.** — `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts:pressed` — an input and only an input: the directive keeps no state of its own; scenario `SC-UKV-97`
- **A switched-off button keeps its position.** — `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.scss:pressed`; scenario `SC-UKV-98`
