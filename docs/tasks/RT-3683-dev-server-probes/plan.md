# Plan

**Task:** RT-3683 · **Branch:** RT-3683-dev-server-probes
**Behaviour:** unchanged — владелец 26.11: «Задача в эпике (Recommended)»; правка меняет пробы таблицы решений и обвязку набора, а не стража

## Points

- **A:** CI на PR эпика RT-3624 в main красный: три пробы стража `dev-server-guard.sh` не сходятся под нагрузкой.
- **This task reaches:** сверка таблицы решений не зависит от того, как быстро машина подняла сервер пробы
  и дошла до вопроса стража, а сбой обвязки пробы виден словами, а не решением «allow»; CI на PR эпика
  зелёный.
- **Sign:** четыре опыта `variant.mjs` — задержка 11 секунд и старт через 6 секунд дают mismatch 0, сервер
  без файла порта и погашенный сервер дают по четыре строки со словами причины; три сверки разом сходятся;
  набор таблицы зелёный; в прогоне CI на PR 3681 после слияния зелёные SC-AK-1563 и шаг Hook suites.
- **Milestone G of the epic:** не двигает: это починка проверки.
- **Metric:** нет: проба держала сервер 10 секунд и ждала порт 5 секунд, а под нагрузкой страж приходил позже.

## Decision

No decision: новых символов нет; `wait_for_port` получает необязательный второй аргумент, четыре пробы таблицы меняют текст, скрипт опытов лежит в папке задачи.

## Task footprint

| What | Where |
| --- | --- |
| Code (правится) | `projects/agent-kit/assets/checks/decision-table.json` |
| Code (правится) | `projects/agent-kit/tests/lib.sh` |
| Code (правится) | `tools/decision-table.json` — через `pnpm run agent-kit:sync` |
| Code | `projects/agent-kit/assets/hooks/dev-server-guard.sh` |
| Code | `projects/agent-kit/tests/decision-table.test.sh` |
| Code | `docs/tasks/RT-3683-dev-server-probes/variant.mjs` |

## What counts as done

- Опыт с задержкой 11 секунд после запуска сервера в четырёх пробах — mismatch 0.
- Опыт со стартом сервера через 6 секунд — mismatch 0.
- Опыт с сервером без файла порта — четыре строки со словами «the stand server did not start».
- Опыт с сервером, погашенным после порта, — четыре строки со словами «the stand server died».
- `decision-table.test.sh` зелёный, разложенная таблица сходится с пакетом.
- Три сверки таблицы, запущенные разом, сходятся все.
- В прогоне CI на PR эпика зелёные SC-AK-1563 и шаг Hook suites, номер прогона — в описании PR эпика;
  красный SC-AK-1563 после починки — разбор по словам проб.

## Stages

### 1. Сервер пробы живёт всю пробу

- **Steps:**
    1. Сервер пробы переживает задержку
       Check: `set -o pipefail; node docs/tasks/RT-3683-dev-server-probes/variant.mjs life | grep -c '^rows .*, mismatch 0$'` → `1`
    2. Медленный старт сервера не меняет решения
       Check: `set -o pipefail; node docs/tasks/RT-3683-dev-server-probes/variant.mjs start | grep -c '^rows .*, mismatch 0$'` → `1`
    3. Сервер без порта валит пробу словами
       Check: `set -o pipefail; node docs/tasks/RT-3683-dev-server-probes/variant.mjs dead | grep -c 'the stand server did not start'` → `4`
    4. Умерший сервер назван словами
       Check: `set -o pipefail; node docs/tasks/RT-3683-dev-server-probes/variant.mjs gone | grep -c 'the stand server died'` → `4`
    5. Три сверки разом сходятся
       Check: `set -o pipefail; ! grep -q '10000)' projects/agent-kit/assets/checks/decision-table.json && { D=$(mktemp -d); for i in 1 2 3; do node projects/agent-kit/assets/checks/decision-table.mjs --conform > "$D/c$i" 2>&1 & done; wait; cat "$D"/c[123] | grep -c '^rows .*, mismatch 0$'; }` → `3`
    6. Набор таблицы решений зелёный
       Check: `[ "$(grep -o '120000)' projects/agent-kit/assets/checks/decision-table.json | wc -l | tr -d ' ')" = 4 ] && bash projects/agent-kit/tests/decision-table.test.sh > /dev/null` → exit 0
    7. Разложенная таблица сходится с пакетом
       Check: `set -o pipefail; ! grep -q '10000)' tools/decision-table.json && pnpm -s run agent-kit:check 2>&1 | tail -1` → `sync --check: разложенное сходится с пакетом v0.40.0`
- **Readiness sign:** четыре опыта, три сверки разом и набор зелёные; время опыта `life` — в ходе работы.
- **Verified by:** `bash projects/agent-kit/tests/decision-table.test.sh` — без провалов.

## What this work does not do

- Не меняет стража `dev-server-guard.sh` и не ставит предел времени на `lsof`.
- Не чинит main отдельно: дефект уходит из main с вливанием эпика, по выбору владельца.
- Не меняет `--mutate`: при умершем сервере проба там по-прежнему засчитывает «allow», слова ловушки идут
  только в текст.
- Не отвечает за шаги CI после Hook suites: на коде эпика они ещё не шли, их зелень — признак эпика.
