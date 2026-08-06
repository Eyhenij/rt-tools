# `rt-filter-control<T>`

Фильтр, который сам выбирает представление по ширине экрана.

```html
<rt-filter-control ariaLabel="Статус" [options]="options" [value]="status()" (valueChange)="status.set($event)" />
```

| вход                     | тип                                              | умолчание      |
| ------------------------ | ------------------------------------------------ | -------------- |
| `options`                | `ReadonlyArray<{ value, label, icon?, title? }>` | **обязателен** |
| `value`                  | `T \| undefined`                                 | `undefined`    |
| `ariaLabel`              | `string \| null`                                 | `null`         |
| `placeholder`            | `string`                                         | `''`           |
| `size`                   | `'sm' \| 'md' \| 'lg'`                           | `'sm'`         |
| `disabled` / `fullWidth` | `boolean`                                        | `false`        |

Выход: `valueChange`.

## Главное, что нужно знать

**Одно и то же наполнение рисуется двумя разными контролами.** На широком экране это
[`rt-toggle-button-group`](../toggle-button-group/CONTEXT.md), на узком (≤1080px, по
`BreakpointsService.narrow`) — [`rt-select`](../select/CONTEXT.md): сегменты в строку не
помещаются. Потребитель об этом не думает и передаёт один набор.

**Очистка списка выключена**: фильтр всегда в каком-то состоянии, «ничего не выбрано» здесь не
предусмотрено.

## Края

- Иконки вариантов доезжают только до сегментов; в списке остаются одни подписи.
- Отключение доходит до обоих представлений.
