# `rt-toaster` + `rt-toast`

Стопка всплывающих уведомлений. В разметку ставится **один** `rt-toaster` — обычно в корне
приложения; отдельные `rt-toast` он создаёт сам.

```html
<!-- один раз на приложение -->
<rt-toaster position="bottom-right" [duration]="4000" [visibleToasts]="3" />
```

```typescript
readonly #notifications: NotificationBus = inject(NotificationBus);

this.#notifications.success('Сохранено');
this.#notifications.error('Не удалось сохранить', 'danger', {
    description: 'Проверьте соединение',
    action: { label: 'Повторить', handler: (): void => this.retry() },
});
```

| вход `rt-toaster` | тип                                                                                               | умолчание        |
| ----------------- | ------------------------------------------------------------------------------------------------- | ---------------- |
| `position`        | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'bottom-right'` |
| `duration`        | `number \| string` (мс)                                                                           | `4000`           |
| `visibleToasts`   | `number \| string`                                                                                | `3`              |
| `expand`          | `boolean`                                                                                         | `false`          |

## Главное, что нужно знать

**Тосты показываются не входом, а шиной.** Стопка подписана на
[`NotificationBus`](../../platform/notification-bus.service.ts) и других способов показать тост
нет. Шина — `providedIn: 'root'`, поэтому её достаточно инжектировать где угодно.

Четыре метода шины задают палитру и иконку: `success` → `check-circle`, `info` → `info-circle`,
`warning` → `exclamation-circle`, `error` → `times-circle`.

## Как этим пользоваться

- Новый тост встаёт **первым** — стопка растёт сверху.
- Наведение на стопку разворачивает её и приостанавливает исчезновение; нажатая кнопка мыши
  удерживает развёрнутое состояние до отпускания.
- `action` и `secondaryAction` рисуются кнопками внутри тоста и зовут переданные обработчики.
- `meta` — приписка над сообщением (номер заявки), `description` — вторая строка под ним.
- Положение раскладывается на два модификатора: `rt-toaster--y--bottom` и `rt-toaster--x--right`.

## Доступность

Стопка — `role="region"` с переведённой подписью, каждый тост — `role="status"` с
`aria-atomic="true"`: скринридер читает уведомление целиком, а не по изменившимся кускам.

## Рядом

- [`rt-message`](../message/CONTEXT.md) — постоянное сообщение внутри страницы, а не всплывающее.
- Проверки: [`rt-toaster.component.spec.ts`](./rt-toaster.component.spec.ts).
