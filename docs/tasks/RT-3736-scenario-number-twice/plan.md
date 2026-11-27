# План

**Task:** RT-3736 · **Branch:** RT-3736-scenario-number-twice
**Путь:** лёгкий · 27 строк · API и вид не меняются
**Behaviour:** unchanged — слово владельца «поправь конфликты»: меняется только номер сценария в названиях случаев и в текстах спеки

## Точки

- **A:** после слияния главной ветки номер SC-AK-2004 стоит у двух сценариев: у стража без
  `timeout` в ветке эпика и у счёта слов владельца в главной. Проверка спек называет расхождение, и
  набор перед отправкой ветку эпика не выпустит.
- **Эта задача доводит до:** сценарий стража без `timeout` носит свободный номер SC-AK-2021 в
  спеке стража и в названиях случаев набора; PR 3689 сливается с главной без конфликта.
- **Признак:** `node tools/check-specs.mjs` выходит с кодом 0, набор
  `projects/agent-kit/tests/flow-step-guard.test.sh` зелёный, номер SC-AK-2021 стоит в 27 строках
  четырёх файлов.
- **Веха G эпика:** правка стража влита в главную ветку — PR эпика в главную ветку влит.

## След задачи

| Что | Где |
| --- | --- |
| Specs (правится) | `docs/specs/agent-kit/turn-guards/flow-script/guard/scenarios.md` |
| Specs (правится) | `docs/specs/agent-kit/turn-guards/flow-script/guard/implementation.md` |
| Specs (правится) | `docs/specs/agent-kit/turn-guards/flow-script/guard/spec.md` |
| Code (правится) | `projects/agent-kit/tests/flow-step-guard.test.sh` |

## Решение

Решения нет: правка не добавляет ни файла, ни набора, ни символа — в 27 строках меняется номер сценария

## Этапы

### 1. Номер сценария

- **Steps:**
    1. Заменить номер SC-AK-2004 на SC-AK-2021 в спеке стража и в названиях случаев набора стража
       Check: `bash -c 'set -o pipefail; g=docs/specs/agent-kit/turn-guards/flow-script/guard; t=projects/agent-kit/tests/flow-step-guard.test.sh; node tools/check-specs.mjs >/dev/null 2>&1 || exit 1; bash $t >/dev/null 2>&1 || exit 1; cat $g/scenarios.md $g/implementation.md $g/spec.md $t | grep -c "SC-AK-2021"'` → = 27
