# What it is carried out by — the download button, the choose button and the preview of the image uploader

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The download button takes its size from the uploader's property, and keeps its step without it.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.scss:rt-icon-button-size-step` — scenario `SC-UKV-631`
- **The download icon takes its size from the uploader's input, and from the button size without it.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:downloadIconSize` — scenario `SC-UKV-632`
- **The blur under the download button comes from the uploader's property.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.scss:backdrop-filter` — scenario `SC-UKV-633`
- **The choose button takes its look and icon from the uploader's inputs.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:chooseAppearance`, `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:chooseIcon` — scenario `SC-UKV-634`
- **The preview stands on the top of its line, with no gap under the picture.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.scss:vertical-align` — scenario `SC-UKV-635`
- **Without the new values the uploader draws as before, apart from the gap.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.html:chooseAppearance` — scenario `SC-UKV-636`
