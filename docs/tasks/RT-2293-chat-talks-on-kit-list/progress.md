# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** the stages are over
- **Done:** all three stages are marked; the nine end-to-end cases of the section are green, the screen reference is re-taken and confirmed by a second run
- **Next step:** bring the texts up to date and run the suite
- **Uncommitted:** the panel, the row, the translation, the styles, the end-to-end spec, the description of the kit component
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Draw the list by `rt-thread-list`: rows, the chosen row, the empty text and the reading.
- [x] 1.2 Put the narrowing by site and by state into the slots of the kit.
- [x] 2.1 Take the control out of the row: the kit draws it itself.
- [x] 2.2 Bring the styles of the section to the markup of the kit.
- [x] 3.1 Bring the labels of the section to the markup of the kit.
- [x] 3.2 Run the end-to-end cases of the chat section.

## Decisions along the way

- **The slot of the search is taken by the narrowing by site** — the kit always draws a search
  field, and the domain has no search over the text of the talks.

## Sessions

### 2026-09-21

- The branch is taken from the epic branch at `6b7e241a6`, the folder is assembled, the plan
  written.
- The list of the talks is drawn by `rt-thread-list`: the narrowing by site stands in the search
  slot, the narrowing by state in the filters slot, and the row lost its control.
- The screen reference of the section is re-taken: the header of the list and the look of the
  chosen row are now the kit's. Nine end-to-end cases of the section are green twice in a row.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-2293-chat-talks-on-kit-list

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — the list is the ready-made of the kit
- **Next step:** draw the list by `rt-thread-list`
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2293-chat-talks-on-kit-list/progress.md`; the plan lies next to it.

### Uncommitted

```
 M libs/message-bus-admin/chat/feature/panel/src/lib/admin-chat-panel.component.html
 M libs/message-bus-admin/chat/feature/panel/src/lib/admin-chat-panel.component.ts
 M libs/message-bus-admin/chat/ui/src/lib/talk/admin-chat-talk.component.html
 M libs/message-bus-admin/chat/ui/src/lib/talk/admin-chat-talk.component.ts
 M libs/message-bus-admin/chat/util/src/lib/chat-kit.mapper.ts
```

### Commits over the main branch

```
4378a35ed docs(rt:ui-kit-v2): папка задачи RT-2299 убрана после слияния веток
877f58360 Merge branch 'RT-2299-kit-thread-list-string-id' into RT-2293-chat-talks-on-kit-list
5535f71e2 docs(rt:ui-kit-v2): папка задачи RT-2299 разобрана, запись в описании прошлого
07c61865e feat(rt:ui-kit-v2): готовый список переписок принимает строковый номер строки
1f65ead82 docs(rt:ui-kit-v2): папка задачи RT-2299 заведена, план записан
7c51de3fe docs(rt:message-bus): папка задачи RT-2293 заведена, план записан
6b7e241a6 Merge remote-tracking branch 'origin/main' into RT-2177-chat-service
445afa5e2 docs: девятая задача эпика чата записана в план
ddd6074eb Merge remote-tracking branch 'origin/main' into RT-2177-chat-service
036eb7912 [RT-2284] Лента панели оператора нарисована готовым чатом кита (#2288)
14799e8d9 [RT-2184] Чат выкатывается на узел, и чужая страница с ним разговаривает (#2287)
ed4444ce0 [RT-2183] Оператор узнаёт о сообщении с закрытой панелью (#2286)
007165829 [RT-2182] Виджет чата ставится в приложение одним скриптом (#2285)
d0584f9e5 [RT-2181] Панель переписок: оператор отвечает на одном экране (#2283)
579e504ba [RT-2180] Новая реплика доходит до открытого экрана потоком событий (#2282)
867728341 [RT-2179] Оператор читает переписки и сообщения страницами (#2281)
340389754 [RT-2178] Хранилище чата и приём первой реплики посетителя (#2280)
4e5a98d82 docs(rt:message-bus): разбор работы по правилам записан, правка описания панели датирована
f8ae4cb2f docs: номера запросов в составе эпика чата пишутся без решётки
75e4e262e docs: восьмая задача эпика чата отдана
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
