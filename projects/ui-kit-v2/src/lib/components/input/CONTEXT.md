# `rt-input`

```html
<rt-field label="Имя">
    <rt-input placeholder="Как в паспорте" iconLeft="search" [formControl]="name" />
</rt-field>

<rt-input type="password" [formControl]="password" [passwordToggle]="true" />
```

Свои входы поверх общих из [`RtFormControlBase`](../form-control/CONTEXT.md)
(`size`, `disabled`, `controlId`, `ariaLabel`, `clearable`, `bordered`):

| вход                     | тип                                         | умолчание |
| ------------------------ | ------------------------------------------- | --------- |
| `type`                   | `'text' \| 'password' \| 'email' \| 'time'` | `'text'`  |
| `placeholder`            | `string`                                    | `''`      |
| `iconLeft` / `iconRight` | `IRtIcon.Name \| null`                      | `null`    |
| `passwordToggle`         | `boolean`                                   | `false`   |
| `autocomplete`           | `string \| null`                            | `null`    |

Значение — `string`.

## Главное, что нужно знать

**Крестик очистки и переключатель пароля делят один постфикс.** На поле пароля с включённым
переключателем крестика не будет: показать оба некуда.

Крестик показывается при выполнении трёх условий сразу: `clearable` (по умолчанию включён),
в поле есть значение, поле не отключено. Из таб-порядка он исключён (`tabindex="-1"`) — до
вспомогательного аффорданса не должны доходить табом.

## Как этим пользоваться

- `type="time"` заведён намеренно: браузер сам отдаёт `HH:MM` и раскладку под локаль, а разбор
  строки руками означал бы своё поле ввода времени рядом с китом.
- Клик по рамке (падинги принадлежат host-у, а не `<input>`) переводит фокус в поле — кроме
  кликов по самому полю и по интерактивному постфиксу.
- Режим плоского чтения включает **вмещающий [`rt-field`](../field/CONTEXT.md)**, а не вход
  компонента: `[readonly]` стоит на поле-обёртке. Пустое значение в этом режиме рисуется прочерком.
- Подсветка ошибки (`rt-input--invalid`) включается сама после касания — см. основу полей.

## Рядом

- [`rt-field`](../field/CONTEXT.md) — подпись, звёздочка, текст ошибки, режим чтения.
- [`rt-input-number`](../input-number/CONTEXT.md) — для чисел с группировкой разрядов.
- [`rt-autocomplete`](../autocomplete/CONTEXT.md) — поле с подсказками.
- Проверки: [`rt-input.component.spec.ts`](./rt-input.component.spec.ts).
