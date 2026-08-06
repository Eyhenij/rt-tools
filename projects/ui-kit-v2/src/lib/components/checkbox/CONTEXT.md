# `rt-checkbox`

```html
<rt-checkbox [formControl]="agreeControl">Согласен с условиями</rt-checkbox>
<rt-checkbox ariaLabel="Выбрать всё" [indeterminate]="someSelected()" [formControl]="allControl" />
```

| вход            | тип              | умолчание |
| --------------- | ---------------- | --------- |
| `inputId`       | `string \| null` | `null`    |
| `ariaLabel`     | `string \| null` | `null`    |
| `disabled`      | `boolean`        | `false`   |
| `indeterminate` | `boolean`        | `false`   |

Значение — `boolean` через `ControlValueAccessor`. Подпись приходит проекцией.

## Главное, что нужно знать

**Это `<button role="checkbox">`, а не `<input type="checkbox">`.** Enter и Space обрабатывает
браузер сам, поэтому собственных обработчиков клавиатуры здесь нет. `aria-checked` принимает три
значения: `true`, `false`, `mixed`.

**`indeterminate` — чисто визуальный вход, компонент его не сбрасывает.** Клик по смешанному
состоянию разрешается в `true` (контракт трёхпозиционного чекбокса) и поднимает `true` наружу,
но прочерк на экране останется, пока вход держит его сверху. Снимать вход — дело потребителя.

## Как этим пользоваться

- Отключение приходит двумя путями — вход `[disabled]` и `FormControl.disable()`, — и оба пишут
  в один внутренний сигнал, поэтому ведут себя одинаково.
- Проекция не видна скринридеру как имя контрола: если подпись важна для AT, задай `ariaLabel`.
- `inputId` кладётся на кнопку — по нему связывается внешний `<label for>`.

## Рядом

- [`rt-toggle-switch`](../toggle-switch/CONTEXT.md) — то же булево значение, но для «включено /
  выключено», а не «отмечено».
