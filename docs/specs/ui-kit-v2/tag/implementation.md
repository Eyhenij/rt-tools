# What it is carried out by — the tag of the second kit

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **A tag without a label does not exist, and the label arrives by a required input.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.ts:value`
- **The palette is a closed set of meanings, and the default is the neutral one.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.model.ts:Severity`. The default stands at `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.ts:severity`
- **The palette is doubled by an attribute of the markup.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.html:data-severity`
- **The shape sets the rounding, and a rounding named apart beats the shape.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.scss:radius--full`. The shape assigns the property of the rounding, and the rules naming it stand below
- **The outlined appearance is declared below every palette.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.scss:appearance--outlined`
- **An icon stands on either side of the label, and both sides live together.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.ts:iconEnd`. Next to it stands `icon`, and the markup draws them on their own sides
- **The cross does not close the tag: it reports a press.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.ts:closed`
- **A press on the cross does not travel up.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.ts:onClose`
- **The label of the cross comes from the dictionary of the kit.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.ts:RT_KIT_LABELS`
- **The size is chosen by a step, not by a number in the place.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.ts:size`. The steps themselves stand at `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.scss:size--md`, and the step of the icon is led by `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.ts:ICON_BY_SIZE`
- **A label that did not fit its place is cut by an ellipsis and gets a hint with the whole value.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.scss:text-overflow`. The hint is attached by the ready-made directive of the kit at `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.html:rtTooltip`
- **The overflow is counted by watching the size of the box, not by a countdown after the drawing.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.ts:observeText`. The measurement itself stands next to it, at `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.ts:overflowing`
- **The styles of the tag live in the cascade layer of the kit's components.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.scss:layer`. The wrapper names the sublayer of the kit's components
- **The rules of the block are nested inside the host.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.scss:rt-tag`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
