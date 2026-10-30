# What it is carried out by — the media of a card

The first column is the rule of the spec next to it verbatim.
The second is where it is carried out in the tree, with the scenario that checks it.
What covers every scenario is said in `scenarios.md`.

- **The media stands above the header, before the title.** — `projects/ui-kit-v2/src/lib/components/card/rt-card.component.html:media` — the slot `[rtCardMedia]` stands in its own box before the header. Scenario `SC-UKV-868`
- **An empty media slot takes no room.** — `projects/ui-kit-v2/src/lib/components/card/rt-card.component.scss:__media` — the box hides by `:empty`. Scenario `SC-UKV-869`
- **The header slot and the title keep their order.** — `projects/ui-kit-v2/src/lib/components/card/rt-card.component.html:rtCardHeader` — the header draws the title first and its slot after it.
