# What it is carried out by — the properties of the scroll area and the action bar

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The scroll area reads the paddings and backgrounds of its header, body and footer, and its own background, from properties.** — `projects/ui-kit-v2/src/lib/components/scroll-area/rt-scroll-area.component.scss:rt-scroll-area-body-padding` — scenario `SC-UKV-575`
- **The action bar reads its background, text colour, padding, gap, font size and the weights of its counter and actions from properties.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.scss:rt-action-bar-bg` — scenario `SC-UKV-576`
- **The action bar reads the padding of its actions from properties.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.scss:rt-action-bar-action-padding-block` — scenario `SC-UKV-576`
- **The menu of the action bar draws with its rounding and shadow, and reads its colours from properties.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.scss:rt-action-bar-menu-radius-default` — scenario `SC-UKV-577`
- **The menu of the action bar reads its padding, the gap between its items and the font size of an item from properties.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.scss:rt-action-bar-menu-padding-default` — scenario `SC-UKV-723`
- **Without the new properties the scroll area and the bar draw as before.** — `projects/ui-kit-v2/src/lib/components/scroll-area/rt-scroll-area.component.scss:rt-scroll-area-bg` — scenario `SC-UKV-578`
