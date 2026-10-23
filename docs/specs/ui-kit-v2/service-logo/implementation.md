# What it is carried out by — the logo of a service

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

- **Each mark stands centred in a round opaque plate with a soft shadow.** — `projects/ui-kit-v2/src/lib/components/service-logo/rt-service-logo.component.scss:__plate` — the fill `--rt-color-service-logo-bg` and the shadows `--rt-shadow-service-logo-*` of the styling source. Scenario `SC-UKV-864`
- **The size takes four values, and each one carries the numbers of the atom.** — `projects/ui-kit-v2/src/lib/components/service-logo/rt-service-logo.component.scss:--size-sm` — the block properties and their reassignment by the size modifiers; the icon step follows `projects/ui-kit-v2/src/lib/components/service-logo/rt-service-logo.component.ts:ICON_SIZES`. Scenario `SC-UKV-864`
- **An image mark fits its box and keeps its proportions.** — `projects/ui-kit-v2/src/lib/components/service-logo/rt-service-logo.component.scss:__image` — `object-fit: contain` in a box 1.375 times wider than high. Scenario `SC-UKV-864`
- **Several marks overlap with the step, and a later mark lies on top of the earlier one.** — `projects/ui-kit-v2/src/lib/components/service-logo/rt-service-logo.component.scss:__plate` — positioned plates without `z-index` and a negative start margin equal to the plate minus the step. Scenario `SC-UKV-865`
- **A mark without an image is an icon of the kit in the same plate.** — `projects/ui-kit-v2/src/lib/components/service-logo/rt-service-logo.component.ts:marks` — an item without `src` draws `rt-icon` inside the plate; the plate sets the icon colour `--rt-color-service-logo-mark`, dark in both themes. Scenario `SC-UKV-866`
- **Each mark carries its label for a screen reader.** — `projects/ui-kit-v2/src/lib/components/service-logo/rt-service-logo.component.html:plate` — the host is a list, a plate is its item, the image carries `alt` and the icon wrapper `role="img"` with `aria-label`. Scenario `SC-UKV-867`
- **The kit ships no marks of outside companies.** — `projects/ui-kit-v2/src/lib/components/service-logo/rt-service-logo.model.ts:ImageItem` — an image mark is an address the application gives.
