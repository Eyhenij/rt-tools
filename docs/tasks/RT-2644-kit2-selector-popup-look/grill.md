# Grill

**Task:** RT-2644 · **Branch:** RT-2644-kit2-selector-popup-look

The first part of the task — rows up to 112 — went into main by PR 2647. Rows 113–121 lie in the
branch by commit `be09487bc`. The owner's word holds: «не спеши закрывать эту задачу после моего
апрува» — new rows of the application go into the same task.

## The requests verbatim

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

## Decisions

| Question                    | Answer                                                                                                              | Reason                                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The defaults of 125 and 128 | the current look: the hint is off, the delay is zero                                                                | the owner's standing word: «важно не допустить регрессий и изменения дефолтной втьюхи второго кита»; the application sets the first kit's values by the inputs |
| The row click in 127        | the row keeps its `href` and navigates through the router itself, after the output, unless the output was prevented | the router's own link navigates before any handler of the row can run                                                                                          |
| A modified click in 127     | the browser keeps it, unless the consumer prevented it                                                              | a middle press and a press with a modifier open a tab by the address                                                                                           |
