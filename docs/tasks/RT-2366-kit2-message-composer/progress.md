# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 1 of 4 — Agreement
- **Done:** branch from `RT-2373-kit2-date-range`, task in «In progress», folder, plan
- **Next step:** the message-composer subdomain spec; the next free scenario is `SC-UKV-479`
- **Uncommitted:** nothing
- **Waiting for the owner:** no; the rules review of RT-2373 left three proposals for the rules
  texts, and they wait for the owner's word
- **PR:** not open yet

## Steps

- [>] 1.1 Write the message-composer subdomain spec
- [ ] 1.2 Write its scenarios and binding lines
- [ ] 2.1 Redraw the template and the styles of the composer as the capsule with the round buttons
- [ ] 2.2 Add the spinner of sending and the hint under the field
- [ ] 2.3 Cover the states by the component spec
- [ ] 3.1 Show the nine states of the mockup and the hint in the stories
- [ ] 3.2 Rewrite the overview page and the context of the composer
- [ ] 3.3 Re-take the snapshots of the composer and the chat
- [ ] 3.4 Re-take the admin frames that show the chat
- [ ] 4.1 Run the full set of checks

## Decisions along the way

## Sessions

### 2026-09-30

- The mockup read: page Message Composer, frame 6022:36 with nine states.
- The component read: the textarea, the divider, the row of icon buttons; the consumer is `rt-chat`.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-2366-kit2-message-composer

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 4 — Agreement
- **Next step:** the message-composer subdomain spec; the next free scenario is `SC-UKV-479`
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2366-kit2-message-composer/progress.md`; the plan lies next to it.

### Uncommitted

```
?? docs/tasks/RT-2366-kit2-message-composer/
```

### Commits over the main branch

```
1908e9589 fix(rt:ui-kit-v2): итог панели диапазона берёт приглушённый цвет текста кита
1ed03359d docs(rt:ui-kit-v2): папка задачи поля диапазона дат разобрана в архив
7c73b38b4 test(rt:ui-kit-v2): витрина поля диапазона дат и эталоны её кадров
8d7255fa2 feat(rt:ui-kit-v2): поле диапазона дат rt-date-range с панелью из двух месяцев
39d5b80d0 docs(rt:ui-kit-v2): папка задачи поля диапазона дат
57e4af507 test(rt:ui-kit-v2): сценарий текста поля даты получил свободный номер SC-UKV-467
2b84d196f test(rt:message-bus): тест раздела использования читает день в поле периода как 01.08.2026
2e2f93a50 chore: записи архива старше недели убраны
a61fcdfee docs(rt:ui-kit-v2): пример даты en-US в описании поля — без кавычек кода
c11613d85 test(rt:message-bus): эталон экрана использования — день в поле периода как 01.08.2026
f192c98bc test(rt:ui-kit-v2): кадры поля и панели даты сняты заново
8ac8dab68 feat(rt:ui-kit-v2): поле даты показывает и принимает дату в порядке языка интерфейса
6a6ae0609 fix(rt:ui-kit-v2): поле даты шириной по форме значения
6f9f5f101 Merge remote-tracking branch 'origin/RT-2416-kit2-admin-e2e-epic' into RT-2372-kit2-date-panel
d9f2ba5b6 docs(rt:message-bus): папка RT-2416 разобрана в архив
9c2f3c9cc test(rt:message-bus): отбор по дереву мерится по подписи, эталон входа в тёмной теме переснят
121ac101a docs(rt:message-bus): папка задачи о двух красных тестах админки на ветке эпика
11c6ce085 test(rt:message-bus): границы фильтра периода читаются из входов поля даты
c4ba80088 refactor(rt:ui-kit-v2): шаблон матрицы панели даты — в своём файле
778703002 fix(rt:ui-kit-v2): подсказка узкого поля даты обрезается многоточием
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
