# `rt-message`

Цветное сообщение внутри страницы: палитра, иконка, необязательное закрытие.

```html
<rt-message severity="danger" [closable]="true" (closed)="dismiss()">Не удалось сохранить</rt-message>
```

| вход       | тип                                                                        | умолчание           |
| ---------- | -------------------------------------------------------------------------- | ------------------- |
| `severity` | `'info' \| 'success' \| 'warning' \| 'danger' \| 'secondary' \| 'neutral'` | `'info'`            |
| `icon`     | `IRtIcon.Name \| null`                                                     | `null` → по палитре |
| `hideIcon` | `boolean`                                                                  | `false`             |
| `closable` | `boolean`                                                                  | `false`             |

Выход: `closed`. Текст приходит проекцией.

## Главное, что нужно знать

**Это `role="alert"`** — скринридер читает сообщение сразу, перебивая. Тихая заметка, которая не
перебивает, — это [`rt-note`](../note/CONTEXT.md). Выбор между ними — выбор громкости.

**Крестик просит закрыть, но сам сообщение не убирает**: оно может быть частью формы, и решение
за потребителем.

## Края

- Иконка подставляется по палитре (`info` → `ico-info`, `success` → `check`,
  `warning` → `ico-warning`, `danger` → `ico-error`). У `secondary` и `neutral` иконки нет —
  они не сообщают об исходе.
- Заданная иконка перебивает умолчание; `hideIcon` гасит любую.

## Рядом

- [`rt-toaster`](../toast/CONTEXT.md) — всплывающее уведомление вместо встроенного.
- Проверки: [`rt-message.component.spec.ts`](./rt-message.component.spec.ts).
