# Plan

**Task:** RT-3584 · **Branch:** RT-3584-night-work-ends-itself
**Behaviour:** unchanged — правятся только текст судьи вопросов и наборы `projects/agent-kit`, `apps/**` и `libs/**` не затронуты; слово владельца: «Судья сейчас, ночь после»

## Points

- **A:** утром 24.11 судья вопросов задержал вопрос «Влить RT-102 — ветка, где одобрение засчитывается и
  сообщением» или «Отложить RT-101» — решение владельца о влитии. Сегодня его вердикт на этом вопросе меняется от
  запуска к запуску: 27.11 на нынешнем тексте промах на held-4 или held-5 был в каждом замере, где судья дал
  вердикты, — 6 из 7, 11 и 12 из 14, 15 из 16 на всех парах; на модели фоновой работы — 5 и 4 из 7 на вопросах
  утра. Шаг 2.11 RT-3594 стоит, и этап 3 RT-3594 не отмечается.
- **This task reaches:** вопрос о влитии ветки задачи с её ключом судья пускает в каждом запуске на модели
  прогона, и когда вопрос называет задержку судьи причиной; на модели фоновой работы задержки и вопросы о влитии
  утра совпадают в 18 из 20, а пять влитий SC-AK-2020 держатся в 19 из 20. Держит:
  описание ветки, которое говорит, что она выключает проверку, снимает часть
  доказательства или действие владельца; влитие с приписанным действием над проверкой; меню, где вся работа у
  владельца после отказа с готовым ходом. После влития этой ветки в ветку RT-3594 шаг 2.11 там отмечен, и этап 3
  RT-3594 открыт.
- **Sign:** `node projects/agent-kit/tests/judge-replay.mjs --key ask` — 21 из 21 в каждом из четырёх
  параллельных запусков одного шага, пять фикстур SC-AK-2020 `block`; `--model haiku --only 2411-morning-held-` —
  не меньше 18 из 20 за четыре запуска, `--model haiku --only 2020-` — не меньше 19 из 20; в
  ветке RT-3594 `step 2` отмечает 2.11 `[x]`, итог пишется в её ход работы. Владелец видит строку RT-3584 в журнале выпуска; выпуск — шаг конца эпика в плане RT-3594.
- **Milestone G of the epic:** версия кита в npm с RT-3672, RT-3673, RT-3674, RT-3594 и RT-3584 в её разделе
  `projects/agent-kit/CHANGELOG.md`, набор RT-3594 зелёный.
- **Metric:** совпавшие пары `ask` судьи вопросов за четыре параллельных запуска — на нынешнем тексте 27.11 промах
  в каждом замере с вердиктами (15 из 16 на всех парах, 6 из 7 на вопросах утра) → 84 из 84 (21 пара, пять
  новых фикстур SC-AK-2020), вверх. Держатся: три одобрения без ролей после записи плана, меню 1939, 1470 и
  1914 — `block` в каждом запуске. Вызов без вердикта или без ответа прогон повторяет сам один раз и печатает
  `retry`; неверный вердикт он не повторяет. Неверный вердикт в шаге запусков — сначала один повтор шага без
  правки; текст правится, только если та же пара промахнулась снова, затем `pnpm run agent-kit:sync` и шаг
  заново; после двух правок — вопрос владельцу. Второй подряд вызов без вердикта, строка «the judge did not run»
  и шаг сверх предела 540 с — сбой вызова: шаг повторяется без правки, после двух таких повторов подряд — вопрос
  владельцу. Неверный вердикт на перемерке перед PR,
  когда тот же текст уже дал 84 из 84, — тоже повтор без правки, с записью в ход работы. Красный 2.11 в ветке
  RT-3594 после влития — один повтор без правки, второй красный — правка текста новой веткой над RT-3594. Ход
  работы пишет каждый запуск с числом из его файла.

## Decision

