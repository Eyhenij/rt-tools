# Ход работы

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 5 из 6 — Замыслы и решение
- **Done:** этапы 1–4 закрыты — проверки спеков читают ключи под двумя именами; все спеки
  `docs/specs/` переведены целиком, кириллица осталась только в цитатах русских подписей экрана,
  имён состояний и данных тестов
- **Next step:** перевести двадцать пять замыслов `docs/plans/` и одно решение `docs/adr/`
- **Uncommitted:** нет
- **Waiting for the owner:** нет
- **PR:** ещё не открыт

## Решения по ходу

- **Ключи разделов спека учатся двум именам до перевода самих спеков.** Иначе первый переведённый
  спек молча выпадет из проверки: заголовка `## Правила` в нём не будет. Затронут этап 1.
- **Образец домена правится в источнике пакета, а не в разложенной копии.** Файл несёт шапку
  раскладки, и правка по месту теряется на следующей раскладке. Затронут этап 1.

## Заходы

### 2026-09-07

- Ветка заведена от главной, папка задачи собрана, замысел написан.
- Этап 1 сделан: `spec-common.mjs`, `spec-anchors.mjs`, `spec-contract.mjs` и `check-specs.mjs`
  читают ключи под двумя именами; набор спеков пакета 52 ok; образец домена переведён и разложен.
- Этап 2 сделан: сто пять файлов `docs/specs/agent-kit/` переведены вместе с компаньонами.
  `npm run check:specs` — код 0; `node tools/check-doc-paths.mjs` — 501 документ, расхождений
  нет; `node tools/check-file-size.mjs` — длиннее предела 0.
- Этап 3 сделан: спеки `docs/specs/message-bus/` переведены целиком — корень и одиннадцать
  поддоменов вместе с компаньонами и сценариями. Спек чтения принятого пришлось ужать:
  перевод вышел на 538 строк при пределе 500, сокращены доводы при утверждениях и записи
  истории. `npm run check:specs` — код 0; `node tools/check-doc-paths.mjs` — 501 документ,
  расхождений нет; `node tools/check-file-size.mjs` — длиннее предела 0.
- Этап 4 сделан: спеки китов, ядра и хранилища переведены — `docs/specs/ui-kit-v2/` с
  десятью поддоменами, `docs/specs/ui-kit/` с двумя, предложения `docs/specs/core/` и
  `docs/specs/store/`. `npm run check:specs` — код 0; `node tools/check-doc-paths.mjs` —
  501 документ, расхождений нет; `node tools/check-file-size.mjs` — длиннее предела 0.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-1858-tree-docs-english

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 из 6 — Спеки приёмника
- **Next step:** перевести тридцать девять файлов `docs/specs/message-bus/` вместе с компаньонами
- **PR:** ещё не открыт

The progress in full — `docs/tasks/RT-1858-tree-docs-english/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/message-bus/admin/spec.md
 M docs/specs/message-bus/cargo-state/implementation.md
 M docs/specs/message-bus/cargo-state/scenarios.md
 M docs/specs/message-bus/cargo-state/spec.md
 M docs/specs/message-bus/cargo-triage/implementation.md
 M docs/specs/message-bus/cargo-triage/scenarios.md
 M docs/specs/message-bus/cargo-triage/spec.md
 M docs/specs/message-bus/intake/implementation.md
 M docs/specs/message-bus/intake/scenarios.md
 M docs/specs/message-bus/intake/spec.md
 M docs/specs/message-bus/publisher-cargo-close/implementation.md
 M docs/specs/message-bus/publisher-cargo-close/scenarios.md
 M docs/specs/message-bus/publisher-cargo-close/spec.md
 M package.json
```

### Commits over the main branch

```
035cd6a75 docs(rt:message-bus): корень домена и шесть поддоменов приёмника по-английски
cfcfaceec docs(rt:agent-kit): спеки ведения работы и выходов хода по-английски
9a50ffaf9 docs(rt:agent-kit): спеки гардов завершения хода по-английски
91d3d010d docs(rt:agent-kit): спеки утверждений и передачи захода по-английски
96ddefba0 docs(rt:agent-kit): спеки текстов слоя и сверки спеков по-английски
28e61b0a0 docs(rt:agent-kit): спеки гейта, описаний и границы состояния по-английски
d56232505 docs(rt:agent-kit): спеки границы, слога, публикации и статьи по-английски
fb9c863c3 docs(rt:agent-kit): спеки наблюдений и груза по-английски
fde708f10 docs(rt:agent-kit): спек раскладки по-английски
db1437354 docs(rt:agent-kit): гарды правки, расхождения слоя и разбор раскладки по-английски
da0ac78e9 docs(rt:agent-kit): диспетчер, место правки и экзамен по-английски
1bea69b9e docs(rt:agent-kit): цена контекста, заявки и гейт пуша по-английски
11b085306 docs(rt:agent-kit): корень домена, гарды браузера, груз и проверки по-английски
ca695c501 feat(rt:agent-kit): образец домена написан по-английски
e30c97cb2 feat(rt:agent-kit): ключи разделов спека читаются под двумя именами
b24a74052 docs(rt:agent-kit): папка задачи RT-1858 заведена
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
