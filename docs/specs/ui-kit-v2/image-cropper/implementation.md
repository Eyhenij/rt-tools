# What it is carried out by — the image cropper

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The source is fitted into the field whole, keeping its proportions, and centred.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.logic.ts:fitSource`, the field measured in `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts:#observe`; scenario `SC-UKV-383`
- **The source is read the way its EXIF data turns it.** — the browser turns it: `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts:#ready` takes the turned natural size, the canvas in `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts:#emitResult` draws the turned picture; scenario `SC-UKV-384`
- **The frame starts as the largest one the ratio allows, centred on the source.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.logic.ts:initialFrame`; scenario `SC-UKV-385`
- **The frame never leaves the source.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.logic.ts:moveFrame`, `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.logic.ts:resizeFrame`; scenario `SC-UKV-386`
- **The frame is never smaller than the least size.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.logic.ts:resizeFrame`; scenario `SC-UKV-387`
- **A drag inside the frame moves it; a drag of a handle stretches it from that handle.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts:#change`, `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.logic.ts:handleDirection`; scenario `SC-UKV-388`
- **A frame with a ratio keeps it under every stretch.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.logic.ts:frameRatio`, `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.logic.ts:resizeFrame`; scenario `SC-UKV-389`
- **The frame and each handle are reached by the keyboard, and the arrows move or stretch them.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.logic.ts:keyDelta`, `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts:onKeyDown`; scenario `SC-UKV-390`
- **The pointer and the finger act the same.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts:onPointerDown` captures the pointer of either kind; scenario `SC-UKV-391`
- **The result is given once the source is read and after every finished change of the frame, not during a drag.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts:onPointerUp`, `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts:#ready`; scenario `SC-UKV-392`
- **The result is a file of the chosen format and quality, cut out in the pixels of the source.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.logic.ts:cropArea`, `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.logic.ts:resultType`, `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.logic.ts:resultQuality`, `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts:#emitResult`; scenario `SC-UKV-393`
- **The round look is a mask on the screen, and the result stays the square the frame cuts.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.logic.ts:frameRatio`, the mask by the modifier in `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.scss`; scenario `SC-UKV-406`
- **An empty cropper shows the placeholder, the application's own text or the kit's label.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts:placeholderText`; scenario `SC-UKV-410`
- **A source that cannot be read gives the refusal and no frame.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts:#refuse`; scenario `SC-UKV-407`
- **An unavailable cropper changes the frame neither by the pointer nor by keys.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts:onPointerDown`, `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts:onKeyDown`; scenario `SC-UKV-408`
- **The handles and the frame name themselves to the assistive means.** — `projects/ui-kit-v2/src/lib/components/image-cropper/rt-image-cropper.component.ts:HANDLE_LABELS`, the labels in `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts`; scenario `SC-UKV-409`