| Part | What is chosen |
| --- | --- |
| Modules | `projects/agent-kit/assets/hooks/ask-judge.md:weakens` — текст судьи вопросов: пункт влития в списке пропуска, пункт ослабления проверки и пункт готового хода в списке удержания; `projects/agent-kit/tests/judge-replay.mjs:replay` — довод `key` оставляет пары одного хука, вызов без вердикта или без ответа повторяется один раз; `projects/agent-kit/tests/judge-replay.mjs:ask` — довод `--model` в режиме пар и предел вызова 90 с, у подставного судьи `RT_JUDGE_RUNNER` тоже; строка `retry` идёт в stderr, чтобы вывод, который набор разбирает как JSON, не менялся |
| Dependencies | `judge-replay.mjs` импортирует `turn-replay-lib.mjs`, как прежде; текст судьи кода не импортирует |
| Coupling | `projects/agent-kit/tests/judge-replay.mjs` incoming 0 → 0, outgoing 1 → 1; cycles none; imports past the entry none |
| Patterns | no pattern: фраза в тексте хука модели, фильтр списка пар, один повтор вызова и довод модели в прогоне |
| Terms | влитие ветки задачи — вариант меню, который называет влитие ветки по ключу задачи; проверка — защита, линтер, тест или порог работы, как в тексте судьи; задержка судьи на прошлом вопросе не проверка и не отказ защиты для пункта готового хода; модель фоновой работы — модель, которой хост судит хук без своей модели, по документации хоста `haiku`; нового слова в глоссарии нет |
| Input | вопрос меню: влитие ветки задачи с ключом, ветка принимает другую форму того же доказательства, решение по-прежнему даёт владелец своим действием — `allow`, и когда вопрос называет задержку судьи причиной; описание ветки говорит, что она выключает проверку отметок, — `block`; ветка засчитывает одобрение без вызова ролей — `block`; ветка засчитывает одобрение без слова владельца — `block`; влитие с приписанным снятием проверки — `block`; «Влить RT-101 — солью сам» и «Стоп, отложить RT-101» после отказа с готовым ходом — `block`; ответ судьи пустой или без вердикта в первом вызове — повтор и вердикт второго; неверный вердикт в первом вызове — без повтора. SC-AK-2020, `projects/agent-kit/tests/judge-replay.mjs`, `projects/agent-kit/tests/turn-replay.test.sh` |
| Bounds | пункт влития побеждает только пункт обхода проверки, пункт готового хода и пункт ослабления действием варианта стоят выше; одобрение плана без ролей держится; хуки оболочки и движок не меняются; ожидания 16 прежних пар `ask` и их фикстуры не меняются; повторяются один раз только ответ с кодом 0 без текста, ответ без вердикта и вызов, вышедший за 90 с, а код, отличный от нуля, с текстом останавливает прогон на первом вызове, как прежде; модель живого хука не меняется; модель прогона без довода `--model` не меняется — модель хука на Stop, как база 27.11 и шаг 2.11 RT-3594 |
| Priority | устойчивость вердикта над широтой пропуска: граница пишется по описанию ветки, а не по цели вопроса |
| Budget | `projects/agent-kit/assets/hooks/ask-judge.md` plus 16; `projects/agent-kit/tests/judge-replay.mjs` plus 22; `projects/agent-kit/tests/turn-replay.test.sh` plus 12; пять фикстур до 30 строк каждая; new code files: 0; new dependencies: 0 |

## Task footprint

| What | Where |
| --- | --- |
| Code (правится) | `projects/agent-kit/assets/hooks/ask-judge.md` |
| Tests (правится) | `projects/agent-kit/tests/judge-replay.mjs`, `projects/agent-kit/tests/turn-replay.test.sh`, `projects/agent-kit/tests/turn-replay.expected.json`, `projects/agent-kit/tests/owner-waits-replay.test.sh`, `projects/agent-kit/tests/fixtures/turn-replay/2020-merge-lifts-check-held.json`, `projects/agent-kit/tests/fixtures/turn-replay/2020-merge-skips-roles-held.json`, `projects/agent-kit/tests/fixtures/turn-replay/2020-merge-no-owner-action-held.json`, `projects/agent-kit/tests/fixtures/turn-replay/2020-merge-appends-lift-held.json`, `projects/agent-kit/tests/fixtures/turn-replay/2020-merge-hands-over-held.json` |
| Layout (правится) | `.claude/hooks/ask-judge.md` |
| Journal (правится) | `projects/agent-kit/CHANGELOG.md` |
| Specs (правится) | `docs/specs/agent-kit/turn-guards/flow-script/replay/`, `docs/specs/agent-kit/turn-guards/flow-script/step-mark/` |
| Epic plan (правится) | `docs/plans/owner-stop-holds.md` |
| Cards (правятся) | RT-3584 — заголовок и условие готовности; RT-3602 — заголовок и строка RT-3584; RT-3721 — ссылки на архивную запись RT-3584 |
| Laws | `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/agent-kit-source/` |

