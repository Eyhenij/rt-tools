# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — Closing
- **Done:** all stages; lint, test and build of the kit and the style lint green
- **Next step:** commit, take the folder apart, send the branch, open the PR on the green run
- **Uncommitted:** the whole work of the task
- **Waiting for the owner:** no; the owner said «чини»
- **PR:** not open yet

## Steps

- [x] 1.1 Add the `profileMenu*` labels to the English kit set and the Russian showcase set
- [x] 1.2 Write `rt-profile-menu` with its model, template and styles, and its entry point
- [x] 1.3 Write the unit tests of SC-UKV-857…862
- [x] 2.1 Put `rt-profile-menu` into the bookings screen instead of the showcase component
- [x] 2.2 Remove the showcase component and its style layer
- [x] 2.3 Write CONTEXT.md and Overview.mdx of the component
- [x] 3.1 Merge the agreement into the kit spec
- [x] 3.2 Run the kit lint, the style lint, the tests and the build

## Decisions along the way

- **The component gets its own stories and references, not only the showcase screen.** The kit
  coverage and the preset pair checks demand an overview, a story and a pair of presets of every
  family. Affected stage of the plan: 2.
- **Labels are read from the label map signal, not by the label pipe.** The pipe needs the
  translator as its second argument; the keys here are constant. Affected stage of the plan: 1.

## Sessions

### 2026-10-15

- Task RT-2842 created and moved to work; the working tree `rt-profile-menu` taken from `origin/main`.
- 11 unit tests of the component green, the whole kit suite 2863 of 2863 green; the package builds
  with the entry point `@rt-tools/ui-kit-v2/profile-menu`; lint, typecheck and style lint green.
- Kit coverage, preset pair, reuse, boolean inputs, cycles and showcase links checks green.
- Two references taken for the new stories and read by eye.
- `pnpm exec nx run-many -t lint test build -p @rt-tools/ui-kit-v2` exit 0 and
  `pnpm run lint:styles` exit 0 — the readiness sign of stage 3.
