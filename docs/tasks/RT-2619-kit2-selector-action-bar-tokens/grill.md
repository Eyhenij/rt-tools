# Grill

Task RT-2619 · the request — the owner's three messages in chat, 7 October 2026.

## The owner request

> после пуша нужно сделать задачу вне эпика, заведи тикет и бери в работу

> Исправить в ките:
>
> 1. .rt-dynamic-selector-popup__search: убрать display: block, сейчас он ломает раскладку rt-input.
>
> Добавить входы в rt-dynamic-selector:
>
> 2. invitationButtonIcon: IRtIcon.Name | null
> 3. invitationButtonAppearance: 'flat' | 'outlined' | 'text'
> 4. clearIcon: IRtIcon.Name
> 5. searchAppearance (пробросить в rt-input окна)
> 6. emptyResultsText: string
>
> Добавить токены в rt-dynamic-selector-popup:
>
> 8. --rt-dynamic-selector-popup-bg
> 9. --rt-dynamic-selector-popup-min-height
> 10. --rt-dynamic-selector-popup-padding
> 11. --rt-dynamic-selector-popup-foot-border-width
> 12. --rt-dynamic-selector-popup-nav-color
> 13. --rt-dynamic-selector-popup-button-height
> 14. --rt-dynamic-selector-popup-button-font-size
> 15. --rt-dynamic-selector-popup-empty-icon-size
> 16. --rt-dynamic-selector-popup-empty-icon-wrap-bg
> 17. --rt-dynamic-selector-popup-empty-text-size
> 18. --rt-dynamic-selector-popup-empty-text-weight
> 19. --rt-dynamic-selector-popup-empty-text-color
>
> 20. --rt-dynamic-selector-list-row-padding-x
> 21. --rt-dynamic-selector-list-add-color
> 22. --rt-dynamic-selector-list-add-font-weight
> 23. --rt-dynamic-selector-list-add-indent
> 24. --rt-dynamic-selector-list-reset-color
>
> Добавить токен в rt-empty-state:
>
> 25. --rt-empty-state-description-size

Item 7 of the first list: the icon `delete_forever` in the kit icon set.

> добавь в задачу по правкам стилей динамик селектора во втором ките
>
> Запросы в кит для rt-action-bar:
>
> Исправить:
>
> 1. Умолчания --rt-action-bar-* и --rt-action-bar-holder-* присваиваются на самих .rt-action-bar и
>    .rt-action-bar-holder, поэтому заданное на предке не доходит. Объявлять их в свойствах через
>    var(--rt-action-bar-x, <умолчание>).
>
> Добавить в IRtActionBar.Action:
>
> 2. glyph?: string: имя Material-иконки, передаётся в rt-icon [glyph] в полосе и в rt-menu-item
>    вложенного списка.
>
> Добавить токены в rt-action-bar:
>
> 3. --rt-action-bar-action-height
> 4. --rt-action-bar-action-font-size
> 5. --rt-action-bar-icon-size
> 6. --rt-action-bar-icon-gap
> 7. --rt-action-bar-counter-font-size
> 8. --rt-action-bar-close-size
> 9. --rt-action-bar-close-icon-size
>
> Добавить вход в rt-action-bar или rt-action-bar-holder:
>
> 10. closeIcon: IRtIcon.Name: сейчас close зашит в шаблон.
>
> еще глянь динамик инпут замечания на основе динамик селектора

> ты уже заводил задачу на правки динамик селектора включи это все в один тикет и задачу?

## What the tree already has

- `rt-dynamic-selector` draws the invitation button as `rtButton appearance="outlined"` with no
  icon, the clear button of the list as `rt-icon-button icon="close"`, the popup search as
  `rt-input` without an appearance, the empty result as `rt-empty-state` with the kit label.
- `rt-dynamic-input` shares the list (`rt-dynamic-selector-list`) and the invitation with the
  selector, and has its own field `rt-input`.
- The popup declares five properties of its own on its block; the list declares five; the empty
  state declares its own set. Paddings, the foot border, the nav colour and the empty look are
  written by kit steps in place.
- `rt-action-bar` declares fifteen properties on its block and the holder four; the action menu
  already reads its own properties with a fallback (`-default` on the block), because the menu lies
  in an overlay.
- `IRtActionBar.Action` has `icon?: IRtIcon.Name`; `rt-icon` and `rt-menu-item` already take
  `glyph`. The close button is `icon="close"` in the template.
- The icon set has `trash` and `ico-trash`; the Material map names `delete_forever` with no pair:
  «корзины с крестом в наборе нет — нужен рисунок».
- The kit button's appearances are `filled | outlined | text`; the field's are `outline | fill`.
- Specs: `docs/specs/ui-kit-v2/dynamic-selectors/`, `docs/specs/ui-kit-v2/action-bar/`.

## What the rules already say

- `rt-tools-styling-tokens`: a reference to a kit token goes without a fallback; a fallback stands
  only on a consumer handle, and a handle is listed in `tools/tokens-handles.json` and in the
  «Consumer handles» section of `Theming.mdx`.
- Memory «Запрос приложения — как лучше»: an application request is done the way that does not
  break the kit, and the divergence is named in the PR.
- The consumer application is never named.

## Questions and answers

**Is the dynamic selector work already a task? Put everything in one.**
«включи это все в один тикет и задачу» — one task, RT-2619, holds the selector list, the action-bar
list and the dynamic-input remarks.

## Decisions

- **The action-bar properties become consumer handles, as the menu of the same bar already does.**
  The owner's `var(--rt-action-bar-x, <умолчание>)` is exactly that form; the tokens rule allows a
  fallback only on a handle, so each name goes into `tools/tokens-handles.json` and `Theming.mdx`.
  Rejected: declaring the defaults on `:root` — a value computed on the page root does not follow a
  theme switched on a section.
- **`invitationButtonAppearance` takes the kit button type `IRtButton.Appearance`.** The owner's
  «flat» is the kit's `filled`; a second name for one look would split the kit. Named in the PR.
- **`searchAppearance` takes `IRtInput.Appearance`.** The field's own type, passed into the popup.
- **The icon for `delete_forever` is drawn as `trash-x`: the frame trash with a cross instead of the
  bars, and the Material map gets the pair.** `clearIcon` keeps `close` by default.
- **The dynamic input gets the remarks that apply to it:** `invitationButtonIcon`,
  `invitationButtonAppearance`, `clearIcon` and `fieldAppearance` for its own field. The list
  tokens reach it through the shared list. `emptyResultsText` does not apply: it has no popup.
- **The popup, list and empty-state properties stay declared on their blocks**, like every other
  kit component: the owner asked for new names there, not for handles.

## What is left unclear

- Nothing blocks the work.