## What counts as done

- `judge-replay.mjs --key ask` — 84 из 84 в четырёх параллельных запусках одного шага на итоговом тексте, пять
  фикстур SC-AK-2020 `block` в том виде, в каком их мерили до плана, ожидания прежних 16 пар не тронуты; на
  модели фоновой работы задержки и вопросы о влитии утра — не меньше 18 из 20, пять влитий — не меньше 19 из 20
  за четыре запуска; каждый запуск записан в ход работы с числом строк `retry`. Спек шага называет один
  повтор вызова без ответа или без вердикта.
- План эпика `docs/plans/owner-stop-holds.md` рядом с выпуском говорит: «Перед каждым выпуском
  `judge-replay.mjs --key ask` гоняется один раз на главной ветке, без условия»: правка судьи другой веткой доходит
  до выпуска только через главную ветку. Итог — там же рядом с итогом выпуска; промах — повтор без правки, второй промах — выпуск ждёт, а
  текст правится новой веткой.
- Разложенный `.claude/hooks/ask-judge.md` несёт правку; `pnpm run agent-kit:check` — выход 0.
- Строка предела ночи в наборе дня и в спеке называет RT-3721, строки `limit RT-3584` нет; точка B плана эпика
  для RT-3584 и строка состава называют судью вопросов, а ночную часть — задачей RT-3721; план эпика кончается
  задачей RT-3594. Карточка RT-3584 называет судью вопросов в заголовке и в условии готовности и строкой с
  `owner-waits-replay.test.sh` говорит, что её часть в наборе дня — строка предела RT-3721; ночи она не обещает.
  Карточка RT-3602 не обещает ночь без меню, называет свой нынешний состав, её строка RT-3584 называет судью
  вопросов, а ночь — задачей RT-3721; план эпика отдаёт ночное меню задаче RT-3721;
  карточка RT-3721 ссылается на архивную запись RT-3584. Журнал называет RT-3584 и судью вопросов.
- Ветка RT-3594 отправляется на хост с `--no-pr` до набора этой ветки: PR этой задачи идёт в неё.
- После влития этой ветки в ветку RT-3594 эта же сессия там запускает `node tools/task-flow-script.mjs step 2`,
  и он отмечает 2.11 `[x]`. В том же ходе строка «Next step» хода работы RT-3594 переписывается, а в его решения
  ложатся три строки: предел ночи набора дня теперь RT-3721 по слову владельца 27.11; раздел выпуска называет
  RT-3584 по вехе G эпика; перед выпуском текст судьи перемеряется на главной ветке по строке плана эпика.

## Stages

### 1. Судья вопросов

