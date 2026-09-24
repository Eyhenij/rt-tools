# Grill

## The owner request

> rtui-side-menu: избранное сворачивается, скрытые кнопки строки не занимают ширину
>
> Версия: 0.9.0. Потребитель: [приложение] (избранное включено в трёх разделах, у пунктов визуалов есть iconButton +).
>
> 1. Сворачивание блока «Избранное»
>
> - Заголовок rtui-side-menu-favorites__title сделать кнопкой-переключателем, как заголовок папки rtui-side-menu-expand-sub-item: шеврон справа, в одном столбце со звёздами (тот же сдвиг, что у --favorites .mat-expansion-indicator).
> - Клавиатура: заголовок в порядке Tab, Enter/Space переключают, aria-expanded, aria-controls → список.
> - Состояние хранить в RtuiSideMenuSettingsService, в той же записи под menuId: новое поле (например favoritesCollapsed?: boolean) в ISideMenu.Settings, со своим сигналом и методом записи.
> - Состояние отдельно для каждого раздела полосы: избранное включается на уровне пункта (Item.favorites), и у одного пункта полосы оно может быть свёрнуто, а у другого развёрнуто. Предложение: favoritesCollapsed?: Item['id'][].
> - По умолчанию блок развёрнут. Черта-разделитель под блоком остаётся и в свёрнутом виде.
> - В свёрнутом виде показывать число пунктов в заголовке (Favorites (5)) — по желанию кита.
> - В режиме поиска (subMenuQuery) при совпадении внутри свёрнутого блока блок раскрывается на время поиска, сохранённое значение не меняется.
> - Узкий экран (narrow(), .rtui-mobile-side-menu-list__sub) ведёт себя так же.
> - Подпись для aria-label переключателя — новые ключи в IRtuiSideMenuFavoritesLabels (expand, collapse).
>
> 2. Скрытые кнопки строки не отнимают ширину у подписи
>
> - Сейчас __favorite (звезда / «убрать») и rtui-side-menu-favorites__handle спрятаны через opacity: 0, и подпись обрезается многоточием на ~32 px на каждую невидимую кнопку, хотя справа пусто.
> - Нужно: в покое кнопка не занимает ширину, подпись идёт до правого края (или до iconButton, он виден всегда). Под наведением и :has(:focus-visible) строки кнопки появляются, подпись сжимается.
> - Требования:
>     - кнопка остаётся в порядке Tab (не display: none и не visibility: hidden); допустимо width: 0; overflow: hidden или абсолютное позиционирование поверх края подписи с подложкой-градиентом;
>     - закрашенная звезда (--on), --always (узкий экран) и @media (hover: none) — как сейчас: занимают место всегда;
>     - при появлении кнопок высота строки и позиция иконки пункта не меняются, сдвигается только правый край подписи;
>     - строка в руке (.cdk-drag-preview) держит кнопки видимыми, как сейчас.
> - Лучше дать это входом/токеном (например --rt-side-menu-favorite-actions-reserve: none | always), а не менять поведение для всех потребителей молча.
>
> 3. Попутно (есть обход в [приложение] через CSS)
>
> - Флаг на пункте, который отключает звезду (Item.favoriteDisabled?: boolean). Сейчас [приложение] прячет звезду у Dashboard, Create и корня раздела правилом по id через ::ng-deep .rtui-side-menu-sub-item-title__favorite.

The consumer's name is replaced by «[приложение]»: the tree does not name the kits' consumers.

## What the tree already has

- The subdomain spec `docs/specs/ui-kit/side-menu-favorites/` with the prefix `SC-UK`; the last
  issued number is 124.
- Task #2327 already held point 3 with the flag name `favorite?: boolean`; points 1 and 2 were added
  to it, because one change closes all three.
- The favourites block is not drawn at all while the search holds text: the search belongs to the
  section.
- The submenu panel lies inside the menu host, so a mark on the host reaches every row except the
  dragged one, which CDK moves to the overlay.

## What the rules already say

- The consumers of the kits are not named in the tree texts (`doc-style`).
- Work outside an epic exists only by the owner's word about that work: #2327 carries it.

## Questions and answers

**Which task to take?**
The request above, sent as the answer.

## Decisions

- **Points 1–3 go in one task #2327** — one change closes all three. Rejected: a new task for 1–2,
  a duplicate of the same work.
- **The flag is named `favoriteDisabled`, as in the request** — the owner's latest word. Rejected:
  `favorite?: boolean` from the old task body.
- **The collapsed state is `favoritesCollapsed?: Item['id'][]`** — the ids of the strip items whose
  block is collapsed, the owner's proposal.
- **The search needs no code** — the block is not drawn while the search holds text, so the stored
  value is never changed by it.
- **The collapsed title shows the count** — the request leaves it to the kit; the count tells the
  person the block is not empty.
- **The width reserve is a menu input `favoriteActionsReserve: 'always' | 'none'`, default
  `'always'`** — the behaviour of the other consumers does not change. Rejected: a custom property
  with a keyword value: styles branch on it only by style queries, which not every browser has.

## What is left unclear

- Nothing blocks the work.
