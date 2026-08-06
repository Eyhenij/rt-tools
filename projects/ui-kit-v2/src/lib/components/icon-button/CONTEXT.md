# `rt-icon-button`

```html
<rt-icon-button icon="ico-trash" ariaLabel="Удалить" variant="danger" size="md" (clicked)="remove()" />
```

| вход                                            | тип                                                                         | умолчание                    |
| ----------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------- |
| `icon`                                          | `IRtIcon.Name`                                                              | **обязателен**               |
| `ariaLabel`                                     | `string`                                                                    | **обязателен**               |
| `variant`                                       | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'success' \| 'warning'` | `'ghost'`                    |
| `size`                                          | `'sm' \| 'md' \| 'lg'`                                                      | `'md'`                       |
| `iconSize`                                      | `IRtIcon.Size \| null`                                                      | `null` → от размера кнопки   |
| `iconColor`                                     | `IRtIcon.Color`                                                             | `'current'`                  |
| `shape`                                         | `'circle' \| 'square'`                                                      | `'square'`                   |
| `type`                                          | `'button' \| 'submit'`                                                      | `'button'`                   |
| `tooltip`                                       | `string`                                                                    | `''` (пусто → подсказки нет) |
| `tabIndex`                                      | `number`                                                                    | `0`                          |
| `loading` / `disabled` / `active` / `indicator` | `boolean`                                                                   | `false`                      |

| выход     | тип          |
| --------- | ------------ |
| `clicked` | `MouseEvent` |

## Главное, что нужно знать

**`ariaLabel` обязателен.** У кнопки нет текста, и без подписи она для скринридера безымянна.
Это единственная причина, по которой вход помечен `required`.

**Кнопку компонент рисует внутри себя**, host остаётся обычным элементом. Поэтому размер задаётся
не host-у, а свойством `--rt-icon-button-size` — его можно переопределить инлайном
(`style="--rt-icon-button-size: 35px"`), когда нужен размер вне шкалы.

## Как этим пользоваться

- `loading` = `disabled` плюс кольцо вместо иконки. Клик в этом состоянии наружу не уходит.
- `active` превращается в `aria-pressed="true"` — для кнопок-переключателей.
- `tabIndex="-1"` оставляет клик мышью, но убирает кнопку из таб-порядка: так сделаны
  вспомогательные крестики внутри полей.
- `iconSize` нужен, когда крупная кнопка должна остаться крупной (в неё целятся пальцем), а
  иконка во весь диаметр выглядит тяжеловесно.
- Модификаторы в камелкейсе конвертируются в дефис: `indicator` → `rt-icon-button--has-indicator`.

## Рядом

- [`[rtButton]`](../button/CONTEXT.md) — кнопка с подписью.
- [`[rtTooltip]`](../tooltip/CONTEXT.md) — то, чем рисуется вход `tooltip`.
