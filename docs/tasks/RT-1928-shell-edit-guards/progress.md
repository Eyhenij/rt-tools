# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 из 2 — оба этапа сделаны, набор пакета гоняется целиком
- **Done:** задача заведена из груза, ветка снята с главной, доска переведена в работу. Найдено,
  где разбор уже лежит: `projects/agent-kit/assets/hooks/write-targets.sh`, помощник
  `rt_write_targets` — его зовут гард места правки и гард экзамена.
- **Next step:** дождаться набора пакета целиком, разобрать папку задачи и открыть заявку.
- **Uncommitted:** правка трёх гардов, их наборы, спеки.
- **Waiting for the owner:** нет.
- **PR:** ещё не открыт.

## Decisions along the way

- **Гард якорей получил свой поддомен спеки, а не строку в спеке гардов** — у него не было ни
  набора проб, ни спеки вовсе, а спека гардов подошла к пределу длины: два сценария в ней дали бы
  501 строку при пределе 500. Цена ошибки: сценарии легли бы в текст, который следующая же правка
  обязана делить.
- **Общий разбор путей уже лежал в пакете** — `write-targets.sh`, помощник `rt_write_targets`, его
  звали гард места правки и гард экзамена. Первый этап свёлся к тому, чтобы дать разбору свой
  набор проб: по красному набору гарда не видно, промах в разборе или в гарде.

- **Ветка снята с главной** — след правки не пересекается с открытыми работами: RT-1915 правит
  сверку очереди работ, эта — гарды правки.

## Sessions

### 2026-09-08

- Разобрано неразобранное в приёмнике: из восьми предложений первое взято в работу задачей
  RT-1928. Запись груза чужого дерева, поэтому «в работе» на ней не ставится — она закрывается
  издателем после слияния.
- Заведена папка задачи и ветка `RT-1928-shell-edit-guards`.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-1928-shell-edit-guards

### Where we stand at the minute of the compaction

- **State:** `замысел-записан`
- **Stage:** 0 из 2 — замысел записан, первый этап не начат
- **Next step:** найти, где в пакете уже лежит разбор путей из текста команды, и объявить его
- **PR:** ещё не открыт.

The progress in full — `docs/tasks/RT-1928-shell-edit-guards/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
108f27202 docs(rt:agent-kit): папка задачи RT-1928 заведена
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
