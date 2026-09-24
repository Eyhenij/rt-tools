# Ход работы

## Где мы стоим

- **Состояние:** `этап-идёт`
- **Этап:** 4 из 4 — работа отдана
- **Сделано:** строка списка стала общей, оба экрана собраны рабочим столом, сквозной набор
  встроенного раздела зелен, эталон его экрана снят заново и просмотрен, договорённость слита в
  раздел чата.
- **Следующий шаг:** разобрать папку задачи последним коммитом.
- **Незакоммиченное:** код обоих экранов, сквозные спеки, эталон экрана.
- **Ждём владельца:** нет.
- **Заявка:** ещё не открыта.

## Шаги

- `[x]` сделано · `[>]` идёт сейчас · `[ ]` не начат

- [x] 1.1 Переписать `admin-chat-talk` на слова доводом: словарь и службу языка он больше не читает.
- [x] 1.2 Передать слова и язык из панели оператора.
- [x] 1.3 Поправить спеку строки под новые входы.
- [x] 2.1 Поставить на странице `rt-workspace` с тремя колонками и своим ключом ширин.
- [x] 2.2 Взять общую строку списка, свойства, заголовок и действия; убрать кнопку состояния из ленты.
- [x] 2.3 Привести слова страницы к словам договорённости.
- [x] 3.1 Привести спеку встроенного раздела к новым местам и закрыть сцену `SC-CH-98`.
- [x] 3.2 Снять эталон экрана встроенного раздела заново.
- [x] 3.3 Слить черновик договорённости в спеки раздела чата и привести к нему спеки панели и
      страницы.
- [>] 4.1 Разобрать папку задачи последним коммитом.
- [ ] 4.2 Прогнать набор перед отправкой и открыть заявку в ветку эпика.

## Решения по ходу

- Правила строки списка переехали в её собственный `.scss`: слой раскладки админки до встраиваемой
  страницы не достаёт, и без них строка вытянулась в одну полосу текста.
- Страница задала себе гарнитуру и цвет на `body`: кит объявляет их шкалой, но на `body` не ставит,
  и рамка рисовалась браузерным умолчанием с засечками. Оба промаха увидел только кадр.
- В ленте панели включён показ обновления: заголовок разговора кит рисует только вместе с ним.
- Встраиваемая страница добавлена в область набора `ui-kit-v2`: она рисует тот же экран теми же
  готовыми частями, а проверка единообразия про неё молчала. Новых находок это не дало — 201 место,
  все принятые.

## Сессии

### 2026-09-24

- Ветка отведена от `RT-2337-talks-panel-workspace`: стопкой, как велит замысел эпика.
- Оба экрана собраны рабочим столом, эталоны сняты заново и просмотрены глазами.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-2338-talks-embed-workspace

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 из 4 — строка списка становится общей
- **Next step:** переписать `admin-chat-talk` на слова доводом.

The progress in full — `docs/tasks/RT-2338-talks-embed-workspace/progress.md`; the plan lies next to it.

### Uncommitted

```
 M apps/chat-talks-page/src/app/talks-app.html
 M apps/chat-talks-page/src/app/talks-app.scss
 M apps/chat-talks-page/src/app/talks-app.spec.ts
 M apps/chat-talks-page/src/app/talks-app.ts
 M apps/chat-talks-page/src/app/talks-words.ts
 M apps/chat-talks-page/src/styles.scss
 M apps/message-bus-admin-e2e/__snapshots__/chromium/embedded-talks.png
 M apps/message-bus-admin-e2e/src/embedded-talks.spec.ts
 M apps/message-bus-admin/src/styles/_chat.scss
 M docs/specs/chat/proposed/talks-workspace/scenarios.md
 M libs/message-bus-admin/chat/feature/panel/src/lib/admin-chat-panel.component.html
 M libs/message-bus-admin/chat/feature/panel/src/lib/admin-chat-panel.component.ts
AM libs/message-bus-admin/chat/ui/src/lib/talk/admin-chat-talk.component.scss
 M libs/message-bus-admin/chat/ui/src/lib/talk/admin-chat-talk.component.spec.ts
 M libs/message-bus-admin/chat/ui/src/lib/talk/admin-chat-talk.component.ts
 M libs/message-bus-admin/chat/util/src/lib/chat-workspace.logic.ts
```

### Commits over the main branch

```
d6c27f969 docs(rt:message-bus): папка задачи RT-2338 о рабочем столе встраиваемой страницы
c7162b1f8 docs(rt:message-bus): папка задачи RT-2337 разобрана
27a662d3e feat(rt:message-bus): панель оператора показывает переписку рабочим столом
5a5fcf3bc docs(rt:message-bus): папка задачи RT-2337 о рабочем столе панели
9bb0df198 docs(rt:message-bus): папка задачи RT-2336 разобрана
c6f24a3b9 feat(rt:message-bus): общие части разговора для рабочего стола переписок
e65a6fa92 docs(rt:message-bus): договорённость о рабочем столе переписок и папка задачи
4256d452a chore(rt:agent-kit): записи описания прошлого старше срока убраны
516f2cd1f docs(rt:message-bus): замысел эпика о рабочем столе переписок
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
