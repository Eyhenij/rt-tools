# `rt-detail-list` + `rt-detail-row`

Вертикальный перечень «ключ → значение» для асайдов и карточек.

```html
<rt-detail-list>
    <rt-detail-row label="Тариф">Базовый</rt-detail-row>
    <rt-detail-row label="Владелец" [loading]="!user()">{{ user()?.name }}</rt-detail-row>
</rt-detail-list>
```

`rt-detail-list` — чистая раскладка, входов нет.

| вход `rt-detail-row` | тип       | умолчание |
| -------------------- | --------- | --------- |
| `label`              | `string`  | `''`      |
| `loading`            | `boolean` | `false`   |

Значение приходит проекцией.

## Главное, что нужно знать

**Во время загрузки подменяется только значение** — подпись остаётся, по ней читается, чего ждут.
Заглушка узкая (180 px), под значение, а не под всю строку.

## Рядом

- [`rt-info-item`](../info-item/CONTEXT.md) — одиночная пара «подпись: значение» в строку.
- [`rt-money-list`](../money-list/CONTEXT.md) — то же, но для сумм с итогом.
