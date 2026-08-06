# `RtFormControlBase<TValue>`

Абстрактная основа всех полей ввода кита. Собственной разметки не имеет и в разметку не ставится —
от неё наследуются [`rt-input`](../input/CONTEXT.md), [`rt-textarea`](../textarea/CONTEXT.md),
[`rt-input-number`](../input-number/CONTEXT.md), [`rt-select`](../select/CONTEXT.md),
[`rt-multiselect`](../multiselect/CONTEXT.md), [`rt-autocomplete`](../autocomplete/CONTEXT.md),
[`rt-date-picker`](../date-picker/CONTEXT.md).

Общие входы, которые получает каждый наследник:

| вход        | тип                    | умолчание |
| ----------- | ---------------------- | --------- |
| `size`      | `'sm' \| 'md' \| 'lg'` | `'md'`    |
| `disabled`  | `boolean`              | `false`   |
| `controlId` | `string \| null`       | `null`    |
| `ariaLabel` | `string \| null`       | `null`    |
| `clearable` | `boolean`              | `true`    |
| `bordered`  | `boolean`              | `true`    |

## Главное, что нужно знать

**`NgControl` инжектится самим полем (`{ self: true, optional: true }`), а `valueAccessor`
привязывается вручную — провайдера `NG_VALUE_ACCESSOR` здесь нет.** Так поле получает доступ к
`control.invalid` / `touched` / `errors` (и умеет подсвечивать ошибку и отдавать её текст в
[`rt-field`](../field/CONTEXT.md)), не создавая цикла самоссылки, на котором Angular падает
с NG0200.

**Подсветка ошибки включается только после касания или правки**: `invalid && (touched || dirty)`.
Пустое обязательное поле невалидно с самого начала, но краснеть до первого касания не должно.

## Что задаёт вмещающее поле, а не потребитель

`rt-field` вызывает у контрола три метода — руками их звать не нужно:

- `assignControlId(id)` — авто-идентификатор для связки `label[for]`, если у контрола нет своего;
- `setReadonly(value)` — плоский режим чтения (`isReadonly`), в котором контрол подменяется
  текстом `displayText()`;
- читает `required()`, `invalid()`, `errors()` — для звёздочки и текста ошибки.

## Что обязан реализовать наследник

| член                | зачем                                           |
| ------------------- | ----------------------------------------------- |
| `getEmptyValue()`   | пустое значение своего типа: `''`, `null`, `[]` |
| `hasValue`          | есть ли что очищать — гейт видимости крестика   |
| `focusAfterClear()` | куда вернуть фокус после очистки                |
| `displayText`       | текст плоского режима чтения                    |

Поля с отдельным состоянием отображения (`rt-autocomplete`, `rt-input-number`) вдобавок
переопределяют `writeValue` и `clearValue`, синхронизируя свой сигнал отображения.
