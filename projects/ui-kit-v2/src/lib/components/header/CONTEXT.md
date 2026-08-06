# `rt-header`

Верхняя полоса приложения: кнопка «назад», логотип, приглашение, колокольчик и профиль.

```html
<rt-header showInvite [canGoBack]="canGoBack()" (backClick)="back()" (inviteClick)="invite()" (profileClick)="openProfile()">
    <rt-notifications-bell rtHeaderBell [unread]="hasUnread()" (clicked)="openNotifications()" />
</rt-header>
```

| вход         | тип       | умолчание |
| ------------ | --------- | --------- |
| `canGoBack`  | `boolean` | `false`   |
| `showInvite` | `boolean` | `false`   |

Выходы: `backClick`, `inviteClick`, `profileClick`. Слот `[rtHeaderBell]` — колокольчик.

## Главное, что нужно знать

**Кнопка «назад» не появляется и не исчезает — она проявляется.** Узел есть в разметке всегда,
видимость даёт модификатор `rt-header__back--visible`: иначе соседние элементы шапки прыгали бы
при каждом переходе.

**Колокольчик приходит проекцией.** Шапка ничего не знает про уведомления — их состоянием
владеет приложение.

## Края

- Кнопки действий подогнаны под высоту шапки инлайновым `--rt-icon-button-size: 35px` — это
  осознанный выход за шкалу размеров.
- Логотип рисуется вариантом `wordmark` высотой 15px; сами файлы даёт приложение
  (см. [`rt-logo`](../logo/CONTEXT.md)).

## Рядом

- [`rt-page-header`](../page-header/CONTEXT.md) — вторая полоса, с разделами.
- Проверки: [`rt-header.component.spec.ts`](./rt-header.component.spec.ts).
