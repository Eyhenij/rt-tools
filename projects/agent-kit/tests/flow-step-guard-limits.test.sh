#!/usr/bin/env bash
# Сценарии стража хода работы на машине без `timeout`: страж судит правку и запись плана под первым
# ограничителем времени, который есть на машине, а без них — без предела. Сценарий SC-AK-2021.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "страж хода работы: ограничитель времени"

GUARD=flow-step-guard.sh
TMPS=()
cleanup() { rm -rf "${TMPS[@]}"; }
trap cleanup EXIT

. "$(dirname "${BASH_SOURCE[0]}")/flow-step-guard-lib.sh"

# Каталог команд случая — ссылки на всё из PATH, кроме `timeout`, `gtimeout` и perl; ограничитель
# вида кладётся заглушкой, которая пишет свои доводы в отметку и передаёт ход дальше.
REAL_PERL="$(command -v perl)"
LIMIT_BASE="$(mktemp -d)"
TMPS+=("$LIMIT_BASE")
# Каталог PATH берётся абсолютным: под nx первым стоит `./node_modules/.bin`, и ссылка из него вела
# в никуда, а имя команды было уже занято.
( IFS=:; for dir in $PATH; do dir="$(cd "$dir" 2>/dev/null && pwd)" || continue; for f in "$dir"/*; do n="${f##*/}"
    case "$n" in timeout | gtimeout | perl) continue ;; esac
    [ -x "$f" ] && [ ! -e "$LIMIT_BASE/$n" ] && ln -s "$f" "$LIMIT_BASE/$n"; done; done )
# Каталог вида: $1 — имя переменной для пути, дальше — заглушки вида: gtimeout, perl или ни одной.
# Каталог заводится в этой оболочке, а не в подстановке: иначе его не видит уборка по выходу.
limit_bin() {
    local var="$1" bin
    shift
    bin="$(mktemp -d)/bin"
    TMPS+=("${bin%/bin}")
    cp -RP "$LIMIT_BASE" "$bin"
    for stub in "$@"; do
        case "$stub" in
            timeout | gtimeout) printf '#!/bin/sh\necho "%s $*" >> "%s"\nshift\nexec "$@"\n' "$stub" "${bin%/bin}/mark" > "$bin/$stub" ;;
            # Ограничитель без права на запуск: bash 3.2 всё равно называет его в `command -v`.
            noexec-gtimeout) printf '#!/bin/sh\necho "gtimeout $*" >> "%s"\n' "${bin%/bin}/mark" > "$bin/gtimeout"; continue ;;
            perl) printf '#!/bin/sh\necho "perl $*" >> "%s"\nexec "%s" "$@"\n' "${bin%/bin}/mark" "$REAL_PERL" > "$bin/perl" ;;
        esac
        chmod +x "$bin/$stub"
    done
    printf -v "$var" '%s' "$bin"
}
B8=RT-11-limits
R8="$(task_repo "$B8")"
TMPS+=("$R8")
P8="$R8/docs/tasks/$B8/progress.md"
progress_text 'этап-идёт' '>' ' ' > "$P8"
limit_bin K1 gtimeout
limit_bin K2 perl
limit_bin K3
limit_bin K4 gtimeout perl
limit_bin K5 noexec-gtimeout perl
limit_bin K6 timeout gtimeout perl
PATH_KEEP="$PATH"
PLAN8="$(printf '# Plan\n\n## Decision\n\nNo decision: probe fixture\n\n## Stages\n\n### 1. Этап\n\n- **Steps:**\n    1. Первый шаг\n       Check: `cat a.txt | tail -1` → `готово`\n')"

PATH="$K1"
d "guard: SC-AK-2021 — только gtimeout: [x] рукой отказан" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" deny
expect_reason "guard: SC-AK-2021 — только gtimeout: отказ называет команду шага" "$GUARD" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" 'task-flow-script.mjs step 1.1'
d "guard: SC-AK-2021 — только gtimeout: законная правка проходит" "$(edit_input Edit "$P8" '# Ход работы' '# Ход работы.' "$R8")" PASS
d "guard: SC-AK-2021 — только gtimeout: запись плана со скрытой проверкой отказана" "$(edit_input Write "$R8/docs/tasks/$B8/plan.md" '' "$PLAN8" "$R8")" deny
PATH="$PATH_KEEP"
report "guard: SC-AK-2021 — только gtimeout: отметка вызова записи плана под пределом" "$(grep -q '^gtimeout 60 node .*flow-plan.mjs written' "${K1%/bin}/mark" 2>/dev/null && echo есть || echo нет)" есть
report "guard: SC-AK-2021 — только gtimeout: отметка вызова с пределом 60" "$(grep -q '^gtimeout 60 node ' "${K1%/bin}/mark" 2>/dev/null && echo есть || echo нет)" есть