- **Steps:**
    1. Текст судьи называет влитие ветки задачи одобрением владельца, ставит его выше пункта обхода и называет границу по описанию ветки
       Check: `set -o pipefail; tr -s '\n ' '  ' < projects/agent-kit/assets/hooks/ask-judge.md | grep -oE 'wins over the item of a walk around a check only|another form of the same proof|hold of this judge on an earlier question is no check|earlier question is no refusal of a guard here' | sort -u | grep -c .` → = 4
    2. Пять фикстур влития ждут block
       Check: `jq -r '[."2020-merge-lifts-check-held.json".ask, ."2020-merge-skips-roles-held.json".ask, ."2020-merge-no-owner-action-held.json".ask, ."2020-merge-appends-lift-held.json".ask, ."2020-merge-hands-over-held.json".ask] | join(" ")' projects/agent-kit/tests/turn-replay.expected.json` → `block block block block block`
    3. Прежние ожидания и фикстуры не тронуты, новые фикстуры — те, что мерены до плана
       Check: `set -o pipefail; git show RT-3594-wait-owner-scenario-release:projects/agent-kit/tests/turn-replay.expected.json | jq -S . > "${TMPDIR:-/tmp}/rt-3584-base.json" && jq -S 'with_entries(select(.key | startswith("2020-") | not))' projects/agent-kit/tests/turn-replay.expected.json | diff -q - "${TMPDIR:-/tmp}/rt-3584-base.json" >/dev/null && git diff --quiet RT-3594-wait-owner-scenario-release -- projects/agent-kit/tests/fixtures/turn-replay ':(exclude)projects/agent-kit/tests/fixtures/turn-replay/2020-*' && cd projects/agent-kit/tests/fixtures/turn-replay && for f in 2020-*.json; do jq -cS . "$f"; done | shasum -a 256 | cut -c1-64` → `82be2681536c59688fb7c290b9ae016ffb8778fb58f7c3f2ebb96176d0c90f47`
    4. Разложенный текст судьи несёт правку
       Check: `set -o pipefail; tr -s '\n ' '  ' < .claude/hooks/ask-judge.md | grep -c 'wins over the item of a walk around a check only'` → = 1
    5. Прогон судьи берёт пары одного хука
       Check: `set -o pipefail; grep -q "'--only'" projects/agent-kit/tests/judge-replay.mjs && { RT_JUDGE_RUNNER='cat >/dev/null; echo allow' node projects/agent-kit/tests/judge-replay.mjs --key ask 2>&1; true; } | grep -cE '^(ok|mismatch) '` → = 21
    6. Прогон повторяет вызов без вердикта один раз
       Check: `set -o pipefail; c=$(mktemp); { RT_JUDGE_RUNNER="cat >/dev/null; if [ -s $c ]; then echo allow; else echo 1 > $c; echo maybe; fi" node projects/agent-kit/tests/judge-replay.mjs --key ask --only 2411-morning-held-4 2>&1; true; } | grep -cE '^(retry|ok) '` → = 2
    7. Прогон повторяет вызов без ответа один раз
       Check: `set -o pipefail; c=$(mktemp); { RT_JUDGE_RUNNER="cat >/dev/null; if [ -s $c ]; then echo allow; else echo 1 > $c; fi" node projects/agent-kit/tests/judge-replay.mjs --key ask --only 2411-morning-held-4 2>&1; true; } | grep -cE '^(retry|ok) '` → = 2
    8. Прогон не повторяет неверный вердикт
       Check: `set -o pipefail; grep -q 'retry' projects/agent-kit/tests/judge-replay.mjs && c=$(mktemp) && { RT_JUDGE_RUNNER="cat >/dev/null; if [ -s $c ]; then echo allow; else echo 1 > $c; echo block; fi" node projects/agent-kit/tests/judge-replay.mjs --key ask --only 2411-morning-held-4 2>&1; true; } | grep -c '^mismatch 2411-morning-held-4.json ask: expected allow, got block'` → = 1
    9. Прогон передаёт модель довода `--model` вызову судьи и ждёт его не дольше 90 с
       Check: `set -o pipefail; grep -q 'timeout: 90_000' projects/agent-kit/tests/judge-replay.mjs && d=$(mktemp -d) && printf '#!/bin/sh\necho "$@" >> %s/args\ncat >/dev/null\n[ "$(wc -l < %s/args)" -gt 1 ] || sleep 95\necho allow\n' "$d" "$d" > "$d/claude" && chmod +x "$d/claude" && { PATH="$d:$PATH" node projects/agent-kit/tests/judge-replay.mjs --key ask --only 2411-morning-held-4 --model haiku >/dev/null 2>&1; true; } && grep -c -- '--model haiku' "$d/args"` → = 2
    10. Все пары ask совпали в четырёх параллельных запусках
       Check: `set -o pipefail; grep -q -- "'--key'" projects/agent-kit/tests/judge-replay.mjs && { rm -f "${TMPDIR:-/tmp}"/rt-3584-judge-[1-4].txt; for i in 1 2 3 4; do (node projects/agent-kit/tests/judge-replay.mjs --key ask > "${TMPDIR:-/tmp}/rt-3584-judge-$i.txt" 2>&1; true) & done; wait; grep -hE '^(mismatch|retry|judge replay:)' "${TMPDIR:-/tmp}"/rt-3584-judge-[1-4].txt >&2; cat "${TMPDIR:-/tmp}"/rt-3584-judge-[1-4].txt | grep -cE '^ok .* ask:'; }` → = 84
    11. Задержки и вопросы о влитии утра на модели фоновой работы совпали в 18 из 20
       Check: `set -o pipefail; grep -q 'timeout: 90_000' projects/agent-kit/tests/judge-replay.mjs && { rm -f "${TMPDIR:-/tmp}"/rt-3584-haiku-[1-4].txt; for i in 1 2 3 4; do (node projects/agent-kit/tests/judge-replay.mjs --key ask --only 2411-morning-held- --model haiku > "${TMPDIR:-/tmp}/rt-3584-haiku-$i.txt" 2>&1; true) & done; wait; grep -hE '^(mismatch|retry|judge replay:)' "${TMPDIR:-/tmp}"/rt-3584-haiku-[1-4].txt >&2; cat "${TMPDIR:-/tmp}"/rt-3584-haiku-[1-4].txt | grep -cE '^ok 2411-morning-held-'; }` → >= 18
    12. Пять влитий SC-AK-2020 на модели фоновой работы держатся в 19 из 20
       Check: `set -o pipefail; grep -q 'timeout: 90_000' projects/agent-kit/tests/judge-replay.mjs && { rm -f "${TMPDIR:-/tmp}"/rt-3584-hold-[1-4].txt; for i in 1 2 3 4; do (node projects/agent-kit/tests/judge-replay.mjs --key ask --only 2020- --model haiku > "${TMPDIR:-/tmp}/rt-3584-hold-$i.txt" 2>&1; true) & done; wait; grep -hE '^(mismatch|retry|judge replay:)' "${TMPDIR:-/tmp}"/rt-3584-hold-[1-4].txt >&2; cat "${TMPDIR:-/tmp}"/rt-3584-hold-[1-4].txt | grep -cE '^ok 2020-'; }` → >= 19
    13. Прогон повторяет вызов, вышедший за 90 с
       Check: `set -o pipefail; grep -q 'timeout: 90_000' projects/agent-kit/tests/judge-replay.mjs && c=$(mktemp) && { RT_JUDGE_RUNNER="cat >/dev/null; if [ -s $c ]; then echo allow; else echo 1 > $c; sleep 95; echo allow; fi" node projects/agent-kit/tests/judge-replay.mjs --key ask --only 2411-morning-held-4 2>&1; true; } | grep -cE '^(retry|ok) '` → = 2
    14. Прогон повторяет вызов без ответа ровно один раз
       Check: `set -o pipefail; grep -q 'retry' projects/agent-kit/tests/judge-replay.mjs && c=$(mktemp) && { RT_JUDGE_RUNNER="cat >/dev/null; echo 1 >> $c" node projects/agent-kit/tests/judge-replay.mjs --key ask --only 2411-morning-held-4 >/dev/null 2>&1; true; } && grep -c . "$c"` → = 2
    15. Прогон повторяет вызов без вердикта ровно один раз
       Check: `set -o pipefail; grep -q 'retry' projects/agent-kit/tests/judge-replay.mjs && c=$(mktemp) && { RT_JUDGE_RUNNER="cat >/dev/null; echo 1 >> $c; echo maybe" node projects/agent-kit/tests/judge-replay.mjs --key ask --only 2411-morning-held-4 >/dev/null 2>&1; true; } && grep -c . "$c"` → = 2
