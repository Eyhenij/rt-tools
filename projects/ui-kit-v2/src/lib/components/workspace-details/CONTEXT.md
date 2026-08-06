# `rt-workspace-details`

Типовое наполнение правой панели рабочего стола: перечень полей, суммы, переключатели, переход
по этапам, история и кнопки действий.

```html
<rt-workspace-details
    title="Заявка №12"
    [rows]="rows()"
    [money]="money()"
    [toggles]="toggles()"
    [transition]="transition()"
    [audit]="audit()"
    [actions]="actions()"
    [loading]="loading()"
    (toggleChange)="onToggle($event)"
    (transitionSubmit)="moveStage($event)"
    (auditLoadMore)="loadMoreAudit()"
    (actionClicked)="runAction($event)" />
```

Входы: `title`, `entityId`, `loading`, `busy`, `rows`, `agentEdit`, `money`, `toggles`,
`toggleHint`, `transition`, `audit`, `actions`, `error`.
Выходы: `toggleChange`, `agentReassign`, `transitionSubmit`, `transitionSuccessClose`,
`transitionErrorClose`, `auditLoadMore`, `actionClicked`.

## Главное, что нужно знать

**Вкладки появляются только вместе с переходом или историей.** Пока есть одни поля, они рисуются
сразу: одна вкладка вместо содержимого была бы лишним щелчком.

**Ошибка не рисуется внутри панели — она уходит в [`NotificationBus`](../toast/CONTEXT.md).**
Панель узкая, и сообщение в ней сдвигало бы данные; тост показывает ошибку поверх. Одна и та же
строка не повторяется на каждой перерисовке.

## Края

- `loading` подменяет заглушками значения полей и сумм, подписи остаются.
- Действие с `confirm` открывает [`[rtConfirm]`](../confirm-popover/CONTEXT.md), и
  `actionClicked` приходит только после подтверждения.
- Смена исполнителя (`agentEdit`) — отдельный сценарий с выбором и подтверждением; событие
  `agentReassign` отдаёт идентификатор нового исполнителя.

## Проверки

[`rt-workspace-details.component.spec.ts`](./rt-workspace-details.component.spec.ts).
