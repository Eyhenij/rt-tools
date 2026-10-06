# Grill

Task RT-2569 · the request — the PR into the epic branch RT-2528 · merged —

## The owner request

> добавь непрозрачную подложку под селектор языков и переключатель тем, чтобы облако точек не накладывалось на эти элементы

> back to login показывай без символа шеврона, показывай просто строкой

> показывай селектор языка и переключатель тем прямо в карточке формы логина/регистрации/восстановления, то есть пееренеси из угла экрана в саму карточку с формой

## What the tree already has

- The language list and the theme switch stand in `login__chrome`, pinned by the kit to the top
  right corner of the window: `projects/ui-kit-v2/src/styles/_login.scss`.
- The frame of every theme page draws the chrome and the card next to each other:
  `projects/auth-keycloak-theme/src/login/shell/rt-kc-root.component.html`.
- «Back to Login» and «Back to Application» come from the Keycloak messages `backToLogin` and
  `backToApplication`, which start with `&laquo;`. The theme turns entities into characters in
  `projects/auth-keycloak-theme/src/login/kc-i18n.ts`.

## Questions and answers

**The plate under the switches.**
The owner asked for it first and then moved the switches into the card. The plate is dropped: in the
card the dots do not reach the switches.

**Back to Login.**
«показывай просто строкой» — the link text without the chevron.

## Decisions

- **The switches stand in the first row of the card, on its right edge, above the realm name.** —
  the owner's word «в саму карточку с формой»; every page of the theme has the same card.
- **The kit keeps its pinned `login__chrome`; the theme cancels the pinning for its card.** — the kit
  block serves other consumers.
- **The chevron is removed from the start of the two «back» messages only.** — other messages keep
  their characters. Rejected: stripping «» from every message — a quote in a message would be lost.
- Question closed by assumption: the behaviour changes — the theme spec rules change.

## What is left unclear

- Nothing blocks the work.

## Decisions along the way

- **The plate under the switches is dropped.** The owner moved the switches into the card after
  asking for the plate. Affected stage of the plan: 1.
- **The switches are pinned to the top right corner of the card, and the card's top padding grows
  to 80px.** In the flow of the card they took a row of their own and pressed the realm name;
  pinned, they sit in the padding, 20px above the name. Affected stage of the plan: 1.
- **Scenario numbers 64 and 65.** Number 63 went to the plate, which was committed in a branch that
  never left the machine. Affected stage of the plan: 1.
