# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — Проход по файлам дерева
- **Done:** проход в `tools/check-ngdoctor.mjs`, десять сценариев прохода и два сценария неверных
  флагов; живая проверка на дереве; 1.1 → 10, 1.2 → 0
- **Next step:** второй круг ревью
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Сценарии проверки Angular Doctor ловят каждую потерю файла дерева по её причине, в обеих локалях
- [x] 1.2 Проверка Angular Doctor на дереве зелёная и печатает строку прохода; порог и настройка те же; наборы проверок дерева зелёные

## Decisions along the way

- Находка без файла или на каталоге не считается «вне списка». На живом дереве oxlint инструмента
  отдаёт непрочитанный файл находкой `oxlint/unknown` с пустым полем файла, и пустой путь
  превращался в корень дерева. Сценарий непрочитанного файла теперь несёт такую находку и требует,
  чтобы строки «вне списка» не было: без правки он красный, с правкой зелёный.
- Первый круг ревью. Подтверждены и исправлены:
    - файл проверки вырос до 579 строк при пределе 500 — проход вынесен в
      `tools/check-ngdoctor-pass.mjs`;
    - находка правила на `package.json` или на стиле давала ложный красный «вне списка» — «вне
      списка» судится только по `.ts` и `.html`;
    - без `.ts` проход звал oxlint без файлов, и тот проходил весь каталог; поиск упавшего файла на
      пустом списке не останавливался — oxlint без файлов не зовётся, поиск кончается на одном
      файле;
    - другая версия инструмента давала стек вместо отказа — отказ о версии возвращается сразу,
      флаг `--pass-version` для сценария;
    - отказ о длине списка говорит и «или дерево изменилось во время прогона»;
    - подпись сценария о длине списка указывала не в ту сторону.

  Пять новых сценариев — пары отказов: проход зелёный на находках своих файлов, на находке в
  `package.json`, на шаблоне с ненужным `eslint-disable`, без `.ts`; другая версия — красный с
  просьбой обновить проход. Их подписи начинаются с «a pass», отдельно от десяти потерь, которые
  считает план. Каждая из четырёх обратных правок кода даёт ровно один красный сценарий. knip
  принимал вызовы модулей инструмента за зависимости дерева: переменная названа `fromTool`.
- Находка QA о поле `angularDoctor` в `package.json`, которое инструмент тоже читает, а проверка
  полей настройки RT-3514 не видит, лежит вне диффа этой ветки и вне условий плана — отдельная
  задача.

## Sessions

### 23.11.2026

- План переписан по ревью стратега и критика цели: модули — от пакета инструмента (из корня
  дерева резолвятся другие версии парсера и eslint, oxlint и `fast-glob` не резолвятся вовсе);
  настройка oxlint — та, что записал инструмент в свой временный каталог; ошибка разбора — только
  `fatal: true`; `number_of_files` oxlint; упавший oxlint называет файл; `--write` при красном
  проходе отказывает; сценарии судят по строке причины.
- Замер до работы: `check:ngdoctor` — 5.4–5.6 с; прототип прохода стратега — 0.87 с.
- plan-red на коммите плана `188d9528f`: 1.1 → 0, 1.2 → 1.
- Живая проверка на дереве с настоящим инструментом, без `--input`: шаблон `<p>use {x}</p>` в
  `libs/` назван строкой «the template linter cannot parse», файл с правами 000 назван строкой
  «the pass cannot read», код выхода 1. Чистое дерево: «2689 files, 596 templates, oxlint 2288
  files», счёт 87.25 равен порогу.
- Замер `pnpm run -s check:ngdoctor`: 6.1 с против 5.4–5.6 с до работы.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3518-ngdoctor-oxlint-tree-run

### Where we stand at the minute of the compaction

- **State:** `замысел-записан`
- **Stage:** 1 of 1 — Проход по файлам дерева
- **Next step:** проход в `tools/check-ngdoctor.mjs` и десять сценариев
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3518-ngdoctor-oxlint-tree-run/progress.md`; the plan lies next to it.

### Uncommitted

```
 M CLAUDE.md
 M docs/tasks/RT-3518-ngdoctor-oxlint-tree-run/progress.md
 M tools/check-ngdoctor.mjs
 M tools/tests/check-ngdoctor.test.sh
```

### Commits over the main branch

```
c03071132 docs(rt:ui-kit-v2): прогресс RT-3518 — план одобрен, этап начат (RT-3518)
6935b99db docs(rt:ui-kit-v2): находки ревью правил по RT-3514 рядом с планом эпика (RT-3518)
188d9528f docs(rt:ui-kit-v2): план RT-3518 — проход Angular Doctor по файлам дерева (RT-3518)
537cecc11 docs(rt:ui-kit-v2): разбор RT-3518 — проверка Angular Doctor видит потерянный файл дерева (RT-3518)
0b41d644d test(rt:ui-kit-v2): сценарии образца не зависят от локали (RT-3514)
bd497a1e1 docs(rt:ui-kit-v2): папка задачи RT-3514 разобрана в архивную запись (RT-3514)
7a8cf54a6 Merge remote-tracking branch 'origin/RT-3476-angular-doctor' into RT-3514-ngdoctor-source-liveness
99332b1d1 [RT-3481] Находки oxlint в utils, core и ките: isNil, приведения, схема графиков через anyOf (#3515)
8965eaa4c chore(rt:ui-kit-v2): правки после второго круга ревью (RT-3514)
2ac93b422 chore(rt:ui-kit-v2): правки после первого круга ревью (RT-3514)
f46c5a30e chore(rt:ui-kit-v2): проверка Angular Doctor краснеет на источнике, молчащем на образце (RT-3514)
872d8a9ec docs(rt:ui-kit-v2): прогресс RT-3514 — план одобрен, этап начат (RT-3514)
8b6ff3303 docs(rt:ui-kit-v2): задача RT-3518 в эпике, находки ревью правил по RT-3481 (RT-3514)
3bec7ebe1 docs(rt:ui-kit-v2): план RT-3514 — образец живости источников Angular Doctor (RT-3514)
412e10769 docs(rt:ui-kit-v2): разбор RT-3514 — проверка Angular Doctor видит молчащий источник (RT-3514)
84b0b315c Merge remote-tracking branch 'origin/RT-3476-angular-doctor' into RT-3481-ngdoctor-oxlint
bc45a00b9 docs(rt:ui-kit-v2): папка задачи RT-3481 снова разобрана (RT-3481)
084a2dfa5 docs(rt:ui-kit-v2): папка RT-3481 поднята с согласиями одобренного плана (RT-3481)
c02429713 docs(rt:ui-kit-v2): папка задачи RT-3481 разобрана в архивную запись (RT-3481)
bcae55b7d [RT-3480] Привязки к хосту, сигнальные запросы и inject() в ките и core (#3513)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
