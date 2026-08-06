# `rt-file-input`

Поле выбора файлов: кнопка, скрытое нативное поле и список выбранного карточками.

```html
<rt-field label="Документы">
    <rt-file-input accept=".pdf,.docx" buttonLabel="Прикрепить" [formControl]="docs" [multiple]="true" />
</rt-field>
```

Свои входы поверх общих из [`RtFormControlBase`](../form-control/CONTEXT.md):

| вход          | тип              | умолчание                   |
| ------------- | ---------------- | --------------------------- |
| `multiple`    | `boolean`        | `false`                     |
| `accept`      | `string \| null` | `null`                      |
| `directory`   | `boolean`        | `false`                     |
| `buttonLabel` | `string`         | `''` → `rtKit.uiChooseFile` |

Значение — `File[]`.

## Главное, что нужно знать

**Нативное поле спрятано.** Его нельзя оформить, поэтому выбор открывает своя кнопка, кликая по
скрытому полю программно.

**Без `multiple` берётся только первый файл**, даже если браузер отдал набор: так бывает при
перетаскивании в одиночное поле.

**Удаление файла сбрасывает значение нативного поля.** Иначе повторный выбор того же файла не
дал бы события `change`.

## Рядом

- [`rt-file-drop`](../file-drop/CONTEXT.md) — приём файлов перетаскиванием.
- [`rt-file-card`](../file-card/CONTEXT.md) — чем рисуется каждый выбранный файл.
- Проверки: [`rt-file-input.component.spec.ts`](./rt-file-input.component.spec.ts).
