# `rt-autocomplete<TItem>`

Поле с подсказками. Ищет **потребитель** — компонент только сообщает, что набрано.

```html
<rt-autocomplete
    [formControl]="city"
    [suggestions]="found()"
    [displayWith]="cityLabel"
    [minLength]="2"
    (complete)="search($event.query)"
    (itemSelect)="onPicked($event)" />
```

Свои входы поверх общих из [`RtFormControlBase`](../form-control/CONTEXT.md):

| вход           | тип                                         | умолчание            |
| -------------- | ------------------------------------------- | -------------------- |
| `suggestions`  | `ReadonlyArray<TItem>`                      | `[]`                 |
| `displayWith`  | `(item: TItem \| null) => string`           | `String(item ?? '')` |
| `placeholder`  | `string`                                    | `''`                 |
| `minLength`    | `number`                                    | `1`                  |
| `openOnFocus`  | `boolean`                                   | `false`              |
| `iconLeft`     | `IRtIcon.Name \| null`                      | `null`               |
| `itemTemplate` | `TemplateRef<{ $implicit: TItem }> \| null` | `null`               |

| выход        | тип                        |
| ------------ | -------------------------- |
| `complete`   | `{ query, originalEvent }` |
| `itemSelect` | `TItem`                    |

Значение — `TItem | null` (объект, а не строка).

## Главное, что нужно знать

**Набор текста не пишет значение в форму.** В форме лежит объект, а набранная строка — это ещё
не объект. Значение появляется только при выборе подсказки. Отсюда же следует, что «свободный
ввод» этим компонентом не поддерживается: если пользователь набрал текст и ушёл, значение
осталось прежним.

**Задайте `displayWith`.** Без него подписи подсказок и текст в поле собираются через
`String(item)`, и объект превращается в `[object Object]`. Функция нужна и для отрисовки
подсказки, и для подстановки текста после выбора, и для плоского режима чтения.

## Как этим пользоваться

- Панель открывается, когда набрано не меньше `minLength` символов; более короткая строка
  закрывает её и события не поднимает.
- `openOnFocus` дополнительно запрашивает подсказки при фокусе — для списков «последнее
  выбранное».
- `itemTemplate` рисует свою разметку подсказки (иконка, две строки); контекст — `$implicit`.
- Крестик очистки стирает и текст, и значение.
- Клавиатура: `ArrowDown`/`ArrowUp` водят по подсказкам, `Enter` выбирает, `Escape` закрывает.
  При закрытой панели клавиши ничего не делают.

## Рядом

- [`rt-select`](../select/CONTEXT.md) — когда набор известен заранее.
- Проверки: [`rt-autocomplete.component.spec.ts`](./rt-autocomplete.component.spec.ts).
