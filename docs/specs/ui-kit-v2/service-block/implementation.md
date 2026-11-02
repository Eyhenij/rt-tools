# What it is carried out by — the block of a service

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

- **The mark is the logo of a service at the size `md` and takes the same items.** — `projects/ui-kit-v2/src/lib/components/service-block/rt-service-block.component.html:logo` — `rt-service-logo` without a size input draws `md`; the input `logos` is typed by `IRtServiceLogo.Item`. Scenarios `SC-UKV-904`, `SC-UKV-905`
- **The name and the description stand to the right of the mark, centred on it.** — `projects/ui-kit-v2/src/lib/components/service-block/rt-service-block.component.scss:__name` — the block properties on the root give the gaps, the font steps and the colours of the name and of the description. Scenario `SC-UKV-904`
- **A line in the subtle border colour, 1 thick, stands 20 under the block.** — `projects/ui-kit-v2/src/lib/components/service-block/rt-service-block.component.scss:padding-bottom` — the bottom padding of the block and its bottom border, both taken from the block properties. Scenario `SC-UKV-904`
- **In the kit's form the next section stands 16 under the line at every width.** — `projects/ui-kit-v2/src/styles/_form.scss:.rt-service-block` — the block standing right in the form takes the difference between the form gap and `--rt-space-md` off it, above the panel threshold only. No unit test measures it: the test environment computes no layout. The showcase frame of the story `Molecules/ServiceBlock/Panel` checks it at 540 and 375
- **The block takes the whole width of its place, and the text wraps instead of being cut.** — `projects/ui-kit-v2/src/lib/components/service-block/rt-service-block.component.scss:__text` — a flex item allowed to shrink, with `overflow-wrap: anywhere`. Scenario `SC-UKV-907`
- **The block carries no text of its own.** — `projects/ui-kit-v2/src/lib/components/service-block/rt-service-block.component.ts:description` — the name and the description are inputs; the template draws the description only when it is not empty. Scenario `SC-UKV-906`
