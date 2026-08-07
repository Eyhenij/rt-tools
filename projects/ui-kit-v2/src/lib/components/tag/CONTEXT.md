# `rt-tag`

```html
<rt-tag value="Активен" severity="success" shape="pill" appearance="solid" icon="check" [closable]="true" (closed)="onClosed($event)" />
```

| вход               | тип                                                                        | умолчание      |
| ------------------ | -------------------------------------------------------------------------- | -------------- |
| `value`            | `string`                                                                   | **обязателен** |
| `severity`         | `'info' \| 'success' \| 'warning' \| 'danger' \| 'secondary' \| 'neutral'` | `'neutral'`    |
| `shape`            | `'pill' \| 'square'`                                                       | `'pill'`       |
| `appearance`       | `'solid' \| 'outlined'`                                                    | `'solid'`      |
| `radius`           | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full' \| null`                         | `null`         |
| `icon` / `iconEnd` | `IRtIcon.Name \| null`                                                     | `null`         |
| `closable`         | `boolean`                                                                  | `false`        |

| выход    | тип          |
| -------- | ------------ |
| `closed` | `MouseEvent` |

## Главное, что нужно знать

**Крестик не закрывает тег.** `closed` только сообщает о клике — убрать тег из списка обязан
потребитель. Компонент состояния не держит.

Клик по крестику **не всплывает** (`stopPropagation`): пилюля целиком часто сама кликабельна,
и без этого одно нажатие срабатывало бы дважды.

## Как этим пользоваться

- `radius` перебивает скругление, заданное формой. Без него класс скругления не выводится
  вовсе — радиус берётся из `shape`.
- Палитра дублируется атрибутом `data-severity` — по нему тег находят проверки и внешние стили,
  не завязываясь на BEM-класс.
- Подпись крестика для скринридера берётся из словаря кита (`uiRemove`). Без
  `provideRtKitLabels()` там будет пусто.

## Края

- `value` — обязательный вход: тег без текста не бывает. Иконка без текста — это
  [`rt-icon-button`](../icon-button/CONTEXT.md), а не тег.
- Модификаторы выводятся BEM-директивами: `rt-tag--severity--success`, `rt-tag--shape--square`,
  булев `closable` даёт `rt-tag--closable` без значения.

## Рядом

- [`rt-live-badge`](../live-badge/CONTEXT.md) — пилюля живого счётчика, а не статуса.
