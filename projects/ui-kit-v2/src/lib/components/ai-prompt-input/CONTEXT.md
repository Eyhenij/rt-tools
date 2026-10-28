# `rt-ai-prompt-input`

```html
<rt-ai-prompt-input
    stoppable
    model="Opus 5.5"
    [usage]="usedPercent()"
    [usageHint]="usageHint()"
    [sending]="sending()"
    [(text)]="draft"
    (submitted)="ask($event)"
    (stopped)="stop()"
    (controlPicked)="openPicker($event)" />
```

| вход                        | тип                  | умолчание                |
| --------------------------- | -------------------- | ------------------------ |
| `placeholder`               | `string`             | `''` → `chatPlaceholder` |
| `hint`                      | `string \| null`     | `null` → `aiDisclaimer`  |
| `hintPosition`              | `'below' \| 'above'` | `'below'`                |
| `attachments`               | `boolean`            | `false`                  |
| `accept`                    | `string`             | `''`                     |
| `model` / `effort` / `mode` | `string`             | `''`, кнопки нет         |
| `usage`                     | `number \| null`     | `null`, кольца нет       |
| `usageHint`                 | `string`             | `''`                     |
| `usageWarnAt`               | `number`             | `80`                     |
| `sending` / `stoppable`     | `boolean`            | `false`                  |
| `disabled`                  | `boolean`            | `false`                  |
| `minRows` / `maxRows`       | `number`             | 1 / 8                    |
| `text` (model)              | `string`             | `''`                     |

Выходы: `submitted` отдаёт `{ text, files }`, `stopped` сообщает о нажатой «Стоп». Выход
`controlPicked` отдаёт `'model'`, `'effort'` или `'mode'`. Метод: `focus()`.

Спек лежит в `docs/specs/ui-kit-v2/ai-chat/`; здесь только устройство папки.

## Главное, что нужно знать

**Одна рамка: текст сверху, ряд действий внутри снизу.** Слева «+», справа модель, усилие,
режим, кольцо расхода и отправка. Элемент ряда без значения не рисуется.

**Что открывает модель, усилие и режим, решает приложение.** Поле сообщает, какую кнопку нажали,
и показывает подпись, которую ему дали.

**Подсказка стоит отдельной строкой под полем или над ним.** В ряд действий она не входит.
Пустая строка `hint` её убирает.

**`stoppable` меняет смысл `sending`.** При обоих флагах стрелку сменяет «Стоп», поле открыто, и
следующий вопрос набирается, пока идёт ответ. Без `stoppable` отправка закрывает поле.

## Края

- Отправка идёт по `Enter` без Shift или по стрелке. `Shift+Enter` переносит строку, подтверждение
  набора IME не перехватывается.
- Пробелы текстом не считаются, один приложенный файл открывает отправку и без текста.

## Рядом

- [`rt-usage-ring`](../usage-ring/CONTEXT.md): кольцо расхода в ряду действий.
- `rt-message-composer` входа `rich-editor`: поле переписки с людьми, капсула и форматирование.
