# `rt-message-composer`

Поле отправки сообщения: текст, вложения, необязательное форматирование.

```html
<rt-message-composer
    placeholder="Ваш вопрос"
    [attachments]="true"
    [sending]="sending()"
    [droppedFiles]="dropped()"
    (submitted)="send($event)" />
```

| вход                   | тип                    | умолчание                      |
| ---------------------- | ---------------------- | ------------------------------ |
| `placeholder`          | `string`               | `''` → `rtKit.chatPlaceholder` |
| `attachments`          | `boolean`              | `false`                        |
| `accept`               | `string`               | `''`                           |
| `sending` / `disabled` | `boolean`              | `false`                        |
| `formatting`           | `boolean`              | `false`                        |
| `toolbar`              | `IRtRichEditorToolbar` | `'full'`                       |
| `minRows` / `maxRows`  | `number`               | 1 / 6                          |
| `droppedFiles`         | `File[] \| null`       | `null`                         |

Выход: `submitted` — `{ text, delta?, files }`.

## Главное, что нужно знать

**Отправка разблокируется только при непустом содержимом.** Пробелы значением не считаются; один
вложенный файл разблокирует отправку и без текста. Во время `sending` поле и кнопка заблокированы —
иначе второе сообщение ушло бы поверх ещё не доставленного.

**Enter отправляет, Shift+Enter переносит строку.** Набор во время IME-композиции игнорируется.

**`droppedFiles` — вход, а не выход.** Файлы, брошенные в область
[`rt-file-drop`](../file-drop/CONTEXT.md) снаружи, передаются сюда входом и добавляются к
вложениям; без `attachments` они игнорируются.

## Края

- После отправки форма сбрасывается целиком — и текст, и файлы.
- В режиме `formatting` текст уезжает пустым, а содержимое едет в `delta` строкой JSON.

## Рядом

- [`rt-chat`](../chat/CONTEXT.md) — использует это поле как своё.
- Проверки: [`rt-message-composer.component.spec.ts`](./rt-message-composer.component.spec.ts).
