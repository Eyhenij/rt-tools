# What it is carried out by — the width of the page place

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **A kit component inside the page place counts its thresholds from the place width.** — `projects/ui-kit-v2/src/styles/_breakpoints.scss:place-max`, `projects/ui-kit-v2/src/lib/components/filter-control/rt-filter-control.component.scss:place-max`; scenario `SC-UKV-881`
- **Without the page place the thresholds count from the window.** — `projects/ui-kit-v2/src/styles/_place.scss:rt-place`, `projects/ui-kit-v2/src/lib/platform/breakpoints.service.ts:rtNarrowByWidth`; scenario `SC-UKV-878`
- **The page container declares itself the page place and releases it when it leaves.** — `projects/ui-kit-v2/src/lib/components/container/rt-container.component.ts:registerPlace`, `projects/ui-kit-v2/src/lib/components/container/rt-container.component.scss:rt-place`; scenario `SC-UKV-877`
- **The narrow sign of the breakpoint service answers by the page place, and by the window without one.** — `projects/ui-kit-v2/src/lib/platform/breakpoints.service.ts:narrow`, `projects/ui-kit-v2/src/lib/platform/breakpoints.service.ts:registerPlace`; scenarios `SC-UKV-876`, `SC-UKV-879`
- **An overlay counts its thresholds from the window.** — `projects/ui-kit-v2/src/lib/platform/breakpoints.service.ts:viewportNarrow`, `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-picker.component.ts:viewportNarrow`; scenario `SC-UKV-880`
