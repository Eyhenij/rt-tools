#!/usr/bin/env bash
# Сценарии рода стражей и проверок пакета: чем они обязаны быть, чтобы дерево-потребитель их
# позвало и чтобы отбитый понял, что делать дальше.
#
# Набор судит сами файлы пакета, а не фикстуру: предмет здесь — исполняемые ресурсы, которые пакет
# только перекладывает, и подменять их образцом значило бы проверять образец.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: род стражей и проверок"

HOOK_DIR="$ASSETS/hooks"
CHECK_DIR="$ASSETS/checks"
TESTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Страж объявляет событие строкой `rt-hook:`; помощник такой строки не держит.
is_guard() {
    grep -qE '^#[[:space:]]*rt-hook:' "$1"
}

# --- SC-AK-1036 — страж объявляет событие в заголовке ------------------------------------------
# Признак стража — сама строка объявления, а не имя файла: `guard-note.sh` зовётся стражами и
# стражем не является, а имя об этом молчит. Проба судит обратное: у объявившего событие строка
# называет и событие, и набор инструментов.
half_declared=0
for hook in "$HOOK_DIR"/*.sh; do
    is_guard "$hook" || continue
    line="$(grep -E '^#[[:space:]]*rt-hook:' "$hook" | head -1)"
    event="$(printf '%s' "$line" | sed -nE 's/^#[[:space:]]*rt-hook:[[:space:]]*([^[:space:]]+).*/\1/p')"
    [ -n "$event" ] || { half_declared=$((half_declared + 1)); continue; }
    # Набор инструментов требуется там, где событие его принимает: у события конца хода его нет.
    case "$event" in
        PreToolUse | PostToolUse)
            printf '%s' "$line" | grep -qE '^#[[:space:]]*rt-hook:[[:space:]]*[A-Za-z]+[[:space:]]+[^[:space:]]' \
                || half_declared=$((half_declared + 1))
            ;;
    esac
done
report "SC-AK-1036 — объявление называет событие и, где надо, инструменты" "$half_declared" 0

