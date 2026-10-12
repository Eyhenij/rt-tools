# Grill

## The owner request

> делай

The word answers the proposal: carry the commits of rows 122–132 onto a fresh branch from main and
open a PR into main, author treble3d, reviewer Eyhenij. The question before it:

> ты открыл пр на правки запрос от апки?

And the next one, asked while the work was going on:

> если запаблишить мейн после пр с запросами и запаблишить все запросы апки там будут?

## What the tree already has

- PR #2647 of RT-2644 is merged into main by a squash; its head was `ea9e90965`. Task #2644 is
  closed, and the delivery guard refuses work behind a closed task.
- Seven commits of the branch `RT-2644-kit2-selector-popup-look` came after that head and are not in
  main: the first kit's look of the side menu (`be09487bc`) and rows 122–132 (`7941fc8d5`,
  `33ce4622f`, `298e4dc7b`, `fe34ee7af`, `26781ffa3`, `5469769fa`).
- The same branch carries the merges of the epic RT-2542, so a PR from it would bring the epic's
  unfinished trees into main.
- The application consumes the package built from that branch; it uses none of the epic's trees.

## What the rules already say

- Work behind a closed task is created as a new task.
- A commit lands with its final content; frames that came from another base are retaken.

## Questions and answers

None beyond the owner's word above.

## Decisions

- **The seven commits are picked onto a branch from main.** Rejected: a PR from the RT-2644 branch,
  which brings the epic along.
- **The four icon frames take main's side and are retaken.** The branch frames carry the epic's icons,
  which main does not have.

## What is left unclear

- Nothing blocks the work.

## The rows carried over, as the application asked for them

The rows came from the application's session on 9 October 2026. The application's name is replaced
by «приложение», its task number is left out.

**122.** Пара `folder` (и `folder.fill.svg`) в наборе `icons-material`. Сейчас при
`data-preset="material"` папка рисуется значком кита: в наборе Material нет `folder`, а
`rtSideMenuIcon` для имени кита не вызывается.

**123.** Значок строки и папки подменю: токен `--rt-side-menu-sub-item-icon-size` (v1 24; сейчас
`size="sm"` 16); заливка — вход меню `subItemIconFill: boolean = false` (v1 залитый), по образцу
`railIconFill`.

**124.** Заголовок папки:

- `--rt-side-menu-sub-item-folder-padding-start` (v1 12px; сейчас
  `--rt-side-menu-sub-item-padding-start` 16, тот же у строк-ссылок). Умножается на глубину так же,
  как у строки.
- `--rt-side-menu-sub-item-gap` между значком и подписью (v1 12; сейчас `--rt-space-sm` 8). Годится
  и строке, и папке.
- Цвет стрелки, доступный с `rt-side-menu-sub-item`: например, кит задаёт папке
  `--rt-expansion-panel-chevron-color: var(--rt-side-menu-sub-item-chevron-color, …)`. v1
  rgb(73,69,78).

Умолчания — нынешний вид.

**125.** Подсказка прокрутки в панели подменю. В v1 область прокрутки подменю шла с
`[isScrollHintShown]="true"`, как полоса и мобильное меню. Владелец заметил на низком экране:
длинный список подменю обрезан, и знака, что ниже есть ещё, нет. Нужно: `[isScrollHintShown]="true"`
у `panel-body`, как в v1. Если нужен выключатель, то вход меню `panelScrollHintShown` (по умолчанию
true, как в v1).

**126.** `.rt-side-menu__empty` («Nothing found»): токен `--rt-side-menu-empty-padding`, умолчание —
текущее `--rt-space-md`.

**127.** Строка подменю — это `<a [routerLink]>`: ссылка переходит сама, и потребитель не может взять
переход на себя. Cmd/ctrl-клик открывает две вкладки, обычный клик пишет лишнюю запись в историю.
Нужно: строка эмитит `clickSubMenuAction` до перехода и переходит сама только тогда, когда потребитель
не вызвал `event.preventDefault()`. `href` остаётся для средней кнопки и «копировать ссылку». Для
строк в блоке избранного то же.

**128.** Вход `subMenuCloseDelay` (в v1 по умолчанию 500 мс):

- панель, открытая наведением, закрывается через задержку после ухода указателя;
- если указатель за это время вернулся на панель, она остаётся открытой;
- пункт полосы без подпунктов закрывает панель с той же задержкой;
- пункт с подпунктами переключает панель сразу.