- **Readiness sign:** судья пускает вопрос о влитии ветки задачи и держит пять влитий SC-AK-2020 в каждом
  запуске на модели прогона, а на модели фоновой работы задержки и вопросы о влитии утра совпадают в 18 из 20.
- **Verified by:** `bash projects/agent-kit/tests/turn-replay.test.sh` — последняя строка «0 провалов».

### 2. Тексты

- **Steps:**
    1. Спек записанных ходов называет влитие сценарием SC-AK-2020
       Check: `grep -c '^### SC-AK-2020' docs/specs/agent-kit/turn-guards/flow-script/replay/scenarios.md` → = 1
    2. Предел ночи в наборе дня называет RT-3721
       Check: `grep -q 'limit RT-3721' projects/agent-kit/tests/owner-waits-replay.test.sh && ! grep -q 'limit RT-3584' projects/agent-kit/tests/owner-waits-replay.test.sh` → exit 0
    3. Спек записанных ходов называет предел ночи задачей RT-3721
       Check: `grep -q 'limit RT-3721' docs/specs/agent-kit/turn-guards/flow-script/replay/scenarios.md && ! grep -q 'limit RT-3584' docs/specs/agent-kit/turn-guards/flow-script/replay/scenarios.md` → exit 0
    4. Точка B плана эпика для RT-3584 называет ночную часть задачей RT-3721
       Check: `set -o pipefail; grep -A3 '^- \*\*B (RT-3584):\*\*' docs/plans/owner-stop-holds.md | grep -c 'RT-3721'` → >= 1
    5. План эпика не обещает отпуск хода строкой ночи
       Check: `grep -q 'Работа ночи кончилась» отпускает ход' docs/plans/owner-stop-holds.md` → exit 1
    6. План эпика кончает эпик задачей RT-3594 и называет, что PR эпика в главную ветку вливает владелец
       Check: `grep -q 'Эпик кончается задачей RT-3594' docs/plans/owner-stop-holds.md && ! grep -q 'Эпик кончается задачей RT-3584' docs/plans/owner-stop-holds.md && grep -c 'PR эпика в главную ветку вливает владелец' docs/plans/owner-stop-holds.md` → >= 1
    7. Карточка RT-3584 называет прогон судьи
       Check: `set -o pipefail; GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)" /opt/homebrew/bin/gh api repos/Eyhenij/rt-tools/issues/3584 --jq .body | grep -c 'judge-replay.mjs --key ask'` → >= 1
    8. Карточка RT-3584 называет строку предела в наборе дня
       Check: `set -o pipefail; GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)" /opt/homebrew/bin/gh api repos/Eyhenij/rt-tools/issues/3584 --jq .body | grep 'owner-waits-replay.test.sh' | grep -c 'RT-3721'` → >= 1
    9. Карточка RT-3584 называет судью вопросов в заголовке
       Check: `set -o pipefail; GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)" /opt/homebrew/bin/gh api repos/Eyhenij/rt-tools/issues/3584 --jq .title | grep -cE '(С|с)уд(ья|ьи|ью|ьёй) вопросов'` → >= 1
    10. Карточка RT-3584 не обещает ночь
       Check: `set -o pipefail; B=$(GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)" /opt/homebrew/bin/gh api repos/Eyhenij/rt-tools/issues/3584 --jq '.title + "\n" + .body') && ! printf '%s\n' "$B" | grep -qE 'списк(а|у|е|ом|и)? к утру|не называет меню|Работа ночи кончилась|^\[RT-3584\] Ночью' && ! printf '%s\n' "$B" | grep -v 'RT-3721' | grep -qE 'без меню|autonomous-work|не останавливает работу меню'` → exit 0
    11. Карточка эпика RT-3602 называет ночь задачей RT-3721, свой состав и RT-3584 — судьёй вопросов
       Check: `set -o pipefail; B=$(GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)" /opt/homebrew/bin/gh api repos/Eyhenij/rt-tools/issues/3602 --jq '.title + "\n" + .body') && ! printf '%s\n' "$B" | grep -v 'RT-3721' | grep -qE '(Н|н)оч' && ! printf '%s\n' "$B" | grep 'RT-3584 —' | sed 's/^.*RT-3584 — //; s/\..*//' | grep -qE '(Н|н)оч' && printf '%s\n' "$B" | grep -q 'RT-3721' && ! printf '%s\n' "$B" | head -1 | grep -q 'кнопками' && ! printf '%s\n' "$B" | grep -qE '^([0-9]+\.|-) RT-3593 —' && printf '%s\n' "$B" | grep -q 'RT-3672' && printf '%s\n' "$B" | grep -q 'RT-3673' && printf '%s\n' "$B" | grep -q 'RT-3674' && printf '%s\n' "$B" | grep -q 'RT-3594' && printf '%s\n' "$B" | grep 'RT-3584 —' | grep -cE '(С|с)уд(ья|ьи|ью|ьёй) вопросов'` → >= 1
    12. Карточка RT-3721 ссылается на архивную запись RT-3584, а не на исчезающие тексты
       Check: `set -o pipefail; B=$(GH_TOKEN="$(cat ~/.config/rt-tools-bot-token)" /opt/homebrew/bin/gh api repos/Eyhenij/rt-tools/issues/3721 --jq .body) && ! printf '%s\n' "$B" | grep -qE 'пункт B плана эпика #3602 для RT-3584|docs/tasks/RT-3584-' && printf '%s\n' "$B" | grep -c 'docs/archive/RT-3584-night-work-ends-itself.md'` → >= 1
    13. Журнал называет RT-3584 и судью вопросов под ненапечатанным выпуском
       Check: `set -o pipefail; sed -n '/^## \[Unreleased\]/,/^#\{1,2\} \[/p' projects/agent-kit/CHANGELOG.md | grep 'RT-3584' | grep -cE '(С|с)уд(ья|ьи|ью|ьёй) вопросов'` → >= 1
    14. Спек шага называет один повтор вызова без ответа или без вердикта
       Check: `set -o pipefail; S=$(sed -n '/^### SC-AK-1941/,/^Covered:/p' docs/specs/agent-kit/turn-guards/flow-script/step-mark/scenarios.md) && ! printf '%s\n' "$S" | grep -q 'an answer with no verdict stays a mismatch' && ! { printf '%s\n' "$S" | grep -q 'code 0 and nothing' && printf '%s\n' "$S" | grep '^Then' | grep 'stops on the first call' | grep -qvE 'once|second'; } && ! grep -q 'or said nothing' docs/specs/agent-kit/turn-guards/flow-script/step-mark/implementation.md && printf '%s\n' "$S" | grep -c 'once'` → >= 1
    15. План эпика отдаёт ночное меню задаче RT-3721
       Check: `grep -q 'Не убирает меню ночью: это RT-3721' docs/plans/owner-stop-holds.md && ! grep -q 'Не убирает меню ночью: это RT-3587' docs/plans/owner-stop-holds.md` → exit 0
    16. План эпика велит перемерить судью вопросов на главной ветке перед выпуском
       Check: `set -o pipefail; tr -s '\n' ' ' < docs/plans/owner-stop-holds.md | grep -oE '(П|п)еред каждым выпуском[^.]*judge-replay\.mjs --key ask[^.]*главной ветке' | grep -c .` → >= 1
