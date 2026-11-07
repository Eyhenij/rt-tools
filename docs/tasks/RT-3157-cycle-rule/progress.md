# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — Договорённость
- **Done:** паттерн цикла, поле метрики в запуске выпуска, договорённость влита
- **Next step:** собрать запись архива, разобрать папку, прогнать набор и открыть PR
- **Uncommitted:** нет
- **Waiting for the owner:** нет, #3162, #3163, #3164, #3165 и #3166 на ревью, работа идёт стопкой
- **PR:** not open yet

## Steps

The steps of the plan, all of them, with a mark each. Rewritten by every turn that moves the work.

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Написать паттерн цикла в пакете
- [x] 1.2 Назвать паттерн в правиле и разложить пакет
- [x] 2.1 Написать разбор поля и вставку строки в журнал
- [x] 2.2 Поставить обязательное поле в запуск выпуска
- [x] 2.3 Назвать шаг в правиле правки пакета
- [x] 3.1 Влить договорённость в описание пакета
- [x] 3.2 Поправить адреса и план эпика

## Decisions along the way

- Пять правил без исполнения ушли в открытые вопросы описания: числа поставки, остановка попыток при утечке, что закрывает эпик, запуск первого цикла. Адрес им не выдумывался.
- Два правила поправлены по коду: отказанный токен останавливает попытки, а найденная утечка нет; наблюдением становится смена `send`, а смена `observe` не записывается.
- Отчёт дерева больше не называет выпуск тем, что считает общий отчёт: чисел поставки нигде нет.
- Разделы «вне работы» у приёмника и админки поправлены: сводка по деревьям теперь есть.
- Роль показала слабое место: поле пропускало любой текст. Метрика теперь начинается с имени из отчётов, причина содержит слово, заголовок без ссылки узнаётся.
- Правило получило статью о цикле, образец строки получил шум, шаблон плана получил поле метрики, роль `goal-critic` получила режим цикла.

## Session log

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/rt-3049-push
**Branch:** RT-3157-cycle-rule

### Where we stand at the minute of the compaction

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — Договорённость
- **Next step:** собрать запись архива, разобрать папку, прогнать набор и открыть PR
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3157-cycle-rule/progress.md`; the plan lies next to it.

### Uncommitted

```
 M .claude/agents/goal-critic.md
 M .claude/skills/agent-kit-source/SKILL.md
 M .claude/skills/task-flow-cycle/SKILL.md
 M .claude/skills/task-flow/SKILL.md
 M .claude/skills/task-flow/implementation.md
 M .github/workflows/publish-agent-kit.yml
 M docs/plans/agent-kit-metrics.md
 M docs/specs/agent-kit/metrics/scenarios.md
 M docs/specs/agent-kit/metrics/spec.md
 M docs/tasks/RT-3157-cycle-rule/progress.md
 M docs/tasks/_template/plan.md
 M projects/agent-kit/assets/agents/goal-critic.md
 M projects/agent-kit/assets/patterns/task-flow-cycle.md
 M projects/agent-kit/assets/rules/task-flow.md
 M projects/agent-kit/assets/samples/tasks/_template/plan.md
 M tools/release-metric.mjs
 M tools/tests/release-metric.test.sh
```

### Commits over the main branch

```
c60648e28 docs(rt:agent-kit): договорённость о метриках влита в описание пакета
b062187cf feat(rt:agent-kit): правка называет метрику, а выпуск её требует
c51f360a0 docs(rt:agent-kit): папка задачи RT-3157
13800ff23 fix(rt:message-bus): роль раздела не пишется в область Keycloak
85c62a1af docs(rt:message-bus): папка задачи RT-3156 разобрана в запись архива
742c66a77 feat(rt:message-bus): раздел «Качество» в админке
f8c9559bf feat(rt:message-bus): операция чтения раздела «Качество»
92769ebc9 feat(rt:message-bus): разбор несёт ресурс, смена шага записи остаётся в журнале
9b6289fb3 docs(rt:message-bus): папка задачи RT-3156
8c497b221 refactor(rt:agent-kit): метка отправки вынесена в свой файл
3d5a1c8bb docs(rt:agent-kit): папка задачи RT-3154 разобрана в запись архива
fd04a1c78 docs(rt:agent-kit): папка задачи RT-3154 дописана
f57c93275 fix(rt:agent-kit): числа складываются по дням и не теряются на повторе
663c30f5b fix(rt:agent-kit): находки ролей по отправке чисел
68c517348 feat(rt:agent-kit): числа уходят без команды человека
5f04901d8 feat(rt:agent-kit): команда send шлёт строки дня
25fbfc7b6 docs(rt:agent-kit): папка задачи RT-3154
31bd90ef5 docs(rt:message-bus): папка задачи RT-3155 разобрана в запись архива
76ba46e5d fix(rt:message-bus): голова строки дня не несёт слов из дерева
a799a5ac0 feat(rt:message-bus): приёмник хранит числа метрик по дням
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