# --- SC-AK-1037 — помощник говорит о себе, что он не страж -------------------------------------
silent_helpers=0
for hook in "$HOOK_DIR"/*.sh; do
    is_guard "$hook" && continue
    head -12 "$hook" | grep -qiE 'not a guard|hooks into no' || silent_helpers=$((silent_helpers + 1))
done
report "SC-AK-1037 — помощники говорят о себе" "$silent_helpers" 0

# --- SC-AK-1038 — страж отбивает в пользу работы ------------------------------------------------
# Тот же долг и тот же порядок: четыре стража из тридцати об отказе в пользу работы молчат.
FAILOPEN_SILENT='browser-guard-device-id.sh dev-server-guard.sh skill-loaded.sh stand-login-guard.sh'
silent_failopen=0
for hook in "$HOOK_DIR"/*.sh; do
    is_guard "$hook" || continue
    name="$(basename "$hook")"
    case " $FAILOPEN_SILENT " in
        *" $name "*) continue ;;
    esac
    grep -qiE 'FAIL-OPEN|fail-open' "$hook" || silent_failopen=$((silent_failopen + 1))
done
report "SC-AK-1038 — новых стражей без отказа в пользу работы нет" "$silent_failopen" 0

# --- SC-AK-1039 — отказ называет законные ходы --------------------------------------------------
# Общий хвост отказа лежит в одном помощнике: страж, который его не зовёт и не пишет свой,
# оставляет отбитого без хода.
# Указатель законов ничего не отбивает: он печатает список в начале захода, и слово «decision» в
# нём — из чужого предложения. Хвоста отказа ему неоткуда взять.
TAILLESS='constitution-index.sh'
without_tail=0
for hook in "$HOOK_DIR"/*.sh; do
    is_guard "$hook" || continue
    name="$(basename "$hook")"
    case " $TAILLESS " in
        *" $name "*) continue ;;
    esac
    grep -qE 'permissionDecision|decision' "$hook" || continue
    grep -qE 'rt_deny_tail|Two moves from here|deny-tail' "$hook" || without_tail=$((without_tail + 1))
done
report "SC-AK-1039 — отказ называет законные ходы" "$without_tail" 0

# --- SC-AK-1040 — отказ называет, что именно не так ---------------------------------------------
mute_refusals=0
for hook in "$HOOK_DIR"/*.sh; do
    is_guard "$hook" || continue
    name="$(basename "$hook")"
    case " $TAILLESS " in
        *" $name "*) continue ;;
    esac
    grep -qE 'permissionDecision|decision' "$hook" || continue
    grep -qE 'permissionDecisionReason|reason' "$hook" || mute_refusals=$((mute_refusals + 1))
done
report "SC-AK-1040 — отказ называет причину" "$mute_refusals" 0

# --- SC-AK-1041 — страж читает ввод от агента ---------------------------------------------------
# Ввод приходит по стандартному вводу вызова; общее чтение лежит в помощнике рядом.
# Семь стражей ввод не читают вовсе: одни печатают в начале захода, другие судят только дерево.
# Требование к ним не относится, и список назван поимённо.
NO_INPUT='browser-guard-no-listing.sh constitution-index.sh glossary-load.sh task-context-load.sh
task-flow-draft-guard.sh task-flow-guard.sh turn-entry-load.sh'
own_reading=0
for hook in "$HOOK_DIR"/*.sh; do
    is_guard "$hook" || continue
    name="$(basename "$hook")"
    case " $(printf '%s' "$NO_INPUT" | tr '\n' ' ') " in
        *" $name "*) continue ;;
    esac
    grep -qE 'rt_hook_read|RT_HOOK_INPUT|hook-input' "$hook" || own_reading=$((own_reading + 1))
done
report "SC-AK-1041 — ввод берётся общим чтением" "$own_reading" 0

# --- SC-AK-1042 — проверка отвечает названным кодом выхода -------------------------------------
silent_code=0
for check in "$CHECK_DIR"/check-*.mjs; do
    grep -qE 'process\.exit' "$check" || silent_code=$((silent_code + 1))
done
report "SC-AK-1042 — проверки называют код выхода" "$silent_code" 0

# --- SC-AK-1043 — проверке нечего читать: она говорит об этом -----------------------------------
silent_empty=0
for check in "$CHECK_DIR"/check-*.mjs; do
    grep -qE 'console\.(log|error)' "$check" || silent_empty=$((silent_empty + 1))
done
report "SC-AK-1043 — проверки говорят вслух" "$silent_empty" 0

# --- SC-AK-1044 — у каждого стража есть набор проб ----------------------------------------------
# Набор находится по упоминанию имени стража в любом наборе проб пакета.
# Четыре стража проб не имеют, и это долг, а не решение. Список только убывает.
NO_SUITE='browser-guard-no-listing.sh dev-server-guard.sh skill-gate-rearm.sh sql-guard.sh'
unguarded=0
for hook in "$HOOK_DIR"/*.sh; do
    is_guard "$hook" || continue
    name="$(basename "$hook")"
    case " $NO_SUITE " in
        *" $name "*) continue ;;
    esac
    grep -qrF "$name" "$TESTS_DIR"/*.test.sh 2>/dev/null || unguarded=$((unguarded + 1))
done
report "SC-AK-1044 — новых стражей без проб нет" "$unguarded" 0

# --- SC-AK-1045 — признаки лежат данными, а не кодом --------------------------------------------
not_data=0
for signal in "$CHECK_DIR"/signals/*.json; do
    jq -e . "$signal" >/dev/null 2>&1 || not_data=$((not_data + 1))
done
report "SC-AK-1045 — наборы признаков читаются как данные" "$not_data" 0

# --- SC-AK-1046 — вход в спеки отвечает нулём по имени обоих родов ------------------------------
ROOT_TREE="$(cd "$ASSETS/../../.." && pwd)"
uncovered=0
if [ -f "$ROOT_TREE/tools/specs-for.mjs" ]; then
    for file in "$HOOK_DIR"/*.sh "$CHECK_DIR"/*.mjs; do
        case "$file" in
            *"/hooks/"*) where=hooks ;;
            *) where=checks ;;
        esac
        (cd "$ROOT_TREE" && node tools/specs-for.mjs "projects/agent-kit/assets/$where/$(basename "$file")" >/dev/null 2>&1) \
            || uncovered=$((uncovered + 1))
    done
fi
report "SC-AK-1046 — стражей и проверок без спеки не осталось" "$uncovered" 0

suite_result "проверки: род стражей и проверок"
