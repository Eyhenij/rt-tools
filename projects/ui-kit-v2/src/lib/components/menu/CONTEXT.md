# `rt-menu` + `rt-menu-item`

Меню действий: иконочная кнопка, раскрывающая список пунктов.

```html
<rt-menu ariaLabel="Действия со строкой" align="end">
    <rt-menu-item label="Открыть" icon="ico-eye" (selected)="open()" />
    <rt-menu-item
        label="Удалить"
        icon="ico-trash"
        confirmMessage="Удалить запись? Действие необратимо."
        confirmTitle="Удаление"
        [danger]="true"
        (selected)="remove()" />
</rt-menu>
```

## `rt-menu`

| вход        | тип                | умолчание          |
| ----------- | ------------------ | ------------------ |
| `icon`      | `IRtIcon.Name`     | `'ellipsis-h'`     |
| `ariaLabel` | `string`           | `''` → `uiActions` |
| `align`     | `'start' \| 'end'` | `'end'`            |
| `disabled`  | `boolean`          | `false`            |

## `rt-menu-item`

| вход                                  | тип                                  | умолчание                         |
| ------------------------------------- | ------------------------------------ | --------------------------------- |
| `label`                               | `string`                             | `''`                              |
| `icon`                                | `IRtIcon.Name \| null`               | `null`                            |
| `danger` / `disabled`                 | `boolean`                            | `false`                           |
| `tooltip`                             | `string`                             | — (через `[rtTooltip]` на host-е) |
| `confirmMessage`                      | `string`                             | `''`                              |
| `confirmTitle`                        | `string \| null`                     | `null`                            |
| `confirmLabel` / `confirmCancelLabel` | `string`                             | `''` → словарь кита               |
| `confirmTone`                         | `'danger' \| 'warning' \| 'primary'` | `'danger'`                        |

| выход      | тип    |
| ---------- | ------ |
| `selected` | `void` |

## Главное, что нужно знать

**Пункт не знает о меню.** Выбрав себя, он бросает всплывающее событие `rtMenuSelect`, а панель
закрывается, поймав его. Благодаря этому пункт остаётся самостоятельным и его можно завернуть
в свой компонент — лишь бы событие всплывало.

**Подтверждение у пункта — диалог, а не поповер.** Панель поповера крепится к пункту, а пункт
исчезает вместе с закрывшимся меню — держаться панели было бы не на чем. Поэтому
`confirmMessage` открывает `rt-menu-confirm-dialog`, и `selected` приходит **только** после
подтверждения.

## Края

- Отключённый пункт не выбирается и меню не закрывает: он выпадает из таб-порядка (`tabindex`
  снимается) и помечается `aria-disabled`.
- Enter и Space на пункте работают как клик.
- Панель объявлена `role="menu"`, пункт — `role="menuitem"`.

## Рядом

- [`[rtConfirm]`](../confirm-popover/CONTEXT.md) — подтверждение под обычной кнопкой.
- [`rt-split-button`](../split-button/CONTEXT.md) — кнопка с прикреплённым меню.
