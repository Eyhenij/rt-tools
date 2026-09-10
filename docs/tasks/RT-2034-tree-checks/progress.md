# Ход работы

## Где стоим

- **Состояние:** `этапы-кончились`
- **Следующий шаг:** разобрать папку задачи и открыть PR черновиком

## Сессии

### 2026-09-10

- Папка задачи заведена, план написан. Пять записей груза названы полными ключами.
- Ветка отведена от ветки эпика `RT-2028-cargo-intake`.
- **Этап 1 сделан.** Разбор словаря принимает строку таблицы наравне со списком пар.
  `bash projects/agent-kit/tests/checks-glossary.test.sh` — 17 проб, провалов нет.
- **Этап 2 сделан.** Заглушённые вызовы гард экзамена ищет по ключу: обе выборки собирают словарь.
  `bash projects/agent-kit/tests/exam-guard.test.sh` — 40 проб, провалов нет, набор идёт 8 секунд.
- **Этап 3 сделан.** Набор признаков объявляется вместе с областью дерева; дважды объявленный набор
  отбивает прогон. Одно и то же поле читают сплошная проверка и гард правки.
  `bash projects/agent-kit/tests/checks-reuse.test.sh` — 20 проб,
  `bash projects/agent-kit/tests/reuse-guard.test.sh` — 38 проб, провалов нет.
- Сценарии SC-AK-1083, SC-AK-1084, SC-AK-1085, SC-AK-1086 записаны в описания.
  `npm run check:specs` — 6 областей, 1540 сценариев, расхождений нет.
  `node tools/check-file-size.mjs` — длиннее предела 0.
- Проверки PR #2054 (задача #2033) прошли: итог SUCCESS.
- PR #2052 и #2054 аппрувнуты и влиты от имени владельца через браузер; семь записей груза этих
  двух задач помечены в приёмнике сделанными.
- **Этап 4 сделан.** Сверка ярусов отказывает на пустом обходе: объявленная семья без каталога и
  корень без единой либы — два отказа подряд, оба после пропуска.
  `bash projects/agent-kit/tests/checks-lib-layers.test.sh` — 10 проб, провалов нет.
- **Этап 5 сделан.** Карта проверок ведёт описание образа, состав образов, конфиг прокси и образец
  окружения прода в правило о выкатке; конвейер зовёт два правила, правило о выкатке первым.
  `bash projects/agent-kit/tests/skill-gate.test.sh` — 89 проб, провалов нет.
- **Этап 6 сделан.** Сценарии SC-AK-1087 и SC-AK-1088 записаны, пакет собран и разложен.
  `npm run check:specs` — 6 областей, 1546 сценариев, расхождений нет.
  `pnpm run agent-kit:check` — разложенное сходится с пакетом v0.27.0.
  `node tools/check-file-size.mjs` — длиннее предела 0.
  `npm run check:docs` — 582 документа, расхождений нет.
  `npm run check:boundary` — нового непереносимого ресурса нет.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-worktree-2
**Branch:** RT-2034-tree-checks

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Next step:** этап 1 — словарь читается таблицей

The progress in full — `docs/tasks/RT-2034-tree-checks/progress.md`; the plan lies next to it.

### Uncommitted

```
 M projects/agent-kit/assets/checks/check-glossary.mjs
 M projects/agent-kit/assets/hooks/exam-guard.sh
 M projects/agent-kit/tests/checks-glossary.test.sh
 M projects/agent-kit/tests/exam-guard.test.sh
?? docs/tasks/RT-2035-board-and-epics/
?? docs/tasks/RT-2036-cargo-send-silent/
?? docs/tasks/RT-2037-misc-rules-fixes/
?? docs/tasks/RT-2038-pr-opens-ready/
?? docs/tasks/RT-2041-ambiguous-names-unwired/
```

### Commits over the main branch

```
5e8da0457 docs: заведена папка задачи RT-2034
b6ded6545 Merge remote-tracking branch 'origin/main' into RT-2028-cargo-intake
f465583d1 [RT-2031] Проверки поставки перестали считать своей чужую работу (#2051)
13b7998b9 Merge remote-tracking branch 'origin/RT-2028-cargo-intake' into RT-2031-delivery-many-sessions
0d6a51058 docs: папка задачи RT-2031 разобрана
c36ada58e fix(rt:agent-kit): отправка идёт из той копии, где запущена сессия
f6e274733 fix(rt:agent-kit): форма имени ветки судится деревом исполнения
fe07cb1b3 [RT-2030] Проверка конца хода судит ещё четыре вида последнего действия (#2047)
9383b5f93 fix(rt:agent-kit): чужая конфликтующая заявка работу не запрещает
860f7301c docs: заведена папка задачи RT-2031
2102ab851 Merge remote-tracking branch 'origin/RT-2028-cargo-intake' into RT-2030-turn-end-waiting
871d50337 test(rt:agent-kit): набор диспетчера кладёт рядом со стражем и разбор записи
b7e8facf1 fix(rt:agent-kit): у вынесенного файла разбора стоит бит запуска
802792979 docs(rt:agent-kit): привязки указывают на файл, куда переехал разбор
87124ed8b refactor(rt:agent-kit): разбор записи хода вынесен из проверки конца хода
4946117ae docs: папка задачи RT-2030 разобрана
718e0ba41 [RT-2029] Аудит описаний называет то, что не разобрал (#2042)
b6a91ad9a fix(rt:agent-kit): у красной проверки один ход — починить то, на что она указала
42e51d953 fix(rt:agent-kit): проверка конца хода судит ещё четыре рода последнего действия
4a662a264 Merge branch 'RT-2029-spec-audit-false-green' into RT-2030-turn-end-waiting
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
