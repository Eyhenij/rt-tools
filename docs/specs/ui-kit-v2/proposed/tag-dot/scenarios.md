# Scenarios — the dot appearance of the tag

The identifier goes at the start of the test title, followed by a dash.

### SC-UKV-1378 — the dot draws a circle without the label

Given a tag with the appearance `dot`
When it is drawn
Then no label text is visible, and the pill carries the dot modifier

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

### SC-UKV-1379 — the dot carries its value in the hint and the accessible name

Given a tag «Опубликовано» with the appearance `dot`
When it is drawn
Then the pill has the role `img`, its accessible name is «Опубликовано», it takes the keyboard focus,
and the hint carries the same value even though nothing overflowed

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

### SC-UKV-1380 — the dot draws neither the icons nor the cross

Given a tag with the appearance `dot`, an icon and the cross asked for
When it is drawn
Then neither icon nor the cross is in the markup

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

### SC-UKV-1381 — the dot stays a circle whatever the rounding input says

Given a tag with the appearance `dot` and the rounding step `sm`
When it is drawn
Then the pill keeps the full rounding of the dot rather than the step: the dot rule names the full
rounding itself and does not read the tag's rounding property

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.
