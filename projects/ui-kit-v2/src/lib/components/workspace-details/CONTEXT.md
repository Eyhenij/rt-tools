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
`toggleHint`, `transition`, `audit`, `actions`, `error`, `errorDescription`.
Выходы: `toggleChange`, `agentReassign`, `transitionSubmit`, `transitionSuccessClose`,
`transitionErrorClose`, `auditLoadMore`, `actionClicked`, `retry`.

## Главное, что нужно знать

**Вкладки появляются только вместе с переходом или историей.** Пока есть одни поля, они рисуются
сразу: одна вкладка вместо содержимого была бы лишним щелчком.

**Ошибка загрузки стоит во вкладке сведений вместо данных, а не тостом.** Вид по умолчанию —
[`rt-empty-state`](../empty-state/CONTEXT.md) с иконкой предупреждения, текстом ошибки и кнопкой
«Повторить». Кнопка только поднимает `retry`: сведения загружает потребитель. Свой вид —
`<ng-template rtWorkspaceDetailsError let-error let-retry="retry">`. Ошибки перехода и истории
по-прежнему уходят в [`NotificationBus`](../toast/CONTEXT.md).

## Края

- `loading` подменяет заглушками значения полей и сумм, подписи остаются.
- Действие с `confirm` открывает [`[rtConfirm]`](../confirm-popover/CONTEXT.md), и
  `actionClicked` приходит только после подтверждения.
- Смена исполнителя (`agentEdit`) — отдельный сценарий с выбором и подтверждением; событие
  `agentReassign` отдаёт идентификатор нового исполнителя.
