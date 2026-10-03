# What it is carried out by — the size and background of the icon button from its tag

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **A size set on the icon button's tag or above it reaches the button, and without it the size step applies.** — `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.scss:rt-icon-button-size-step` — scenario `SC-UKV-589`
- **A background set on the icon button's tag or above it reaches the button, and without it the kind's background applies.** — `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.scss:rt-icon-button-bg-variant` — scenario `SC-UKV-590`
- **The hover background comes from its own property, and without it the kind's hover background applies.** — `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.scss:rt-icon-button-bg-hover` — scenario `SC-UKV-591`
- **The sizes xs and 2xs draw buttons of 22 and 20 pixels with a 16 pixel icon.** — `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.ts:resolvedIconSize` — scenario `SC-UKV-592`
- **Without the new properties and sizes the icon button and the header draw as before.** — `projects/ui-kit-v2/src/lib/components/header/rt-header.component.html:header-profile` — scenario `SC-UKV-593`
