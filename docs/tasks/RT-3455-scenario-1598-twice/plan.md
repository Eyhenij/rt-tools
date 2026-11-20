# Plan

**Task:** RT-3455 · **Branch:** RT-3455-scenario-1598-twice
**Behaviour:** unchanged — код приложений не меняется, меняется только номер сценария в описании пакета и в заголовках его тестов. Слово владельца: «доведи все задачи эпика до завершения».

## Points

- **A:** номер SC-AK-1598 выдан дважды: в main сценарию запуска тестов либы, в ветке эпика RT-3302
  сценарию хуков. Слияние main в эпик даёт отказ `node tools/check-specs.mjs`, и следующая задача
  эпика не берётся.
- **This task reaches:** у сценария запуска тестов либы свой номер SC-AK-1795, и main вливается в
  эпик без отказа проверки описаний.
- **Sign:** в этой ветке `node tools/check-specs.mjs` кончается кодом 0, тесты проверки либ дают
  36 ok. После слияния main в эпик та же проверка не называет SC-AK-1598.
- **Milestone G of the epic:** задача вне эпика; она открывает путь к следующей задаче эпика
  RT-3302, где веха — меньше пяти отказов на сто команд и ни одного тупика.
- **Metric:** нет: номер сценария выдан дважды, слияние main в эпик стоит.

## Task footprint

| What  | Where                                                |
| ----- | ---------------------------------------------------- |
| Specs | `docs/specs/agent-kit/layout/`                       |
| Rules | `.claude/skills/spec-driven/` — читается, не правится |
| Code  | `projects/agent-kit/tests/checks-lib-layers.test.sh` |

## What counts as done

- В описании раскладки и в его companion сценарий запуска тестов либы зовётся SC-AK-1795.
- В `checks-lib-layers.test.sh` не осталось ни одного SC-AK-1598, тесты зелёные.
- `node tools/check-specs.mjs` кончается кодом 0.

## Stages

### 1. Новый номер сценария

- **Steps:**
    1. Номер в описании раскладки и в companion заменён на SC-AK-1795
       Check: `grep -c 'SC-AK-1795' docs/specs/agent-kit/layout/scenarios.md docs/specs/agent-kit/layout/implementation.md | grep -c ':1$'` → = 2
    2. Заголовки тестов проверки либ несут SC-AK-1795
       Check: `grep -c 'SC-AK-1795' projects/agent-kit/tests/checks-lib-layers.test.sh | cat` → = 16
    3. Тесты проверки либ зелёные
       Check: `bash projects/agent-kit/tests/checks-lib-layers.test.sh 2>&1 | tail -1` → /36 ok, 0 провалов$/
    4. Проверка описаний проходит
       Check: `node tools/check-specs.mjs` → exit 0
    5. Пробное слияние с веткой эпика не даёт двойных номеров сценариев
       Check: `git grep -hoE '^### SC-[A-Z]+-[0-9]+' $(git merge-tree --write-tree origin/RT-3302-checks-rework-3 HEAD | head -1) -- docs/specs | sort | uniq -d | wc -l | tr -d ' '` → = 0
- **Readiness sign:** пробное слияние ветки задачи с веткой эпика не находит ни одного двойного
  номера; до работы находит один. Шаги 3 и 4 зелёные и до работы, они ловят только поломку.
- **Verified by:** шаг 5 — `0` вместо `1`.

## What this work does not do

- Не правит запись `docs/archive/RT-3450-lib-test-runner-forms.md`: она описывает прошлое.
- Не вливает main в ветку эпика. Это следующий шаг эпика RT-3302, его делает исполнитель эпика после
  слияния этой задачи. В слиянии около 127 конфликтов: разложенные файлы пакета берутся со стороны
  эпика и раскладываются заново, файлы `tools/*.mjs` и `docs/GLOSSARY.md` сводятся тем же приёмом.
- Не меняет выдачу номеров `tools/spec-next-id.mjs`. Почему номер был выдан дважды, отдельная
  находка: она пойдёт в разбор правил после PR.
