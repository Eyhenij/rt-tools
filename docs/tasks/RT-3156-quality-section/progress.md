# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этапы-кончились`
- **Stage:** 4 of 4 — Стенд и тексты
- **Done:** ресурс разбора, журнал переходов, счёт раздела, операция чтения
- **Next step:** собрать запись архива, разобрать папку, прогнать набор и открыть PR
- **Uncommitted:** нет
- **Waiting for the owner:** нет, #3162, #3163, #3164 и #3165 на ревью, работа идёт стопкой
- **PR:** not open yet

## Steps

The steps of the plan, all of them, with a mark each. Rewritten by every turn that moves the work.

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Добавить `Postmortem.resource` и таблицу `RecordTransition` с миграцией
- [x] 1.2 Везти ресурс разбора в грузе пакета
- [x] 1.3 Писать переход записи при смене её шага
- [x] 2.1 Написать чистый счёт раздела по строкам дня
- [x] 2.2 Написать операцию `GET /api/usage/quality`
- [x] 2.3 Посчитать повторные ошибки по разборам и версиям фикса
- [x] 3.1 Завести библиотеки раздела и маршрут
- [x] 3.2 Добавить пункт меню после «Использования»
- [x] 3.3 Собрать три числа, полноту и таблицу причин
- [x] 3.4 Сделать пять состояний экрана
- [x] 4.1 Засеять стенд строками дня
- [x] 4.2 Написать сквозной тест всех состояний
- [x] 4.3 Проверить ширины 1440, 768 и 375 замером
- [x] 4.4 Обновить спеки раздела и сценарии

## Decisions along the way

- Вторая доставка известного разбора в повтор не входит: приезд одного файла запись не множит, и след его не хранится. Договорённость поправлена.
- Третье число считает фиксы с повтором, а не записи: двенадцать записей на десять фиксов давали 120 %.
- Период без строк не показывает нули: ответ несёт `anyInPeriod`.
- Отбор сужает и числа итога: договорённость требует сверять дерево с самим собой, а число, которое не сужается, сдвига не покажет. Полнота остаётся про все деревья.
- Без фиксов старше месяца плитка повторов говорит «нет данных»: в первый цикл так будет всё окно в 30 дней.
- Обрезанная пустота на узком экране лечится в общем слое: `min-width: max-content` держится только у таблицы вне режима карточек, так задуман кит.

- Раздел лежит внутри домена `usage`: новая библиотека одна, `feature/quality`. Свой домен дал бы пустые слои, а стор, плитка и быстрый период уже здесь.
- Ответ `GET /api/usage/quality` стал страницей `IQualityReport extends IPage`: так экран встал на общую основу списка целиком, с адресом, отказом, повтором и карточками. Отступлений от образца два: строка таблицы ничего не открывает, поля порядка только `loss`.
- Договорённость называла право `usage:read`. Проверка SC-MB-306 запрещает одно право на два пункта меню, поэтому у раздела своё право `quality:read`. Договорённость поправлена. После выкатки роль надо выдать владельцу в области.
- Отбор версии получил вход `noneChoice`: у строки дня версия есть всегда, и пункт «без версии» давал бы пустоту.
- Команда подключения стоит в пустом состоянии таблицы, а не своим блоком: так пустоту рисует кит.

- Потери в таблице причин — сумма пустых событий ресурса: пустые отказы, отказы проверки правил, отказы после загрузки, пустые запуски. Договорённость называет сортировку по потерям, но не формулу.
- Вторую доставку известного разбора раздел не считает повтором: приезд одного файла запись не множит, след её не хранится.

## Session log

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/rt-3049-push
**Branch:** RT-3156-quality-section

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Стенд и тексты
- **Next step:** прогнать сквозной тест по всем состояниям на трёх ширинах
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3156-quality-section/progress.md`; the plan lies next to it.

### Uncommitted

```
 M apps/message-bus-admin-e2e/__snapshots__/chromium/chat-section.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/columns-panel.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/details-panel-postmortems.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/details-panel-proposals.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/details-panel-summaries.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/list-empty.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/list-fault.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/list-invites.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/list-postmortems.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/list-proposals.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/list-summaries.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/list-usage.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/shell-dark.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/shell-profile-menu.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/shell.png
 M apps/message-bus-admin-e2e/__snapshots__/chromium/usage-sessions-panel.png
 M apps/message-bus-admin-e2e/__snapshots__/narrow/shell-narrow-nav.png
 M apps/message-bus-admin-e2e/src/metrics-intake.spec.ts
 M apps/message-bus-admin-e2e/src/support/admin.ts
 M apps/message-bus-admin-e2e/stand/metrics-day-rows.mjs
```

### Commits over the main branch

```
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
93354a7f0 docs(rt:message-bus): папка задачи RT-3155 заполнена
2c10bff1a docs(rt:message-bus): папка задачи RT-3155
fba69eb0f docs(rt:agent-kit): брань от человека записана как признак плохой работы
6c210359f feat(rt:agent-kit): три дня на правку после слияния и шире образцы правок
78d9c92cb fix(rt:agent-kit): вторая проверка ролей по записи метрик
0699d5230 refactor(rt:agent-kit): длинные файлы разнесены по соседним
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
