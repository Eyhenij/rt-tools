# `rt-money-list` + `rt-money-row`

Перечень сумм с выделенной итоговой строкой.

```html
<rt-money-list>
    <rt-money-row label="Тариф">12 000 ₽</rt-money-row>
    <rt-money-row label="Скидка" [loading]="!discount()">−1 200 ₽</rt-money-row>
    <rt-money-row label="Итого" [total]="true">10 800 ₽</rt-money-row>
</rt-money-list>
```

`rt-money-list` — чистая раскладка, входов нет.

| вход `rt-money-row` | тип       | умолчание |
| ------------------- | --------- | --------- |
| `label`             | `string`  | `''`      |
| `total`             | `boolean` | `false`   |
| `loading`           | `boolean` | `false`   |

Сумма приходит проекцией — форматирует её потребитель.

## Главное, что нужно знать

**Считать компонент не умеет.** Итог — это просто строка с `total`, выделенная начертанием;
складывает суммы вызывающий код.

Во время загрузки сумма подменяется заглушкой, подпись остаётся на месте.

## Рядом

- [`rt-detail-list`](../detail-list/CONTEXT.md) — то же для нечисловых значений.
- Проверки: [`rt-money-list.component.spec.ts`](./rt-money-list.component.spec.ts).
