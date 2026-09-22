# Grill

## The owner request

> Запрос: иконки удаления и перетаскивания в избранном бокового меню задаются снаружи
>
> Где: @rt-tools/ui-kit 0.8.0, RtuiSideMenuFavoritesComponent (строки группы избранного в
> rtui-side-menu).
>
> Сейчас иконки прописаны в шаблоне кита: «убрать из избранного» (`side-menu-favorite-remove`) —
> `remove`, без поворота; ручка перетаскивания (`side-menu-favorite-handle`) — `arrows_outward`,
> `rotate(90deg)` в `.rtui-side-menu-favorites__handle-icon`. `IRtuiSideMenuSettingsConfig` задаёт
> только `storageKey` и `labels`. Приложение не может сменить ни глиф, ни поворот.
>
> Что нужно: добавить в `IRtuiSideMenuSettingsConfig` поле `icons`, по образцу `labels`:
> `IRtuiSideMenuFavoritesIcon { glyph: string; rotate?: number }` (градусы, по умолчанию 0),
> `IRtuiSideMenuFavoritesIcons { remove; drag }`, `icons?: Partial<IRtuiSideMenuFavoritesIcons>`.
>
> Требования:
>
> - Значения по умолчанию равны текущим: remove — `{ glyph: 'remove' }`, drag —
>   `{ glyph: 'arrows_outward', rotate: 90 }`. Приложение без icons видит то же, что сейчас.
> - Поворот задаётся числом из icons.drag.rotate, а не жёстким transform в SCSS.
> - RtuiSideMenuSettingsService отдаёт итоговые иконки так же, как labels: приложение рисует ими
>   те же кнопки в своих галереях и не держит второй копии значений.
> - Задать можно одну иконку из двух; вторая остаётся по умолчанию.
>
> Проверка:
>
> 1. Без icons разметка и вид не меняются.
> 2. С icons.remove = { glyph: 'delete' } кнопка удаления рисует корзину, подсказка остаётся
>    labels.remove.
> 3. С icons.drag = { glyph: 'drag_indicator', rotate: 0 } ручка рисует этот глиф без поворота.

> заведи тикет и ветку бери в работу сразу

> на удаление по умолчанию мусорка

The request names the consuming application; the tree does not name consumers, so it is written
here as "the application".

## What the tree already has

- `projects/ui-kit/src/lib/ui-kit/side-menu/settings/rtui-side-menu-settings.service.ts` — the
  config, `DEFAULT_LABELS`, the service's `labels` merged from the config with blank values
  dropped (`#definedLabels`).
- The remove button lives in `menu-sub-item/rtui-side-menu-sub-item.component.html`
  (`favorite-icon`, glyph `remove`); the handle in `favorites/rtui-side-menu-favorites.component.html`
  (`handle-icon`, glyph `arrows_outward`), turned by `transform: rotate(90deg)` in its styles.
- The spec of the feature — `docs/specs/ui-kit/side-menu-favorites/`, scenarios up to SC-UK-120.

## Questions and answers

**The request keeps `remove` as the default glyph; which glyph is the default for removing?**
на удаление по умолчанию мусорка — the default becomes `delete`, the trash can. An application
without `icons` therefore sees the trash can instead of the minus: the first check of the request
changes accordingly.

## Decisions

- **A blank glyph counts as absent**, the same as a blank label: otherwise the button would draw
  nothing.
- **The rotation is bound as a style value in degrees from the service**, and the styles keep no
  turn of their own — the request asks for the number, not for a class.
- **The first kit's references are taken from the runner's frame** — the pattern
  `ui-component-tests-visual`: the first kit's frames are matched only in the pipeline.

## What is left unclear

- Nothing blocks the work.
