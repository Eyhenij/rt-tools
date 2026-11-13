# What it is carried out by — the remove button and the place of the buttons of the image uploader

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The remove button is drawn only when its input is on and the uploader holds a picture.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:removable` — scenarios `SC-UKV-1256`, `SC-UKV-1257`
- **A press on the remove button tells the application and changes nothing in the uploader.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:removed` — scenario `SC-UKV-1258`
- **An unavailable uploader shows no remove button.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:showRemove` — scenario `SC-UKV-1259`
- **The remove button is hidden until the pointer is over the preview or the focus is inside it, and is always shown on a touch screen.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.scss:focus-within` — scenario `SC-UKV-1260`
- **The remove button takes its label from the labels of the kit.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.html:uiRemove` — scenario `SC-UKV-1257`
- **The visibility input shows both buttons always or hides both until the pointer or the focus, and changes nothing without it.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:buttonsVisibility` — scenarios `SC-UKV-1265`, `SC-UKV-1266`
- **The buttons stand at the corner the uploader's input names, the top right one without it.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:buttonsCorner` — scenario `SC-UKV-1261`
- **The buttons reach past the picture's corner, and stand inside the picture when the look input says so.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:buttonsPlacement` — scenario `SC-UKV-1262`
- **The remove button stands at the corner itself, and the download button next to it.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.scss:row-reverse` — scenario `SC-UKV-1263`
- **The remove button shares the size, the shape, the backing and the blur of the download button.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:downloadRound` — scenario `SC-UKV-1264`
- **Without the new inputs the uploader draws as before.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:hasButtons` — scenario `SC-UKV-1256`