PATH="$K2"
d "guard: SC-AK-2021 — только perl: [x] рукой отказан" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" deny
d "guard: SC-AK-2021 — только perl: запись плана со скрытой проверкой отказана" "$(edit_input Write "$R8/docs/tasks/$B8/plan.md" '' "$PLAN8" "$R8")" deny
expect_reason "guard: SC-AK-2021 — только perl: отказ записи плана называет трубу" "$GUARD" "$(edit_input Write "$R8/docs/tasks/$B8/plan.md" '' "$PLAN8" "$R8")" 'a pipe without'
expect_reason "guard: SC-AK-2021 — только perl: отказ называет команду шага" "$GUARD" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" 'task-flow-script.mjs step 1.1'
d "guard: SC-AK-2021 — только perl: законная правка проходит" "$(edit_input Edit "$P8" '# Ход работы' '# Ход работы.' "$R8")" PASS
PATH="$PATH_KEEP"
report "guard: SC-AK-2021 — только perl: отметка вызова с alarm и пределом 60" "$(grep -q '^perl -e alarm shift; exec @ARGV 60 node ' "${K2%/bin}/mark" 2>/dev/null && echo есть || echo нет)" есть
report "guard: SC-AK-2021 — только perl: отметка вызова записи плана под пределом" "$(grep -q '^perl -e alarm shift; exec @ARGV 60 node .*flow-plan.mjs written' "${K2%/bin}/mark" 2>/dev/null && echo есть || echo нет)" есть

PATH="$K3"
d "guard: SC-AK-2021 — без ограничителя: [x] рукой отказан" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" deny
expect_reason "guard: SC-AK-2021 — без ограничителя: отказ называет команду шага" "$GUARD" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" 'task-flow-script.mjs step 1.1'
d "guard: SC-AK-2021 — без ограничителя: законная правка проходит" "$(edit_input Edit "$P8" '# Ход работы' '# Ход работы.' "$R8")" PASS
d "guard: SC-AK-2021 — без ограничителя: запись плана со скрытой проверкой отказана" "$(edit_input Write "$R8/docs/tasks/$B8/plan.md" '' "$PLAN8" "$R8")" deny
expect_reason "guard: SC-AK-2021 — без ограничителя: отказ записи плана называет трубу" "$GUARD" "$(edit_input Write "$R8/docs/tasks/$B8/plan.md" '' "$PLAN8" "$R8")" 'a pipe without'
PATH="$PATH_KEEP"

# gtimeout и perl рядом: берётся первый по порядку, perl не зовётся.
PATH="$K4"
d "guard: SC-AK-2021 — gtimeout и perl: [x] рукой отказан" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" deny
PATH="$PATH_KEEP"
report "guard: SC-AK-2021 — gtimeout и perl: отметка только у gtimeout" "$(grep -q '^gtimeout 60 ' "${K4%/bin}/mark" 2>/dev/null && ! grep -q '^perl ' "${K4%/bin}/mark" && echo да || echo нет)" да

# gtimeout без права на запуск не выбирается: зовётся perl.
PATH="$K5"
d "guard: SC-AK-2021 — gtimeout без права на запуск: [x] рукой отказан" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" deny
PATH="$PATH_KEEP"
report "guard: SC-AK-2021 — gtimeout без права на запуск: отметка только у perl" "$(grep -q '^perl -e alarm' "${K5%/bin}/mark" 2>/dev/null && ! grep -q '^gtimeout ' "${K5%/bin}/mark" && echo да || echo нет)" да

# timeout рядом с gtimeout и perl: берётся timeout.
PATH="$K6"
d "guard: SC-AK-2021 — timeout, gtimeout и perl: [x] рукой отказан" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" deny
PATH="$PATH_KEEP"
report "guard: SC-AK-2021 — timeout, gtimeout и perl: отметка только у timeout" "$(grep -q '^timeout 60 node ' "${K6%/bin}/mark" 2>/dev/null && ! grep -qE '^(gtimeout|perl) ' "${K6%/bin}/mark" && echo да || echo нет)" да

suite_result "страж хода работы: ограничитель времени"
