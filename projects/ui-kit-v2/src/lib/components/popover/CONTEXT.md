# `[rtPopover]`

Примитив плавающей панели поверх CDK Overlay. На нём стоят
[`rt-select`](../select/CONTEXT.md), [`rt-multiselect`](../multiselect/CONTEXT.md),
[`rt-autocomplete`](../autocomplete/CONTEXT.md) и пояснение в [`rt-field`](../field/CONTEXT.md).

```html
<button type="button" rtPopoverTrigger="click" rtPopoverWidth="trigger" [rtPopover]="tpl">Открыть</button>
<ng-template #tpl><div>Содержимое панели</div></ng-template>
```

| вход (алиас)                            | тип                              | умолчание |
| --------------------------------------- | -------------------------------- | --------- |
| `rtPopover`                             | `TemplateRef \| null`            | `null`    |
| `rtPopoverTrigger`                      | `'click' \| 'hover' \| 'manual'` | `'click'` |
| `rtPopoverWidth`                        | `'trigger' \| 'auto'`            | `'auto'`  |
| `rtPopoverAlign`                        | `'start' \| 'end'`               | `'start'` |
| `rtPopoverFitViewport`                  | `boolean`                        | `false`   |
| `rtPopoverOffsetY` / `rtPopoverOffsetX` | `number`                         | `4` / `0` |
| `rtPopoverPanelClass`                   | `string`                         | `''`      |
| `rtPopoverContext`                      | `unknown`                        | `null`    |
| `rtPopoverDisabled`                     | `boolean`                        | `false`   |

Выходы: `rtPopoverOpened`, `rtPopoverClosed`. Публичное API: `open()`, `close()`, `toggle()`,
`isOpen()` — работают **во всех режимах**; `trigger` определяет только автоматические слушатели.

## Главное, что нужно знать

**Панель живёт в оверлее CDK, а не внутри host-элемента.** Поэтому её не режет `overflow: hidden`
предков (таблицы, асайды, карточки) — но и искать её в разметке компонента бесполезно: в тестах
она ищется по документу.

**Вложенная панель не считается «кликом снаружи».** Панель, открытая из нашей (список
`rt-select`, календарь, вложенное меню), лежит в DOM рядом, отдельным оверлеем. Без этой проверки
меню профиля закрывалось бы, стоило потянуться к списку языков, а выбранное значение не доходило
бы до обработчика. Вложенность определяется порядком панелей в контейнере оверлеев: открытая позже
считается вложенной.

## Как этим пользоваться

- `manual` — для контролов со своим жестом (поле с подсказками открывает панель по набору текста).
- `hover` держит панель открытой при переходе курсора на неё: закрытие отложено на 100 мс, и
  наведение на панель отсрочку гасит.
- `fitViewport` **выключен по умолчанию**: панель стоит там, куда её ставит привязка к триггеру,
  даже если часть ушла за экран. Включать для широких и высоких панелей, иначе их содержимое
  остаётся недостижимым.
- `rtPopoverPanelClass` добавляется **к** базовому `rt-popover-panel`, а не вместо него.
- Escape и клик мимо закрывают панель во всех режимах.

## Рядом

- [`[rtTooltip]`](../tooltip/CONTEXT.md) — та же механика, но для короткой подсказки.
- [`[rtConfirm]`](../confirm-popover/CONTEXT.md) — панель подтверждения.
- [`rt-menu`](../menu/CONTEXT.md) — меню действий (на CDK-оверлее напрямую).
- Проверки: [`rt-popover.directive.spec.ts`](./rt-popover.directive.spec.ts).
