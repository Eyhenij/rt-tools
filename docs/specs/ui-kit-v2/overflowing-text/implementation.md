# What it is carried out by — text that does not fit its place

The first column is the rule of the spec next to it verbatim. The second is where it is carried
out in the tree; what exactly every scenario is covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

- **A text of the kit that can be longer than its place declares what happens to what does not fit.** — One line, clipping and an ellipsis at `projects/ui-kit-v2/src/lib/components/file-card/rt-file-card.component.scss:__name`. The same three already stood at the title above it. The whole value is given by the tooltip — `projects/ui-kit-v2/src/lib/components/file-card/rt-file-card.component.html:rtTooltip`. Scenario `SC-UKV-137`
- **A component takes the width its place gives and does not grow past it.** — The floor and the ceiling of the inline size stand on the root of the block — `projects/ui-kit-v2/src/lib/components/file-card/rt-file-card.component.scss:rt-file-card`. Without the floor a grid item does not shrink below its content. Scenario `SC-UKV-138`
- **A component never paints outside its own box.** — The clipping on the overlay — `projects/ui-kit-v2/src/lib/components/file-drop/rt-file-drop.component.scss:__overlay`. It is the backstop under the compact form. Scenario `SC-UKV-139`
- **A hint the kit writes itself fits the box it is drawn in, or it is drawn in a compact form.** — The query about the size of the box reassigns three values at once — `projects/ui-kit-v2/src/lib/components/file-drop/rt-file-drop.component.scss:__frame`. They are the inset of the frame, its padding and the size of the label. Scenario `SC-UKV-140`
- **A component is shown on the long value, not on the sample one.** — The case of the long name stands among the cases of the showing of the name — `projects/ui-kit-v2/src/lib/components/file-card/stories/component/test-file-card-matrix.component.ts:names`. The widths of the cells are taken by a measurement. Scenario `SC-UKV-141`

## What no check counts here

A width limit without the fate of what does not fit is invisible to the linter, to the build and
to a component test: the markup holds the whole text, and the clipping belongs to the browser. The
only thing that sees it is the run of the snapshots over a showing laid out on the long value, and
a measurement of the drawn node. So all five scenarios stand marked as not closed by a test, each
with its measured numbers.

The container sign stands on the overlay rather than on the host, and nothing counts that either.
Moved to the host, it would collapse the height of a component whose size comes from the consumer.
The frame of such a component would then be empty rather than red.
