# Plan

**Task:** RT-3621 · **Branch:** RT-3621-guard-without-timeout
**Spec:** `docs/specs/agent-kit/turn-guards/flow-script/guard/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** на машине без команды `timeout` страж хода работы пропускает любую правку: вызов движка
  падает, и страж выходит с разрешением; набор стража — 69 провалов из 118, наборы записи плана
  `flow-plan-forms` и `flow-decision` — 11 и 6 провалов.
- **This task reaches:** страж судит правку и запись плана без `timeout`: берёт `gtimeout`, затем
  perl, а без них зовёт движок без предела.
- **Sign:** наборы `flow-step-guard`, `flow-plan-forms` и `flow-decision` зелёные под PATH без
  `timeout` и `gtimeout` — красная проверка задачи. В наборе стража случаи SC-AK-2004 сами собирают
  каталог команд в трёх видах: есть только `gtimeout`; есть только perl; нет ни одного. В каждом
  виде отметка «сделано» без зелёной метки отказана с командой шага в тексте, а законная правка
  проходит; в виде без ограничителей отказана и запись плана со скрытой проверкой. Заглушки
  `gtimeout` и `perl` пишут отметку о вызове с переданным пределом: вид с ограничителем ждёт
  отметку с числом 60, вид perl — ещё и слово `alarm`, вид без них — ни одной. Прежний набор
  идёт и под обычным PATH с `timeout`. Отказ читается через `expect_reason`: команда шага
  стоит в тексте. В дереве точка наступает с раскладкой этапа 2, у потребителя пакета — с выпуском пакета.
- **Milestone G of the epic:** нет эпика — работа вне эпика по слову владельца «Взять задачу из
  очереди».
- **Metric:** нет: страж пропускал правки на машине без `timeout`.

## Decision

| Part | What is chosen |
| --- | --- |
| Modules | `projects/agent-kit/assets/hooks/flow-step-guard.sh:rt_limited` — зовёт команду под первым ограничителем времени, который есть на машине; оба вызова движка, `guard` и `flow-plan.mjs written`, идут через неё |
| Dependencies | хук зовёт `timeout`, `gtimeout` или `perl`, если они есть; новых зависимостей пакета нет; хук не берёт ничего из соседних хуков ради этой функции |
| Coupling | кода нет: правка в оболочке хука, проверка зацепления читает только модули JS |
| Patterns | паттерна нет: одна функция с цепочкой из трёх ограничителей и запуском без предела |
| Terms | новых слов нет: «предел времени» и «ограничитель» — обычные слова, в словарь не идут |
| Input | из PATH машины: есть `timeout` — весь прежний набор; есть только `gtimeout`; есть только perl; нет ни одного — движок зовётся без предела. Каталог случая — ссылки на каждую команду PATH, кроме `timeout`, `gtimeout` и `perl`, поэтому jq, git и node остаются; `gtimeout` и `perl` случай кладёт сам заглушками, которые пишут отметку о вызове и зовут дальше настоящий perl или саму команду. Каждый вид ждёт и отказа, и прохода: сломанный страж пропускает всё, страж без меры отказывает всему. SC-AK-2004, `projects/agent-kit/tests/flow-step-guard.test.sh` |
| Bounds | вердикты движка и тексты отказов не меняются; хук по-прежнему пропускает вызов, когда движка нет, он падает, молчит или выходит по пределу — так требует спека; предел 60 секунд остаётся |
| Priority | надёжность над скоростью: правка без суда стоит дороже повисшего вызова, который хозяин остановит сам |
| Budget | `projects/agent-kit/assets/hooks/flow-step-guard.sh` плюс 15; `projects/agent-kit/tests/flow-step-guard.test.sh` плюс 60; new code files: 0; new dependencies: 0 |

## Task footprint

| What              | Where                                                    |
| ----------------- | -------------------------------------------------------- |
| Specs (правится)  | `docs/specs/agent-kit/turn-guards/flow-script/guard/`    |
| Laws              | `docs/constitution/work-conduct.md`                      |
| Rules             | `.claude/skills/agent-kit-source/`                       |
| Code (правится)   | `projects/agent-kit/assets/hooks/flow-step-guard.sh`     |
| Code (правится)   | `projects/agent-kit/tests/flow-step-guard.test.sh`       |
| Code (правится)   | `.claude/hooks/flow-step-guard.sh`                       |
| Code              | `projects/agent-kit/tests/flow-plan-forms.test.sh`       |
| Code              | `projects/agent-kit/tests/flow-decision.test.sh`         |

## What counts as done

- Наборы `flow-step-guard`, `flow-plan-forms` и `flow-decision` зелёные под PATH без `timeout` и
  `gtimeout`.
- Случаи SC-AK-2004 в каждом из трёх видов каталога отказывают ручной отметке, пропускают законную
  правку и видят, вызван ли ограничитель.
- Спека стража называет правило и сценарий SC-AK-2004 с местом в коде.
- Разложенный хук дерева совпадает с пакетом: `agent-kit:check` зелёный.

## Stages

### 1. Код

- **Steps:**
    1. Звать оба вызова движка стража под первым ограничителем времени, который есть на машине, и проверить это случаями SC-AK-2004
       Check: `bash -c 'set -o pipefail; t=projects/agent-kit/tests; [ "$(grep -cE "^ *d \"[^\"]*SC-AK-2004 —" $t/flow-step-guard.test.sh)" -ge 7 ] && [ "$(grep -cE "SC-AK-2004 — .*отметк" $t/flow-step-guard.test.sh)" -ge 3 ] && [ "$(grep -cE "^ *expect_reason \"[^\"]*SC-AK-2004 —" $t/flow-step-guard.test.sh)" -ge 3 ] || exit 1; bash $t/flow-step-guard.test.sh >/dev/null 2>&1 || exit 1; S=$(mktemp -d); IFS=:; for d in $PATH; do for f in "$d"/*; do n=${f##*/}; case $n in timeout|gtimeout) continue;; esac; [ -x "$f" ] && [ ! -e "$S/$n" ] && ln -s "$f" "$S/$n"; done; done; unset IFS; for s in flow-step-guard flow-plan-forms flow-decision; do PATH="$S" bash $t/$s.test.sh >/dev/null 2>&1 || exit 1; done; echo green'` → `green`
    2. Записать правило и сценарий SC-AK-2004 в спеку стража
       Check: `bash -c 'set -o pipefail; cat docs/specs/agent-kit/turn-guards/flow-script/guard/scenarios.md docs/specs/agent-kit/turn-guards/flow-script/guard/implementation.md | grep -c "SC-AK-2004"'` → >= 2
- **Readiness sign:** три набора зелёные под PATH без `timeout` и `gtimeout`, спека называет
  SC-AK-2004.
- **Verified by:** проверка шага 1.1 — строка `green`.

### 2. Раскладка

- **Steps:**
    1. Разложить пакет в дерево и сверить разложенное
       Check: `bash -c 'grep -q "rt_limited" .claude/hooks/flow-step-guard.sh && ! grep -q "timeout 60 node" .claude/hooks/flow-step-guard.sh && pnpm run -s agent-kit:check >/dev/null 2>&1'` → exit 0
- **Readiness sign:** хук дерева несёт ограничитель и не зовёт `timeout` напрямую, раскладка
  совпадает с пакетом.
- **Verified by:** `pnpm run -s agent-kit:check` — код 0.

## What this work does not do

- Другие хуки пакета `timeout` не зовут: `shell-words.sh`, `hook-input.sh`, `push-sign.sh` только
  разбирают это слово в команде, `dispatch.sh` ставит предел через perl и без него идёт без
  предела. Хук дерева `.claude/hooks/git-guard-draft-ready.sh` уже спрашивает `command -v timeout`.
- Страж конца хода без perl отпускает ход и пишет «движок упал» в журнал. Так требует правило его
  спеки «An engine that fails, runs past its limit or cannot be called releases the turn and writes
  «движок упал» to the journal»; отпуск не молчаливый, правки там нет.
- Пропуск вызова, когда движок упал, молчит или вышел по пределу, остаётся: так требует правило
  спеки стража «The guard lets a call through when the engine is absent, fails or prints nothing».
- Выпуск новой версии пакета — отдельное решение владельца: выпуск запускается вручную, и до него
  потребитель пакета живёт с прежним стражем.
