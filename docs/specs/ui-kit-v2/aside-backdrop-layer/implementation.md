# What it is carried out by — the backing of a panel and the layers of the design

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The rule of the visibility of the backing is declared outside the layer.** — `projects/ui-kit-v2/src/lib/components/aside/_rt-aside-overlay.scss:rt-aside-backdrop--visible` — the transparency and the presses of the backing stand behind the closing bracket of the layer; scenario `SC-UKV-84`
- **The rule of the visibility of a closed panel is declared there too and for the same reason.** — `projects/ui-kit-v2/src/lib/components/aside/_rt-aside-overlay.scss:rt-aside-overlay--open` — the rule of the presses of a closed panel stands behind the same bracket; scenario `SC-UKV-85`
- **The rules of the design stay in the layer.** — `projects/ui-kit-v2/src/lib/components/aside/_rt-aside-overlay.scss:rt-aside-backdrop-bg` — the colour, the blur and the transition are declared inside `@layer rt-kit.components`; scenario `SC-UKV-86`
