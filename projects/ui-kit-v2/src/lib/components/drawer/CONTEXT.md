# `rt-drawer`

Боковая панель внутри участка страницы. `rt-drawer-container` — строка из содержимого и
панелей, `rt-drawer` — панель у края, `rt-resize-handle` — ручка ширины.

```html
<rt-drawer-container>
    <rt-drawer mode="over" position="end" resizable [(opened)]="open" [(width)]="width">…</rt-drawer>
    <section>Отчёт</section>
</rt-drawer-container>
```

| вход           | тип                | умолчание |
| -------------- | ------------------ | --------- |
| `opened`       | `boolean`          | `false`   |
| `mode`         | `'side' \| 'over'` | `'side'`  |
| `position`     | `'start' \| 'end'` | `'start'` |
| `hasBackdrop`  | `boolean`          | `true`    |
| `disableClose` | `boolean`          | `false`   |
| `width`        | `number`           | `320`     |
| `minWidth`     | `number`           | `200`     |
| `maxWidth`     | `number`           | `640`     |
| `resizable`    | `boolean`          | `false`   |
| `ariaLabel`    | `string \| null`   | `null`    |

Выходы: `openedChange`, `widthChange`. Методы: `open()`, `close()`, `toggle()`.

## Главное, что нужно знать

**Хост панели — `display: contents`.** Подложка и `<aside>` становятся участниками гибкой строки
контейнера; порядок на экране задаёт `order` по краю, а в разметке содержимое идёт первым, чтобы
панель поверх рисовалась над его узлами с положением без слоёв.

**Закрытая панель не уходит из разметки.** Рядом — `inline-size: 0`, поверх — сдвиг за край;
видимость гаснет после перехода, `inert` снимает её из фокуса.

**Escape и подложка закрывают только поверх.** Рядом панель — часть страницы.

**Ручка ширину не хранит.** Она сообщает новую в пределах; без `width` меряет родителя в момент
первого движения — так её берёт правая панель `rt-container` шириной по содержимому.
