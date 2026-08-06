# `rt-split-button`

Кнопка основного действия с прикреплённым меню дополнительных.

```html
<rt-split-button
    label="Сохранить"
    [menuItems]="[{ value: 'draft', label: 'Сохранить черновик' }]"
    [loading]="saving()"
    (faceClick)="save()"
    (itemSelect)="run($event)" />
```

| вход                   | тип                                             | умолчание                    |
| ---------------------- | ----------------------------------------------- | ---------------------------- |
| `label`                | `string`                                        | **обязателен**               |
| `menuItems`            | `readonly { value, label, icon?, disabled? }[]` | **обязателен**               |
| `theme` / `size`       | как у [`[rtButton]`](../button/CONTEXT.md)      | `'primary'` / `'md'`         |
| `menuAriaLabel`        | `string`                                        | `''` → `rtKit.uiMoreActions` |
| `loading` / `disabled` | `boolean`                                       | `false`                      |

Выходы: `faceClick`, `itemSelect` (значение пункта).

## Главное, что нужно знать

**Поповер висит на всём контроле, а не на узкой каретке.** Так ширина меню равна ширине кнопки, а
левый край совпадает — иначе панель уезжала бы за экран.

**Нажатие основной кнопки меню не открывает**, и наоборот: это два независимых действия.

## Края

- `loading` и `disabled` блокируют обе части и запрещают открытие меню.
- Отключённый пункт не выбирается и меню не закрывает.
- Значение пункта продублировано атрибутом `data-value`.

## Рядом

- [`rt-menu`](../menu/CONTEXT.md) — меню без основного действия.
- Проверки: [`rt-split-button.component.spec.ts`](./rt-split-button.component.spec.ts).
