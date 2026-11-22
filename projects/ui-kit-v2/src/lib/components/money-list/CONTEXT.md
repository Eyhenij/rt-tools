# `rt-money-list` + `rt-money-row`

Перечень сумм с выделенной итоговой строкой.

```html
<rt-money-list>
    <rt-money-row label="Тариф"><ng-template rtMoneyRowContent>12 000 ₽</ng-template></rt-money-row>
    <rt-money-row label="Скидка" [loading]="!discount()"><ng-template rtMoneyRowContent>−1 200 ₽</ng-template></rt-money-row>
    <rt-money-row label="Итого" [total]="true"><ng-template rtMoneyRowContent>10 800 ₽</ng-template></rt-money-row>
</rt-money-list>
```

`rt-money-list` — чистая раскладка, входов нет.

| вход `rt-money-row` | тип       | умолчание |
| ------------------- | --------- | --------- |
| `label`             | `string`  | `''`      |
| `total`             | `boolean` | `false`   |
| `loading`           | `boolean` | `false`   |

Сумма приходит шаблоном `<ng-template rtMoneyRowContent>` — форматирует её потребитель; в загрузке
шаблон не создаётся.

## Главное, что нужно знать

**Считать компонент не умеет.** Итог — это просто строка с `total`, выделенная начертанием;
складывает суммы вызывающий код.

Во время загрузки сумма подменяется заглушкой, подпись остаётся на месте.

## Рядом

- [`rt-detail-list`](../detail-list/CONTEXT.md) — то же для нечисловых значений.
