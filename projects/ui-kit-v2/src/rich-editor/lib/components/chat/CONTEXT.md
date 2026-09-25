# `rt-chat`

Переписка: лента сообщений, шапка и поле ответа.

```html
<rt-chat
    title="Переписка по заявке"
    showRefresh
    [messages]="messages()"
    [hasThread]="true"
    [canReply]="canReply()"
    [loading]="loading()"
    [attachments]="true"
    (send)="onSend($event)"
    (refresh)="reload()" />
```

Основные входы: `messages`, `hasThread`, `canReply`, `replyBlockReason`, `loading`, `fetching`,
`sending`, `attachments`, `accept`, `formatting`, `title`, `showRefresh`, `showExpand`, `fill`.
Выходы: `send`, `refresh` и события по сообщениям (повтор, удаление).

## Главное, что нужно знать

**Своё действие у реплики объявляется шаблоном, а не правкой кита.** `<ng-template
rtChatMessageActions let-message>` рисуется в меню «…» у реплики, видимость держит предикат
`messageHasActions`; не задан — точка показывается у каждой. Точечные действия — удаление, повтор
отправки, скачивание — остаются своими входами и выходами: они общи для любой переписки.

**Без `hasThread` чат рисует только подсказку выбора.** Ни ленты, ни поля ответа не будет —
это состояние «переписка не выбрана», а не «переписка пустая».

**Шапка появляется только вместе с кнопками**: `showHeader = showRefresh || showExpand`.
Один `title` шапку не создаёт.

**Поле ответа гейтится `canReply`.** Когда отвечать нельзя, вместо него рисуется причина
из `replyBlockReason`.

**Удалённое сообщение остаётся в ленте** отдельной пометкой вместо текста: иначе непонятно, на
что отвечали соседние реплики.

## Края

- Режим `formatting` подменяет простое поле [`rt-rich-editor`](../rich-editor/CONTEXT.md);
  тот грузит Quill динамическим импортом.
- Неотправленное сообщение (`status: 'failed'`) получает кнопку повтора.
- Файлы можно бросать прямо в ленту — чат обёрнут в [`rt-file-drop`](../../../../lib/components/file-drop/CONTEXT.md).
