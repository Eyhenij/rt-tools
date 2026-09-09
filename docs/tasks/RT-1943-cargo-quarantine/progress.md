# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 5 из 5 — привязки и статья правила
- **Done:** все пять этапов: поддомен со спекой и девятью сценариями; пятое состояние в трёх наборах, миграция и порядок переходов; колонка причины, её разбор в теле правки и два отказа до сети; столбец причины в двух списках админки и печать причины командой чтения груза; спутник поддомена, довод причины у команды отметки и две статьи правила `cargo-triage`
- **Next step:** закрытие: свод текстов, прогон набора, разбор папки, заявка черновиком
- **Uncommitted:** нет
- **Waiting for the owner:** нет
- **PR:** не открыта

## Decisions along the way

- **Довод `--quarantine-note` заведён у команды отметки, хотя в след задачи она не входила** —
  без него дерево не может перевести свою запись в карантин вовсе, а это условие готовности
  задачи. Затронуты этапы плана: 3 и 5.

- **Поддомен заводится свой, а не дописывается в поддомен состояния** — тот на 414 строках при
  пределе в 500, и карантин со своей причиной и своим чтением подвёл бы его к границе. Затронут
  этап плана: 1.

## Sessions

### 2026-09-09

- Клиент хранилища пересобран после правки схемы: без этого сборка приёмника падала тринадцатью
  ошибками типов, и все они говорили о старом клиенте, а не о правке.
- Заготовка папки задачи была снята и собрана заново одним вызовом: раздельные копирование и
  снятие шапки отбиваются гардом договорённости — он читает незаполненный образец замысла.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-1943-cargo-quarantine

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 из 5 — причина карантина
- **Next step:** этап 4 — показ причины в списке и чтение карантина командой; затем этап 5 — привязки спутника и статья правила `cargo-triage`
- **PR:** не открыта

The progress in full — `docs/tasks/RT-1943-cargo-quarantine/progress.md`; the plan lies next to it.

### Uncommitted

```
 M libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts
 M libs/message-bus-admin/postmortems/util/src/lib/postmortem.columns.ts
 M libs/message-bus-admin/postmortems/util/src/lib/postmortem.mapper.ts
 M libs/message-bus-admin/postmortems/util/src/lib/postmortem.model.ts
 M libs/message-bus-admin/proposals/util/src/lib/proposal.columns.ts
 M libs/message-bus-admin/proposals/util/src/lib/proposal.mapper.ts
 M libs/message-bus-admin/proposals/util/src/lib/proposal.model.ts
 M libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts
 M libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts
```

### Commits over the main branch

```
d63fdfe21 feat(rt:message-bus): переход в карантин требует названной причины
97614638f feat(rt:message-bus): карантин заведён состоянием записи
650a95507 docs(rt:message-bus): поддомен о карантине спорной записи
818092e05 docs(rt:message-bus): папка задачи RT-1943 заведена
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
