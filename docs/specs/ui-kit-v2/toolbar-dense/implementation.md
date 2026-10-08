# What it is carried out by — the long title of a dense toolbar

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The left part of a dense toolbar shrinks to the place left to it.** — `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.scss:rt-toolbar--dense`; scenario `SC-UKV-727`
- **The right part of a dense toolbar keeps the width of its buttons.** — `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.scss:rt-toolbar__bar--right` — the right part shrinks no narrower than its smallest content; scenario `SC-UKV-727`
- **An ordinary toolbar lays out as before.** — `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.scss:rt-toolbar__bar--left` — the left part of the block stays unshrunk outside the dense look
