#!/usr/bin/env bash
# Сценарии гарда входа на стенд: просьба к владельцу войти или ввести пароль ход не закрывает.
#
# Проверяется механика набора образцов, а не его полнота: гард её и не обещает — просьба словами
# вне набора и просьба, поданная меню вариантов, ему не видны, и это сказано в его шапке.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард входа на стенд"

TURNS="$(mktemp -d)"
cleanup() { rm -rf "$TURNS"; }
trap cleanup EXIT

transcript() {
    local path
    path="$TURNS/turn-$RANDOM.jsonl"
    : >"$path"
    for line in "$@"; do
        printf '%s\n' "$line" >>"$path"
    done
    printf '%s' "$path"
}

say() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"text",text:$t}]}}'; }
reply() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"text",text:$t}]}}'; }

input_stop() {
    jq -n --arg p "$1" --argjson a "${2:-false}" '{session_id:"tests",transcript_path:$p,stop_hook_active:$a}'
}

expect_stop() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/stand-login-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

# --- SC-AK-840 — просьба сделать ввод за агента ход не закрывает --------------------------------
expect_stop "SC-AK-840 — просьба ввести пароль отбита" \
    "$(input_stop "$(transcript "$(say 'проверь экран отчётов')" \
        "$(reply 'Поле пароля отбито классификатором — введи пароль сам, дальше я продолжу.')")")" BLOCK
expect_stop "SC-AK-840 — просьба войти самому отбита" \
    "$(input_stop "$(transcript "$(say 'проверь экран отчётов')" \
        "$(reply 'Войди, пожалуйста, сам на стенде — расширение перехватывает форму.')")")" BLOCK
expect_stop "SC-AK-840 — просьба заполнить форму входа отбита" \
    "$(input_stop "$(transcript "$(say 'сними замер')" \
        "$(reply 'Заполни форму входа своей учётной записью, а я сниму замер.')")")" BLOCK

# --- SC-AK-841 — просьба о режиме работы законна ------------------------------------------------
# Разница между «дай обычный режим» и «введи за меня» и есть предмет этого гарда: первое —
# законный шаг входа, второе перекладывает работу агента на владельца.
expect_stop "SC-AK-841 — просьба об обычном режиме проходит" \
    "$(input_stop "$(transcript "$(say 'проверь экран отчётов')" \
        "$(reply 'Ввод в поле пароля отбивает классификатор автоматического режима. Включи обычный режим — форму заполню я и верну автоматический тем же ходом.')")")" PASS
expect_stop "SC-AK-841 — рассказ о сделанном входе проходит" \
    "$(input_stop "$(transcript "$(say 'проверь экран отчётов')" \
        "$(reply 'Вошёл парой засева, экран открылся, замер снят: ширина документа 1280.')")")" PASS
expect_stop "обычная работа гарду безразлична" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(reply 'Панель падала на пустом ответе — поправил условие.')")")" PASS

# --- отказ в пользу работы ----------------------------------------------------------------------
expect_stop "повторный заход отпускается" \
    "$(input_stop "$(transcript "$(say 'проверь экран')" "$(reply 'Введи пароль сам.')")" true)" PASS
expect_stop "нет записи хода — нечего судить" "$(input_stop "$TURNS/нетакого.jsonl")" PASS
expect_stop "пустой ввод пропускается" '' PASS

# Просьба владельца, сказанная им самим, ходом агента не считается: судится ответ, а не реплика.
expect_stop "слова владельца гарду не принадлежат" \
    "$(input_stop "$(transcript "$(say 'введи пароль сам и проверь')" "$(reply 'Готово, замер снят.')")")" PASS

suite_result "гард входа на стенд"
