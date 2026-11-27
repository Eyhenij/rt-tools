# План

**Task:** RT-3738 · **Branch:** RT-3738-guard-suite-over-limit
**Путь:** лёгкий · 110 строк · API и вид не меняются
**Behaviour:** unchanged — слово владельца «заводи задачу в этот эпик и правь»: случаи набора переезжают в свой файл, сами случаи и страж не меняются

## Точки

- **A:** после слияния главной ветки файл `projects/agent-kit/tests/flow-step-guard.test.sh` длиннее
  предела: проверка длины считает 520 строк при пределе 500, и набор перед отправкой ветку эпика не
  выпускает.
- **Эта задача доводит до:** случаи ограничителя времени лежат в своём файле набора, оба файла
  короче предела; ветка эпика уходит на сервер, и PR 3689 сливается с главной без конфликта.
- **Признак:** `node tools/check-file-size.mjs` выходит с кодом 0, оба набора зелёные, 24 случая
  «SC-AK-2021 —» стоят в новом файле.
- **Веха G эпика:** правка стража влита в главную ветку — PR эпика в главную ветку влит.

## След задачи

| Что | Где |
| --- | --- |
| Code (правится) | `projects/agent-kit/tests/flow-step-guard.test.sh` |
| Code (правится) | `projects/agent-kit/tests/flow-step-guard-limits.test.sh` |
| Specs (правится) | `docs/specs/agent-kit/turn-guards/flow-script/guard/scenarios.md` |

## Решение

Решения нет: новых символов нет — раздел случаев ограничителя времени целиком, с его помощником `limit_bin`, переезжает из одного файла набора в соседний

## Этапы

### 1. Свой файл набора

- **Steps:**
    1. Перенести случаи ограничителя времени в `flow-step-guard-limits.test.sh` и назвать этот файл в сценарии SC-AK-2021
       Check: `bash -c 'set -o pipefail; t=projects/agent-kit/tests; node tools/check-file-size.mjs >/dev/null 2>&1 || exit 1; bash $t/flow-step-guard.test.sh >/dev/null 2>&1 || exit 1; bash $t/flow-step-guard-limits.test.sh >/dev/null 2>&1 || exit 1; node tools/check-specs.mjs >/dev/null 2>&1 || exit 1; cat $t/flow-step-guard-limits.test.sh | grep -c "SC-AK-2021 —"'` → = 24
