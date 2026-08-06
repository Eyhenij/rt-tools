# `rt-toolbar`

Полоса действий с тремя слотами. Слоты объявляются директивами на `ng-template`.

```html
<rt-toolbar dense>
    <ng-template rtToolbarLeft><rt-icon-button icon="arrow-left" ariaLabel="Назад" /></ng-template>
    <ng-template rtToolbarCenter><h3>Заявка №12</h3></ng-template>
    <ng-template rtToolbarRight><rt-menu … /></ng-template>
</rt-toolbar>
```

| вход    | тип       | умолчание |
| ------- | --------- | --------- |
| `dense` | `boolean` | `false`   |

Выходов нет.

## Главное, что нужно знать

**Без единого слота панель не рисуется вовсе** — ни одного узла в DOM. Необъявленный слот тоже
не создаёт пустой полосы: пустая полоса занимала бы место и растягивала соседние.

## Проверки

[`rt-toolbar.component.spec.ts`](./rt-toolbar.component.spec.ts).
