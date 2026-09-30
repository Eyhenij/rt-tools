# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — Widget
- **Done:** branch from `RT-2367-visitor-talks-and-operator`, task in «In progress», folder, plan;
  the mockup frame «Закрыт» read; the rules and scenarios SC-CH-112…115; the service keeps the
  minute of the closing and sends it to the stream of the visitor
- **Next step:** the widget shows the closed talk and starts a new talk from it
- **Uncommitted:** nothing
- **Waiting for the owner:** the proposals of the rules reviews of RT-2373, RT-2366, RT-2365 and RT-2367
- **PR:** not open yet

## Steps

- [x] 1.1 Write the rules, the state and the scenarios into the widget spec and the chat data
- [x] 2.1 Keep the minute of the closing and send the closing into the stream of the visitor
- [x] 2.2 Cover it by the service tests
- [>] 3.1 Draw the closed talk and send the next remark into a new talk
- [ ] 3.2 Write the end-to-end checks and take the frame of the closed talk
- [ ] 4.1 Run the full set of checks

## Decisions along the way

## Sessions

### 2026-09-30

- The mockup frame «Закрыт» read: the line under the thread, the placeholder of a new question.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-2364-widget-talk-closed

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — Widget
- **Next step:** the widget shows the closed talk and starts a new talk from it
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2364-widget-talk-closed/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/chat/event-stream/implementation.md
 M docs/specs/chat/event-stream/spec.md
 M docs/specs/chat/spec.md
 M docs/specs/chat/widget/scenarios.md
 M docs/specs/chat/widget/spec.md
 M libs/message-bus-api/chat/api/src/lib/chat.events.ts
 M libs/message-bus-api/chat/data-access/src/lib/chat-operator.queries.ts
 M libs/message-bus-api/chat/data-access/src/lib/chat.queries.ts
 M libs/message-bus-api/chat/feature/src/lib/chat-subscribers.service.ts
 M libs/message-bus-api/chat/feature/src/lib/chat-talk.service.ts
 M libs/message-bus-api/chat/feature/src/lib/chat.double.ts
A  prisma/migrations/20260930150000_chat_conversation_closed_at/migration.sql
 M prisma/schema.prisma
```

### Commits over the main branch

```
a532c3160 docs(rt:message-bus): папка задачи закрытого разговора в виджете посетителя
fadfe1332 docs(rt:message-bus): папка задачи списка обращений посетителя разобрана в архив
41e41c246 feat(rt:message-bus): виджет показывает обращения посетителя и имя сотрудника
717f319a0 feat(rt:message-bus): у посетителя несколько обращений, и ответ помнит имя сотрудника
535a7ac01 docs(rt:message-bus): папка задачи списка обращений посетителя и имени сотрудника
6d66f9751 docs(rt:message-bus): папка задачи вида виджета посетителя разобрана в архив
7fac9aba2 test(rt:message-bus): кадры виджета на странице и на узком экране сняты по новому виду
0e02cbe74 feat(rt:message-bus): виджет посетителя по макету — круглая кнопка, синяя шапка, пузыри
750aba220 docs(rt:message-bus): папка задачи вида виджета посетителя по макету
f34fada47 docs(rt:ui-kit-v2): папка задачи поля сообщения разобрана в архив
0fcb8d9c2 feat(rt:message-bus): панель «Чат» и страница «Переписка» — новое поле сообщения
f28c6ce8f test(rt:ui-kit-v2): витрина поля сообщения — девять состояний макета и подсказка
a22cd7e03 fix(rt:ui-kit-v2): поле сообщения вмещает весь набранный текст
de29c4d5b feat(rt:ui-kit-v2): поле сообщения rt-message-composer — капсула с круглыми кнопками
9b4ac75bf docs(rt:ui-kit-v2): папка задачи нового вида поля сообщения чата
1908e9589 fix(rt:ui-kit-v2): итог панели диапазона берёт приглушённый цвет текста кита
1ed03359d docs(rt:ui-kit-v2): папка задачи поля диапазона дат разобрана в архив
7c73b38b4 test(rt:ui-kit-v2): витрина поля диапазона дат и эталоны её кадров
8d7255fa2 feat(rt:ui-kit-v2): поле диапазона дат rt-date-range с панелью из двух месяцев
39d5b80d0 docs(rt:ui-kit-v2): папка задачи поля диапазона дат
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
