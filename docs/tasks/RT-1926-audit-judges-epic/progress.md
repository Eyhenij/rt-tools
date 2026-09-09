# Ход работы

## Где стоим

Переписывается каждым заходом, а не дописывается.

- **State:** `этапы-кончились`
- **Этап:** все четыре закрыты
- **Сделано:** этап 4. Раскладка положила два модуля, привязки утверждений стоят в спеке
  подобласти и в компаньонах двух правил. Сверка спеков, сверка путей и набор пакета зелёные.
- **Следующий шаг:** запись в архив, разбор папки задачи, отправка ветки и заявка черновиком
  в ветку эпика.
- **Незакоммиченное:** нет.
- **Ждём владельца:** слияния заявок #1948 и #1952 в ветку эпика.
- **Заявка:** ещё не открыта.

## Решения по ходу

- **Ветка эпика узнаётся по номеру в имени основания, а не по списку ссылок.** Сверка читает
  очередь и в дерево не ходит; задача и её эпик номером не совпадают никогда.
- **Пробы легли в набор сверки очереди, а не в свой файл.** Замысел называл свой; обвязка стенда —
  двойник хостинга, настройки, запуск — живёт в наборе сверки, и второй такой же был бы копией.
  Места в файле хватает: 460 строк при пределе 500.
- **Стенд сверки вынесен в отдельный файл рядом с набором.** Пробы этапа 3 подняли набор до 509
  строк при пределе 500. Дерево-фикстура, двойник хостинга и вызовы сверки общие, и они ушли в
  `lib-board.sh`; набор стал 440 строк.
- **Ветка отведена от ветки #1925, а не от ветки эпика.** План эпика велит стопку там, где
  следующая задача правит написанное предыдущей: сверка берёт чтение объявления из модуля, который
  завела #1925.

## Заходы

### 09.09.2026

- Задача взята сразу после того, как #1925 отдана заявкой #1952.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-worktree-2
**Branch:** RT-1926-audit-judges-epic

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 и 2 закрыты, впереди 3 — эпик без ветки и эпик, которому пора в главную
- **Next step:** этап 3 — карточка с меткой эпика без ветки и эпик, все задачи которого

The progress in full — `docs/tasks/RT-1926-audit-judges-epic/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/agent-kit/board/implementation.md
 M docs/specs/agent-kit/board/scenarios.md
 M docs/specs/agent-kit/board/spec.md
 M projects/agent-kit/tests/checks-board.test.sh
?? docs/tasks/RT-1889-form-dictionary-modifiers/
?? projects/agent-kit/tests/checks-board-epics.test.sh
?? projects/agent-kit/tests/lib-board.sh
```

### Commits over the main branch

```
9731e6c95 feat(rt:agent-kit): сверка называет эпик без ветки и эпик, которому пора в главную
2f39906c4 docs: разбор происшествия — просьба влить при стоящем черновике
1b2057ada feat(rt:agent-kit): сверка судит основание заявки задачи эпика
643e68463 feat(rt:agent-kit): сверка называет задачу без эпика
49c4f52ba docs: заведена папка задачи RT-1926
684be0f03 chore: новые разложенные модули спрятаны от форматтера, срок записей прошлого убран
b89d9f8e7 docs: разобрана папка задачи RT-1925
df06023c9 feat(rt:agent-kit): заявка эпика ждёт разбора папок его задач
f47bf5e7d feat(rt:agent-kit): заявка задачи эпика идёт в ветку эпика
21c629c72 feat(rt:agent-kit): гард судит основание ветки задачи по ветке эпика
f3e35771a feat(rt:agent-kit): состояние задачи несёт номер её эпика
9764a856c docs: заведена папка задачи RT-1925
f5ffab832 Merge remote-tracking branch 'origin/main' into RT-1921-work-by-epics
dc8bd608d Merge remote-tracking branch 'origin/RT-1921-work-by-epics' into RT-1921-work-by-epics
341d3abca [RT-1922] Закон поставки называет эпик единицей поставки (#1930)
b9501ac1c Merge remote-tracking branch 'origin/main' into RT-1921-work-by-epics
0474d76c4 Merge branch 'RT-1921-work-by-epics' into RT-1922-epic-is-delivery-unit
3a25f717c fix(rt:agent-kit): краснота главной, приехавшая с ней в ветку, починена
b34b67634 Merge remote-tracking branch 'origin/main' into RT-1921-work-by-epics
122b04976 [RT-1923] Правила и паттерны поставки говорят о ветке эпика (#1932)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