**133.** `rt-dynamic-selector` `#takeChosen` принимает эхо `chosenEntities` в другом порядке за
новый вход, и Reset гаснет. Родитель на `selectionChange` возвращает `chosenEntities` в порядке
каталога, а не в порядке `value`; сравнение с учётом порядка даёт false, и выполняется
`this.#initial.set([...keys])`. Нужно: в `#takeChosen` распознавать эхо по набору ключей
(`sameDynamicKeySet(keys, shown)`), а не по порядку. Тогда эхо не трогает ни `#initial`, ни `value`.
Строка пришла 9 октября 2026, когда PR #2748 был уже открыт; владелец: «в эту ветку по запросу
правки».

### Decisions on rows 122–128

| Question                    | Answer                                                                                                              | Reason                                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The defaults of 125 and 128 | the current look: the hint is off, the delay is zero                                                                | the owner's standing word: «важно не допустить регрессий и изменения дефолтной втьюхи второго кита»; the application sets the first kit's values by the inputs |
| The row click in 127        | the row keeps its `href` and navigates through the router itself, after the output, unless the output was prevented | the router's own link navigates before any handler of the row can run                                                                                          |
| A modified click in 127     | the browser keeps it, unless the consumer prevented it                                                              | a middle press and a press with a modifier open a tab by the address                                                                                           |

## Decisions along the way

- **The hint and the delay default to the current look.** The application asked for the first kit's
  values as defaults; the owner's word about the default look of the second kit comes first, and the
  application sets them by the inputs. Affected stage: 2.
- **The Material set got only the folder pair.** The fetch script redrew every existing Material icon
  from the newer drawings upstream; those files were put back, so the material look of the kit moves
  only where `folder` is drawn. Affected stage: 2.
- **Six frames were re-taken on purpose.** Four icon stories list the new pair, the material half of
  the empty state draws the Material folder, and the first kit look story got a fourth case with
  folders and the scroll hint. Affected stage: 3.
- **The look inputs moved to a base class next to the menu.** The menu class stood at 477 lines of
  500; the docs check now reads a base next to a component as part of its inputs. Affected stage: 2.
- **The close delay was measured live with page events.** The browser window was hidden, its timers
  tick once a second, and the driver took five seconds per move; the exact timing is held by the
  spec with fake timers. Affected stage: 3.
- **Rows 129–130 went into this task by the owner's word about new application rows.** The scroll
  area re-measures its hint at the end of a transition or animation in its body: an opened folder
  grows from zero height, and the size watcher missed the end of that growth. The backdrop of a
  panel held by search starts after the rail, so hovering another rail item switches the panel as
  in the first kit. Affected stage: 2.
- **Row 131 keeps the square row buttons by default.** The application asked for round buttons by
  default; the owner's word about the default look comes first, so the circle, the sizes, the icon
  size and the resting colour are row properties, and the consumer button fill follows
  `subItemIconFill`. The dead `shape="circle"` attribute is gone from four buttons. Two names the
  application asked for are read by the first kit's side menu, so the second kit names them after
  its row: `--rt-side-menu-sub-item-favorite-size` and `--rt-side-menu-sub-item-favorite-color`.
  Affected stage: 2.
- **Row 132: a toast reports why it left without an action.** The application holds a sign-in wait
  behind a toast with no timer, and a toast closed by the cross must fail that wait. The option
  `onDismiss` gets `close`, `timeout` or `replaced` once; a toast left by its action reports
  nothing, its handler already ran. The look and the former behaviour do not change. Scenario
  SC-UKV-816. Affected stage: 2.
- **Two side menu scenarios moved to SC-UKV-817 and SC-UKV-818.** The merge of main brought the chat
  scenarios under SC-UKV-781 and SC-UKV-782, and main keeps its numbers; the side menu ones and their
  test titles moved by the same commit.
- **The first kit's look of the side menu goes along.** `be09487bc` came after the head of PR #2647,
  and rows 122–128 stand on it. Affected stage of the plan: 1.
- **The four icon frames were retaken on the branch from main.** The frames of the RT-2644 branch
  carried the epic's icons; the divergence on main's showcase was the folder pair alone, and the
  whole set of 789 tests and 806 snapshots matched on a second raising. Affected stage: 1.
- **Row 133: the echo of the chosen entities is told by the set of keys.** The echo keeps the order
  of the rows and the reset list, so the reset turns on after an addition as in the first kit. The
  promise of SC-UKV-721 widened and kept its number; the new test failed before the fix. Affected
  stage: 1.