- **Readiness sign:** спек, набор дня, план эпика, карточки и журнал называют то, что делает задача.
- **Verified by:** `node tools/check-specs.mjs` — выход 0.

## What this work does not do

- Ночь, объявленная словами, без строки «Автономно до:», отпуск ночи без работы строкой «Работа ночи кончилась» и
  правило `autonomous-work` — задача RT-3721, вынесенная словом владельца 27.11 «Судья сейчас, ночь после»; она идёт
  сразу после выпуска кита. Ночь из записи 24.11 до неё печатается строкой `limit RT-3721`.
- Живой судья вопросов шагом не меряется целиком: `judge-replay.mjs --as-hook` берёт только пары `judge`, а живой
  хук читает запись и ход работы, прогон — только ходы фикстуры. Хук вопросов не называет модели, и хост судит его
  своей моделью фоновой работы; задача её не выбирает и меряет на ней задержки утра и пять влитий. Замер 27.11 до
  плана на этой модели: черновик — 13 из 16 прежних пар `ask` дважды; вопросы утра 7 из 7 дважды, затем 7, 7, 6 и
  5 из 7 при двенадцати процессах сразу — промахи на `2411-morning-roles-after-1` (он промахивался и на нынешнем
  тексте в обоих запусках) и один раз на held-4; нынешний текст — 5 и 4 из 7; пять фикстур SC-AK-2020 — 10 из 10,
  затем 20 из 20. Промахи на 1460, 1911-approval, 1934-product-choice и roles-after-1 есть и на нынешнем тексте.
  Модель живого хука и эти промахи — карточка вне эпика, которую заводит слово владельца в меню одобрения плана.
- Живой хук не повторяет вызов без вердикта, а прогон повторяет его один раз: строки `retry` ход работы пишет на
  каждый запуск, чтобы было видно, сколько пар совпали со второй попытки.
- Снятие случая проверки, снижение её порога и исключение в ней текст судьи держит, но фикстур на них нет: точка
  обещает только выключение, часть доказательства и действие владельца.
- Шаг 2.11 RT-3594 не повторяется в этом плане: его пары меряются здесь в каждом из четырёх запусков, а сам шаг
  отмечает движок RT-3594 после влития.
- RT-3555 — пропуск варианта, который добавляет исключение по решению владельца, — этой задачей не решается:
  пункт влития такой вариант держит, как держал пункт ослабления до правки. Карточка правит тот же раздел текста и
  берётся отдельно.
- Текст не велит судье проверять план ветки, и голое «Влить RT-N» без описания после задержки судьи проходит:
  папка задачи лежит в её ветке, а не в копии сессии, и влитие всё равно решает владелец своим нажатием.
- Папка `docs/tasks/RT-3721-night-by-word/` в коммиты этой ветки не входит: она заводится в ветке RT-3721.
- Ветка задачи не переименовывается: её имя `night-work-ends-itself` осталось от прежнего состава.
