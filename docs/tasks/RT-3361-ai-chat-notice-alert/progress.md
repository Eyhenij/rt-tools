# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Передача
- **Done:** вход `live`, плашка в ленте с `role="status"`, спеки 21 и 11, типы, тексты, `check:specs` и проверка обзоров зелёные; макет и витрина одобрены, 50 из 50 чисел
- **Next step:** запись в архив, папка задачи убрана, набор перед push; PR в ветку эпика после отправки самой ветки эпика (ждёт слияния #3363)
- **Uncommitted:** нет
- **Waiting for the owner:** слияние #3363
- **PR:** not open yet

## Steps

- [x] 1.1 Вход `live` у `rt-message` и роль из него в шаблоне
- [x] 1.2 `live="status"` у плашки `notice` в блоках ответа
- [x] 1.3 Спеки SC-UKV-1329 (`rt-message`) и SC-UKV-1330 (плашка в ленте)
- [x] 2.1 Правило и сценарии в спеке ai-chat, привязки в `implementation.md`
- [x] 2.2 Вход `live` в Overview и CONTEXT `rt-message`
- [x] 3.1 Кадр Figma: вид не меняется, роль подписана; одобрение владельца
- [x] 3.2 Витрина и сверка чисел; одобрение владельца
- [>] 4.1 Папка задачи разобрана в архив, набор, PR в ветку эпика

## Decisions along the way

- **Сценарий один, SC-UKV-1329 — плашка в ленте.** У `rt-message` нет своего спека, его тесты идут без номеров; вход `live` проверен тестом `rt-message` без номера. Номер SC-UKV-1330 не занят. Affected stage of the plan: 1.

## Sessions

### 2026-11-17

- Задача заведена по находке ревью RT-3334, черновик правки готов.
- Макет одобрен. Витрина Blocks измерена в закреплённом Chrome: 50 из 50 чисел, у 7 плашек notice роль `status`.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/ai-chat-blocks
**Branch:** RT-3361-ai-chat-notice-alert

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — Одобрения
- **Next step:** кадр Figma без изменения вида, вопрос владельцу об одобрении
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3361-ai-chat-notice-alert/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
7ce1264af docs(rt:ui-kit-v2): одобрение макета RT-3361
3238d2625 fix(rt:ui-kit-v2): плашка notice в ленте ответа не перебивает диктор
42fa56740 docs(rt:ui-kit-v2): план задачи RT-3361 — плашка notice в ленте не тревога
1ffcfb60c chore(rt:agent-kit): из архива удалены записи старше недели
c687ac593 Merge remote-tracking branch 'origin/main' into RT-3346-ai-chat-blocks
c3af862df [RT-3334] Ответ rt-ai-chat собирается из блоков markdown и notice (#3359)
dfca99a2d fix(rt:ui-kit-v2): копия блока берётся у того же отрисовщика, что его рисует
a10eb78b4 feat(rt:ui-kit-v2): отрисовщик блока отдаёт текст для копии ответа
674c92386 Merge remote-tracking branch 'origin/RT-3346-ai-chat-blocks' into RT-3334-ai-chat-blocks
2727d65ab Merge remote-tracking branch 'origin/main' into RT-3346-ai-chat-blocks
fe7111162 docs(rt:ui-kit-v2): описание CustomBlock говорит, что блок из реестра не копируется
c69186989 test(rt:ui-kit-v2): эталон истории блоков ответа rt-ai-chat
ed2ec0404 fix(rt:ui-kit-v2): рамка и скругление заглушки блока через свои свойства
6006b90fb Merge branch 'RT-3346-ai-chat-blocks' into RT-3334-ai-chat-blocks
3ebad4417 Merge remote-tracking branch 'origin/main' into RT-3346-ai-chat-blocks
b9b329967 docs(rt:ui-kit-v2): папка задачи RT-3334 разобрана в архив
ebc31a0df docs(rt:ui-kit-v2): спек ai-chat говорит о блоках ответа, а не о тексте
f09f90f54 docs(rt:ui-kit-v2): одобрение витрины блоков ответа RT-3334
6104bd3c7 fix(rt:ui-kit-v2): высота строки заглушки блока как в макете
a5124c209 feat(rt:ui-kit-v2): ответ rt-ai-chat собирается из блоков
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
