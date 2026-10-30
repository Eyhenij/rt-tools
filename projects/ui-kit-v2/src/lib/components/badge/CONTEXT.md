# `rtBadge`

```html
<span rtBadge="12" [rtBadgeOverlap]="false">Отели</span>
<rt-icon name="bell" [rtBadge]="day.decoration?.badge" />
```

| вход              | тип                                     | умолчание       |
| ----------------- | --------------------------------------- | --------------- |
| `rtBadge`         | `string \| number \| null \| undefined` | `null`          |
| `rtBadgeOverlap`  | `boolean`                               | `true`          |
| `rtBadgeHidden`   | `boolean`                               | `false`         |
| `rtBadgePosition` | `IRtBadge.Position`                     | `'above-after'` |
| `rtBadgeSize`     | `'sm' \| 'md'`                          | `'md'`          |
| `rtBadgeColor`    | `IRtBadge.Color`                        | `'primary'`     |

Выходов нет.

## Главное, что нужно знать

**Пузырёк — последний узел хоста, не обёртка.** Директива ставит `span.rt-badge` в конец хоста и
даёт хосту `position: relative` в слое кита. Стили директивы подключены общим набором стилей кита
(`styles/_index.scss`): своего представления у неё нет.

**Без `rtBadgeOverlap` пузырёк стоит за краем хоста.** Он начинается у края и подпись не
накрывает; место под него хост оставляет сам, если рядом стоит сосед.

## Края

- Пустая строка, `null` и `undefined` пузырька не рисуют; ноль рисует.
- Указатель проходит сквозь пузырёк к хосту.
- После серверной отрисовки пузырёк уже стоит в хосте. Директива на клиенте находит его по метке
  `data-rt-badge` и берёт себе, второго не ставит.
