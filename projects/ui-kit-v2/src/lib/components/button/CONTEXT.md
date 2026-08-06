# `[rtButton]`

Это **директива**, а не компонент: она вешается на существующий `<button>` или `<a>`.

```html
<button rtButton label="Войти" theme="primary"></button>
<button rtButton label="Скачать" icon="ico-download" iconPos="left" theme="success"></button>
<button rtButton icon="ico-pencil" appearance="text"></button>
<button rtButton label="Сохранение…" [loading]="saving()" [disabled]="saving()"></button>
<a rtButton label="На главную" [routerLink]="'/'"></a>
```

| вход          | тип                                                                        | умолчание                  |
| ------------- | -------------------------------------------------------------------------- | -------------------------- |
| `label`       | `string \| null`                                                           | `null`                     |
| `icon`        | `string \| null` (имя из набора `rt-icon`)                                 | `null`                     |
| `iconPos`     | `'left' \| 'right'`                                                        | `'left'`                   |
| `theme`       | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'primary'`                |
| `appearance`  | `'filled' \| 'outlined' \| 'text'`                                         | `'filled'`                 |
| `size`        | `'sm' \| 'md' \| 'lg'` (30 / 40 / 50 px)                                   | `'md'`                     |
| `rounded`     | `boolean`                                                                  | `false`                    |
| `loading`     | `boolean`                                                                  | `false`                    |
| `loadingIcon` | `string \| null`                                                           | `null` → встроенное кольцо |

Своего выхода нет — клик слушается нативным `(click)` на самом элементе.

## Главное, что нужно знать

**Содержимое кнопки директива рисует сама** через `Renderer2` — подпись и иконка не проецируются.
Поэтому `<button rtButton label="…"></button>` пишется с пустым телом: всё, что положить внутрь
руками, будет соседствовать с дорисованным, а не заменять его.

**Класс выводится только на отличие от умолчания.** `theme="primary"`, `appearance="filled"` и
`size="md"` не дают ни одного класса — стиль по умолчанию живёт на самом блоке `rt-button`.

## Края

- **Выход из загрузки ждёт `animationend` гаснущего кольца.** Там, где анимаций нет (тест,
  `prefers-reduced-motion`, скрытая вкладка), содержимое так и останется кольцом. Событие можно
  послать руками — так это проверено в спеке.
- Очистка перед перерисовкой идёт **по классам**, а не по сохранённым ссылкам: после гидратации
  серверной разметки ссылки принадлежат другому экземпляру директивы, и подпись удваивалась бы.
- Имя иконки типизировано как обычная строка (совместимость со старыми потребителями). Неизвестное
  имя не роняет ничего — `<use>` просто не разрешится, и место останется пустым.
- Отключение — нативный атрибут `disabled` на самом элементе, у директивы своего входа для этого
  нет.

## Рядом

- [`rt-icon-button`](../icon-button/CONTEXT.md) — кнопка без подписи, с обязательным `ariaLabel`.
- [`rt-split-button`](../split-button/CONTEXT.md) — кнопка с прикреплённым меню.
- Проверки: [`rt-button.directive.spec.ts`](./rt-button.directive.spec.ts).
