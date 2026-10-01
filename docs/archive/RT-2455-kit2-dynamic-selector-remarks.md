# Grill

## The owner request

> замечания 1 при драге фон прозрачный, кнопки квадратные (нужно опционально по умолчанию круглые), при нажатии добавить попап открывается вдали от кнопки

The owner looked at the showcase before the PR and answered «Ок, открывай».

## Decisions

- **Round buttons by default, through one rounding input of the selector** — the owner: «опционально
  по умолчанию круглые»; the step comes from the shared scale main brought. Rejected: a shape input
  of its own — main folded such inputs into `radius`.
- **The popup opens from the add button pressed** — each of the two add buttons carries the popover
  itself. Rejected: an origin input on the popover — the popover anchors to its host by design.

## Decisions along the way

- **The row in flight is fixed outside the cascade layer** — CDK resets `background`, `color` and
  `padding` of `.cdk-drag-preview` in its layer `cdk-resets`, which comes after the kit's layer and
  wins. The grill planned a background element inside the preview; a rule outside the layer turned
  out to be enough.
- **Nine frames moved by the main merge are retaken in this branch** — main changed the width of the
  theme pair halves on the showcase and the default rounding of icon buttons, and the epic's frames
  of the side menu, the aside, the expansion panel, the cropper and the table cards diverged. The
  owner: «Переснять здесь».
