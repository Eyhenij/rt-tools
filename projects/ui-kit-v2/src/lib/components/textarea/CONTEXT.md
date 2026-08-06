# `rt-textarea`

```html
<rt-field label="Комментарий">
    <rt-textarea resize="vertical" placeholder="Что уточнить" [formControl]="comment" [rows]="5" />
</rt-field>
```

Свои входы поверх общих из [`RtFormControlBase`](../form-control/CONTEXT.md):

| вход          | тип                    | умолчание    |
| ------------- | ---------------------- | ------------ |
| `placeholder` | `string`               | `''`         |
| `rows`        | `number \| string`     | `3`          |
| `resize`      | `'none' \| 'vertical'` | `'vertical'` |
| `readonly`    | `boolean`              | `false`      |

Значение — `string`.

## Главное, что нужно знать

**Крестик очистки не рисуется.** Вход `clearable` наследуется от общей основы полей, но разметка
многострочного поля его не использует: в многострочном вводе он нетипичен.

**Два разных «только для чтения»:**

- свой вход `[readonly]` оставляет `<textarea>` на месте и запрещает правку (нативный `readOnly`);
- режим от вмещающего [`rt-field`](../field/CONTEXT.md) подменяет контрол плоским текстом.

## Края

- `font-family: inherit` прописан явно: без него `<textarea>` падает на моноширинный шрифт
  браузера.
- Горизонтальное растягивание не предусмотрено — только `none` и `vertical`.

## Рядом

- [`rt-rich-editor`](../rich-editor/CONTEXT.md) — когда нужна разметка внутри текста.
- Проверки: [`rt-textarea.component.spec.ts`](./rt-textarea.component.spec.ts).
