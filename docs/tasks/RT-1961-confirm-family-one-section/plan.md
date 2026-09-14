# Plan

**Задача:** [RT-1961] Семья подтверждения разорвана надвое между разделами витрины
**Ветка:** `RT-1961-confirm-family-one-section`, отведена от `RT-1870-one-kit`
**Behaviour:** unchanged — правка меняет заголовок показа и имя эталона; ни один файл кита не
трогается, поведение компонента и указания остаётся прежним.

## След задачи

- `projects/ui-kit-v2/src/lib/components/confirm-popover/stories/confirm-popover.stories.ts`
- `projects/ui-kit-v2/.storybook/__snapshots__/molecules-confirmpopover--playground.png`

## Измерение до правки

Заголовки трёх файлов историй семьи:

| Файл                         | Раздел                     |
| ---------------------------- | -------------------------- |
| `confirm-matrix.stories.ts`  | `Organisms/Dialog/Confirm` |
| `confirm.stories.ts`         | `Organisms/Dialog/Confirm` |
| `confirm-popover.stories.ts` | `Molecules/ConfirmPopover` |

Обзор семьи — `Organisms/Dialog/Confirm/Overview`. Эталонов пять под `organisms-dialog-confirm--*`
и один `molecules-confirmpopover--playground.png`.

Ссылок на старый раздел вне самого файла историй в дереве нет: поиск по `Molecules/ConfirmPopover`
и `molecules-confirmpopover` находит только объявление заголовка.

Оба файла — `confirm.stories.ts` и `confirm-popover.stories.ts` — объявляют показ с именем
`Playground`. Под одним заголовком их адреса совпадут.

## Этапы

### 1. Всплывающее переезжает в подраздел семьи

Заголовок `Molecules/ConfirmPopover` меняется на `Organisms/Dialog/Confirm/Popover`. Эталон
переименовывается следом.

**Признак готовности:** на поднятой витрине нет записи, чей адрес начинается с
`molecules-confirmpopover`, и есть запись `organisms-dialog-confirm-popover--playground`.

### 2. Кадр снят и просмотрен

Страница нового адреса открыта, кадр снят и просмотрен глазами — до того, как запускается сличение
эталонов.

**Признак готовности:** в кадре нарисовано всплывающее подтверждение, а не пустая страница.

### 3. Эталоны сходятся

**Признак готовности:** `pnpm run test:visual:v2` зелёный, сирот в наборе эталонов нет.

### 4. Проверки дерева

**Признак готовности:** `node tools/check-showcase-links.mjs` — код 0; набор проверок перед
отправкой ветки прошёл целиком.

## Чего работа не делает

- **Кит не правится.** Ни компонент, ни указание, ни их стили.
- **Прочие разорванные семьи не сводятся.** Эта задача про одну; сплошной обход разделов витрины —
  работа своего объёма.
- **Имена показов не переименовываются.** Столкновение `Playground` снимается подразделом, а не
  переименованием: под разными заголовками оба имени законны.
