# What it is carried out by — the image uploader

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The place shows one state: loading, the cropper, the image or the drop zone.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.logic.ts:uploadState`, `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:state`; scenario `SC-UKV-411`
- **Without an image and a source the place is the drop zone.** — the default branch of `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.html`, `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:pick`; scenario `SC-UKV-412`
- **A chosen or dropped image file opens the cropper in the same place.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:choose`, `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.logic.ts:isImageFile`; scenario `SC-UKV-413`
- **«Apply» makes the last result the image and gives the file to the application.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:apply`, `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:#applyResult`; scenario `SC-UKV-414`
- **«Cancel» drops the source and returns the place to what it was.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:cancel`; scenario `SC-UKV-415`
- **With auto apply there are no buttons, and every result of the cropper is applied at once.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:onCropped`; scenario `SC-UKV-416`
- **A press on the image chooses another file.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:pick`, `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:onSpace`, `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:hint`; scenario `SC-UKV-417`
- **The download button saves the current image under the file name.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:download`; scenario `SC-UKV-418`
- **The download button reaches past the picture's top right corner, round or square.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:downloadShape`, the place in `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.scss`; scenario `SC-UKV-489`
- **An unavailable uploader changes nothing.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:choose`, `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:pick`; scenario `SC-UKV-419`
- **While the application loads, the place shows the kit's spinner.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.logic.ts:uploadState`; scenario `SC-UKV-420`
- **Every text of the uploader is a key of the kit's labels.** — `projects/ui-kit-v2/src/lib/components/image-upload/rt-image-upload.component.ts:hint`, the labels in `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts`; scenario `SC-UKV-421`
