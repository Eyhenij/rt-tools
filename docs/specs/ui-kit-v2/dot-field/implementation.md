# What it is carried out by — the dot field

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **The field fills its positioned parent and stays behind the content.** — `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.component.scss:inset`. The canvas is hidden at `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.component.html:aria-hidden`
- **A cell is lit where the moving noise passes a threshold that a 4x4 Bayer matrix breaks per cell.** — `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.logic.ts:isDotLit`
- **The dots thin out in the clearing.** — `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.logic.ts:dotDensity`
- **The colour of the dots is the computed `color` of the field, read on every frame.** — `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.painter.ts:fillStyle`
- **A frame is drawn every 90ms, not on every animation frame.** — `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.logic.ts:DOT_FIELD_FRAME_MS`
- **With `prefers-reduced-motion: reduce` one frame is drawn and no other is planned.** — `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.painter.ts:prefers-reduced-motion`
- **The drawing starts after the first render in the browser and stops when the field leaves the page.** — `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.component.ts:afterNextRender`
- **A canvas without a 2D context draws nothing and plans nothing.** — `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.painter.ts:start`
- **The field follows the size of its parent and the density of the screen's points.** — `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.painter.ts:devicePixelRatio`
- **The styles of the field live in the cascade layer of the kit's components.** — `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.component.scss:layer`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
