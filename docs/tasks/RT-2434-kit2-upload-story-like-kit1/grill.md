# Grill

## The owner request

> в первом ките нормальная сторис у тебя куча хуеты и нет того что нужно как в сторе первого кита

Said on 30 September 2026 while the owner compared the image uploader of the second kit with the
first kit's story.

## What the tree already has

- The first kit's story `Components/ImageUpload` shows one live uploader with the current picture
  and a round button in the corner; `ImageCropper` reaches the cropper by uploading a file into the
  uploader's field.
- The second kit's uploader already holds all of it: `imageUrl` shows the current picture,
  `downloadable` adds the corner button, a press on the picture opens the file choice, then the
  cropper with «Отмена» and «Применить».
- Its `Playground` wrapped the uploader in a drop zone scenario with two demo buttons, a caption and
  a summary line.

## What the rules already say

- `rt-tools-storybook`: the arg-driven page is called `Playground` everywhere; a story targets the
  wrapper; the matrices `States`, `Presets`, `Themes` stay.
- `reuse-first`: the ready-made uploader is shown as is, nothing new is drawn for the showcase.

## Questions and answers

No question was put: the owner named the sample — the first kit's story.

## Decisions

- **`Playground` shows the bare uploader with the first kit's picture** — the owner compares the two
  stories side by side. Rejected: keeping the demo buttons, the owner named them the surplus.
- **`Cropping` and `Applied` reach their state by a file put into the uploader's own field** — the
  way the first kit's story does it and the way a person chooses a file.
- **The matrices stay** — the coverage contract of the second showcase demands them.

## What is left unclear

- Nothing that blocks the work.
