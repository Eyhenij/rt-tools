# Plan

**Task:** RT-3676 · **Branch:** RT-3676-merge-size-limits
**Behaviour:** unchanged — владелец 26.11: «работай дальше»; правка делит набор сценариев и сжимает строки правила, кода приложений не трогает

## Points

- **A:** после слияния main ветка эпика RT-3624 не отправляется: два файла длиннее предела.
- **This task reaches:** ветка задачи со слиянием main проходит набор перед отправкой, и после её PR
  ветка эпика проходит `check-file-size`.
- **Sign:** `node tools/check-file-size.mjs` выходит с кодом 0; сценарии движка зелёные в прежнем числе
  и новый набор зелёный отдельно; набор перед отправкой ветки задачи зелёный — его видно по отправке.
- **Milestone G of the epic:** не двигает: это починка слияния.
- **Metric:** нет: слияние двух сторон переросло предел длины.

## Decision

No decision: новых символов нет. Блоки перемера переносятся в новый файл без изменений случаев; файл
получает заголовок отдельного запуска по образцу `task-flow-script-steps.test.sh` — `lib.sh`, `TESTS`,
`TF_DIR`, `TF_ALONE`, свою строку `TF_G` — и хвост с `suite_result`. Правило теряет разбитые строки.

## Task footprint

| What | Where |
| --- | --- |
| Code (правится) | `projects/agent-kit/tests/task-flow-script-steps.test.sh` |
| Code (правится) | `projects/agent-kit/tests/task-flow-script-recheck.test.sh` |
| Code (правится) | `projects/agent-kit/tests/task-flow-script.test.sh` |
| Specs (правится) | `docs/specs/agent-kit/turn-guards/flow-script/step-mark/scenarios.md` |
| Rules (правится) | `.claude/skills/task-delivery-loop-run/SKILL.md` |
| Code | `tools/tests/merge-block.test.sh` |

## Delivery

Ветка задачи отведена от локальной вершины эпика `85a168b21` — слияния main, которого нет на хостинге.
PR задачи в ветку эпика несёт это слияние вместе с починкой: так правило `git-workflow` велит чинить
слияние. Круг ревью читает коммиты после `85a168b21` и сведение конфликтов `git show --cc 85a168b21`.
Набор перед отправкой идёт по всему, что пришло из main: сквозные наборы, снимки и образы.

## What counts as done

- `node tools/check-file-size.mjs` выходит с кодом 0.
- `task-flow-script.test.sh` даёт 362 ok и 0 провалов, как до правки; новый набор зелёный отдельно.
- Строка «Covered:» SC-AK-1739 называет новый файл, SC-AK-1794 — оба файла.
- Набор перед отправкой против `origin/RT-3624-delivery-speed` зелёный: его держит защита отправки.

## Stages

### 1. Пределы длины

- **Steps:**
    1. Разделить набор шагов плана
       Check: `grep -c '^report' projects/agent-kit/tests/task-flow-script-recheck.test.sh` → = 6
    2. Запустить новый набор отдельно
       Check: `set -o pipefail; bash projects/agent-kit/tests/task-flow-script-recheck.test.sh | tail -1` → `сценарий task flow: перемер по истории папки: 6 ok, 0 провалов`
    3. Назвать новый файл в покрытии SC-AK-1739
       Check: `set -o pipefail; grep -A8 '^### SC-AK-1739' docs/specs/agent-kit/turn-guards/flow-script/step-mark/scenarios.md | grep -c 'Covered:.*recheck.test.sh'` → = 1
    4. Назвать оба файла в покрытии SC-AK-1794
       Check: `set -o pipefail; grep -A12 '^### SC-AK-1794' docs/specs/agent-kit/turn-guards/flow-script/step-mark/scenarios.md | grep -c 'Covered:.*steps.test.sh.*recheck.test.sh'` → = 1
    5. Сжать разбитые строки правила цикла
       Check: `awk 'END{print NR}' .claude/skills/task-delivery-loop-run/SKILL.md` → <= 329
    6. Прогнать сценарии блока слияния правила
       Check: `test "$(awk 'END{print NR}' .claude/skills/task-delivery-loop-run/SKILL.md)" -le 329 && bash tools/tests/merge-block.test.sh` → exit 0
    7. Сверить число сценариев движка
       Check: `set -o pipefail; test -s projects/agent-kit/tests/task-flow-script-recheck.test.sh && bash projects/agent-kit/tests/task-flow-script.test.sh | tail -1` → `сценарий task flow: 362 ok, 0 провалов`
    8. Проверить пределы целиком
       Check: `node tools/check-file-size.mjs` → exit 0
- **Readiness sign:** проверка длины не находит расхождений, сценарии прежние.
- **Verified by:** `node tools/check-file-size.mjs` — код 0.

## What this work does not do

- Не правит находки ревью правил: они ждут слова владельца в `docs/plans/delivery-speed-findings.md`.
- Не открывает PR эпика в main: это следующий шаг эпика после слияния задачи.
