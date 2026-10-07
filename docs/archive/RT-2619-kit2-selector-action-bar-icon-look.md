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

> Запрос в ui-kit-v2: rt-icon
>
> 1. Добавить вход glyphStrategy: 'map-first' | 'font' на экземпляре. Он перекрывает
>    RT_ICON_GLYPH_STRATEGY для этой иконки.
> 2. Добавить токены осей глифа и подставить их в font-variation-settings у .rt-icon__glyph:
>     - --rt-icon-glyph-weight (по умолчанию 400);
>     - --rt-icon-glyph-grade (по умолчанию 0);
>     - --rt-icon-glyph-opsz (по умолчанию 24);
>     - FILL остаётся от входа fill.
> 3. Добавить во вход color значение primary: var(--rt-icon-color-primary, var(--rt-color-primary)).
> 4. Добавить во вход color значение disabled: var(--rt-icon-color-disabled, var(--rt-color-text-disabled)).
> 5. Сделать цвета переопределяемыми токенами, по образцу muted:
>     - danger: var(--rt-icon-color-danger, var(--rt-color-state-danger));
>     - success: var(--rt-icon-color-success, var(--rt-color-state-success));
>     - info: var(--rt-icon-color-info, var(--rt-color-state-info));
>     - warning: var(--rt-icon-color-warning, var(--rt-color-state-warning));
>     - inverse: var(--rt-icon-color-inverse, var(--rt-color-text-inverse)).
> 6. Брать ступени размера из токенов --rt-icon-size-xs, -sm, -md, -lg, -xl, -2xl с текущими
>    значениями по умолчанию, а не из зашитых px. Добавить ступени 3xl и 4xl.

> включи в текущую задачу по правкам динамик селектора динамик инпута и экшен бара

> Запрос в кит: rt-dynamic-selector-popup
>
> 1. Убрать display: block у .rt-dynamic-selector-popup__search. Сейчас он перебивает inline-flex у
>    rt-input: лупа стоит без зазора с текстом, поле не растягивается, крестик сброса оказывается
>    посередине и у верхнего края.
> 2. Добавить вход searchAppearance, передавать его в rt-input поиска. rt-dynamic-selector
>    пробрасывает свой searchAppearance в окно.
> 3. Добавить токены окна:
>     - --rt-dynamic-selector-popup-bg
>     - --rt-dynamic-selector-popup-min-height
>     - --rt-dynamic-selector-popup-padding
>     - --rt-dynamic-selector-popup-foot-border-width
>     - --rt-dynamic-selector-popup-nav-color
>     - --rt-dynamic-selector-popup-button-height
>     - --rt-dynamic-selector-popup-button-font-size
>     - --rt-dynamic-selector-popup-empty-icon-size
>     - --rt-dynamic-selector-popup-empty-icon-wrap-bg
>     - --rt-dynamic-selector-popup-empty-text-size
>     - --rt-dynamic-selector-popup-empty-text-weight
>     - --rt-dynamic-selector-popup-empty-text-color
> 4. Объявлять умолчания токенов через var(--token, <умолчание>) в самих свойствах, а не
>    присваиванием на .rt-dynamic-selector-popup. Иначе значение, заданное на предке
>    (cdk-overlay-pane, cc-selector), до окна не доходит.

> глянь еще это в этой ветке

> важно не допустить регрессий и изменения дефолтной втьюхи второго кита

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

- **The rt-icon list joins this task by the owner's later word.** The plan gets a sixth stage
  appended under its own line; the five written stages stay as they were.
- **`primary` takes `--rt-color-action-primary-on-surface`.** The kit has no `--rt-color-primary`;
  the brand colour drawn over a surface is the role the text button paints its label with. Named
  in the PR.
- **The size steps become handles whose defaults are the kit size scale:** `xs` 12, `sm` 16, `md`
  20, `lg` 24, `xl` 32, `2xl` 40 — the same pixels as before — and the new `3xl` 48 and `4xl` 64,
  the next steps of the scale. A number on the input stays pixels.

- **The optical size of the ligature defaults to the side of the icon, not to 24.** Without the
  axis in the font settings the browser took the optical size from the font size; a fixed 24 would
  move every unpaired glyph not drawn at 24 pixels, and the owner asked for no change of the
  default look. At the `lg` step it is the 24 of the request. Named in the PR.
- **The popup items 1–3 were already done by stage 1; item 4 turns all seventeen popup properties
  into handles,** the five former ones among them, so that the popup reads from an ancestor the
  same way whatever property is set. Defaults stay as they were.

## What is left unclear

- Nothing blocks the work.

## Decisions along the way

- **The add button colour is a consumer handle, its weight, indent, row padding and reset colour are
  declared on the list.** The add button is projected by two hosts with different looks — secondary
  on the selector, primary on the input — so one declared default would repaint one of them.
  Affected stage: 1.
- **The empty-state title colour got a property of its own.** Item 19 needs something to set, and the
  empty state painted its title by a step in place. Affected stage: 1.
- **The close button size goes through the icon button's own step, not `--rt-icon-button-size`.**
  That name is the application's handle; declared by the kit it made the icon button's fallback a
  refusal of the token graph. Affected stage: 4.
- **A Material font glyph without a kit pair keeps its step size.** `rt-icon` writes the glyph size
  as an inline style; the bar sizes the icon box by min and max, as the empty state does. Named in
  the PR. Affected stage: 4.
- **The fetch script rewrites every Material drawing unformatted; only the new trash-x pair is
  kept.** The rest differ from the tree by formatting alone. Affected stage: 2.

- **The plan got a sixth stage appended, not rewritten.** The owner added the rt-icon list to this
  task after the plan was written; the step check matches the plan and the progress line by line,
  so the new steps stand in both. The five written stages are untouched. Affected stage: 6.
- **The empty result of the popup lost `display: block` too.** It broke the empty state's centred
  stack the same way the search lost its layout: the icon stood at 90 against the block's centre at
  201; after the edit both are 201. Affected stage: 5.
- **The ancestor wrapper in the bar story is `display: contents`.** As a box it took the width of
  its content and the bar stopped wrapping inside the 30rem cell; without a box the cell gives the
  bar its width and the ancestor properties still inherit. Affected stage: 5.

- **`size()` of the icon keeps the step or the pixels, and the CSS length is a computed of its
  own.** A CSS string in the public input broke the kit's specs reading it as a number; the step is
  the meaningful value to a reader. Eighteen expectations of neighbouring specs moved from pixels
  to the step property; two data-table specs took `pets` as the unpaired name, since
  `delete_forever` now has the pair `trash-x`. Affected stage: 6.
- **The optical size of the ligature defaults to the icon side** — see the grill. Affected stage: 6.
