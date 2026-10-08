# `rt-ai-chat`

```html
<rt-ai-chat
    title="Ava"
    placeholder="Ask Ava…"
    fullScreenable
    [messages]="messages()"
    [suggestions]="suggestions"
    [sending]="running()"
    [error]="runError()"
    [threads]="threads()"
    [activeThreadId]="threadId()"
    [(fullScreen)]="fullScreen"
    (send)="ask($event)"
    (stop)="stop()"
    (retry)="retry()"
    (newThread)="newThread()"
    (selectThread)="open($event)"
    (deleteThread)="confirmDelete($event)"
    (feedbackChange)="rate($event)"
    (closed)="close()">
    <ng-template let-message rtAiChatMessageExtra>…графики ответа…</ng-template>
</rt-ai-chat>
```

Спек — `docs/specs/ui-kit-v2/ai-chat/`; здесь только устройство папки.

## Главное, что нужно знать

**Организм презентационный.** Сообщения с ходом работы, беседы и ошибка приходят входами, действия
уходят выходами. Поток событий модели разбирает приложение и отдаёт готовый `IRtAiChat.Message[]`.

**Живёт во входе `rich-editor`**: держит `rt-message-composer`, а тот тянет quill.

**Высоту задаёт родитель.** Хост — колонка на `block-size: 100%`; без высоты у родителя лента
меряется по содержимому и не прокручивается.

## Края

- `fullScreen`, `threadsOpen`, `draft` — `model()`: атрибут без значения даёт пустую строку, то
  есть ложь. Пишется `[fullScreen]="true"`.
- Фокус переводит сам организм: на «назад» при открытии бесед, в поле сообщения после выбора
  беседы, новой беседы, «Стоп» и возврата к ленте. Приложению — `focusComposer()`.
- Открытые шаги хода работы — внутреннее состояние (`openRuns`), по id ответа.
- Лента держится у низа, пока человек внизу: `nextAtBottom` и `RT_CHAT_PIN_RETRY_DELAYS_MS` из
  логики `rt-chat`. Отправка вопроса и выбор беседы прижимают ленту к низу всегда.
- Удаление беседы — действие строки `rt-thread-list` (`rtThreadListRowActions`), подтверждение —
  на приложении.
- Подсветка совпадений поиска по беседам — `splitSideMenuTitle`.
- Ответ рисует внутренний `rt-ai-chat-answer` (папка `answer/`): без него шаблон организма
  превышает предел цикломатической сложности.

## Рядом

- [`rt-chat`](../chat/CONTEXT.md) — переписка людей.
- [`rt-ai-run-status`](../../../../lib/components/ai-run-status/CONTEXT.md) — строка хода работы.
- [`rt-thread-list`](../../../../lib/components/thread-list/CONTEXT.md) — список бесед.
