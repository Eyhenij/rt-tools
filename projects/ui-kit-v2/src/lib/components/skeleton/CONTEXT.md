# `rt-skeleton`

```html
<rt-skeleton shape="rectangle" size="md" width="240px" height="16px" borderRadius="xl" [animation]="true" />
```

| вход           | тип                                    | умолчание     |
| -------------- | -------------------------------------- | ------------- |
| `shape`        | `'rectangle' \| 'circle' \| 'square'`  | `'rectangle'` |
| `size`         | `'sm' \| 'md' \| 'lg'`                 | `'md'`        |
| `width`        | `string` (любая CSS-длина)             | `'100%'`      |
| `height`       | `string`                               | `'10px'`      |
| `borderRadius` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'xl'`        |
| `animation`    | `boolean`                              | `true`        |

Шкала размеров: `sm` 10px, `md` 15px, `lg` 20px. Шкала скруглений: `xs` 2, `sm` 4, `md` 6,
`lg` 10, `xl` 999px.

## Главное, что нужно знать

**Напрямую его почти не ставят.** Условную отрисовку делает
[`rt-skeleton-wrapper`](../skeleton-wrapper/CONTEXT.md): он решает, что показать — заглушку или
проекцию, — и пробрасывает сюда все эти входы. Прямой `rt-skeleton` уместен там, где заглушка
рисуется без пары «загрузка/контент»: сетка карточек-призраков, макет страницы.

## Края

- **Умолчание высоты — 10px, хотя умолчание размера — `md` (15px).** Расхождение намеренное:
  полоска текста тоньше шага размера. Прямоугольник слушается `height`, круг и квадрат — нет.
- Круг и квадрат берут сторону из `size` и **игнорируют** `width`/`height`. Круг всегда `50%`
  скругления, квадрат — всегда 4px; `borderRadius` для них не работает.
- `animation` принимает голый атрибут (`animation` без значения = `true`).
- Мерцание снимается у пользователей с `prefers-reduced-motion` — правило в SCSS.

## Рядом

- [`rt-skeleton-wrapper`](../skeleton-wrapper/CONTEXT.md) — обёртка «загрузка ↔ контент».
- Проверки: [`rt-skeleton.component.spec.ts`](./rt-skeleton.component.spec.ts).
