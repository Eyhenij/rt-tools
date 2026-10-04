# Grill

## The owner request

> - 51: --rt-image-upload-download-size, --rt-image-upload-download-icon-size;
> - 52: --rt-image-upload-download-blur;
> - 53: chooseAppearance, chooseIcon;
> - 54: vertical-align: top у .rt-image-upload__preview.
>
> глянь еще правки в кит

These are items 51–54 of the consumer's migration request from the first kit to the second, whose
items 1–47 the epic RT-2472 covered. The owner's standing words for that request: «проанализируй,
важно правки не должны сломать второй кит» and «делай не так как просят а так как лучше».

## What the tree already has

- `rt-image-upload` draws the download button as `rt-icon-button`: its size comes from the button's
  public `--rt-icon-button-size`, else the `md` step; the icon size is a button input in steps.
- The blur under the download button is written as `8px` in the styles.
- The choose button of the empty uploader is `rtButton` with the `outlined` look and the
  `ico-upload` icon, both written in the template.
- The preview is `inline-block` on the baseline: measured in the showcase story Applied, the drop
  zone is 420 px tall around a 416 px preview — a 4 px gap under the picture.
- `rt-icon` sets its size by an inline style, so no CSS property can override it.

## What the rules already say

- A component's own property is declared in the block's root with the step that stood in that
  place as its default; four families are judged by the token check, blur is not among them.
- A new input of a kit component keeps today's behaviour by default.

## Questions and answers

**Take the task from main with these decisions: the icon size by an input, not a property; the
4 px gap fixed at once with the uploader frames re-taken?**
Да, бери (Recommended)

## Decisions

- **The download button size is the uploader's property `--rt-image-upload-download-size`.** It
  is handed to the button as its public size; unset, the button keeps its step.
- **The download icon size is the input `downloadIconSize`, not a property.** The icon writes its
  size inline, and a property would silently do nothing. Rejected: a property.
- **The blur is the uploader's property `--rt-image-upload-download-blur`, 8 px by default.**
- **`chooseAppearance` and `chooseIcon` default to today's `outlined` and `ico-upload`.**
- **The gap under the preview is removed without a switch.** Nobody designed it, and a consumer
  has nothing to do with it. Rejected: a property keeping the gap by default.

## What is left unclear

- Nothing.
