#!/usr/bin/env bash
# Сценарии гарда входа на стенд: просьба к владельцу войти или ввести пароль не закрывает ход.
#
# Проверяется работа набора образцов, а не его полнота: гард её не гарантирует — просьбу другими
# словами или через меню вариантов он не распознаёт, и это сказано в его шапке.
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

# --- SC-AK-840 — просьба сделать ввод за агента не закрывает ход -----------------------------
expect_stop "SC-AK-840 — просьба ввести пароль запрещена" \
    "$(input_stop "$(transcript "$(say 'проверь экран отчётов')" \
        "$(reply 'Поле пароля отбито классификатором — введи пароль сам, дальше я продолжу.')")")" BLOCK
expect_stop "SC-AK-840 — просьба войти самому запрещена" \
    "$(input_stop "$(transcript "$(say 'проверь экран отчётов')" \
        "$(reply 'Войди, пожалуйста, сам на стенде — расширение перехватывает форму.')")")" BLOCK
expect_stop "SC-AK-840 — просьба заполнить форму входа запрещена" \
    "$(input_stop "$(transcript "$(say 'сними замер')" \
        "$(reply 'Заполни форму входа своей учётной записью, а я сниму замер.')")")" BLOCK

# --- SC-AK-841 — просьба переключить режим работы разрешена ---------------------------------------------
# Гард различает «переключи обычный режим» и «введи за меня»: первое — допустимый шаг входа,
# второе перекладывает работу агента на владельца.
expect_stop "SC-AK-841 — просьба об обычном режиме проходит" \
    "$(input_stop "$(transcript "$(say 'проверь экран отчётов')" \
        "$(reply 'Ввод в поле пароля отбивает классификатор автоматического режима. Включи обычный режим — форму заполню я и верну автоматический тем же ходом.')")")" PASS
expect_stop "SC-AK-841 — отчёт о сделанном входе проходит" \
    "$(input_stop "$(transcript "$(say 'проверь экран отчётов')" \
        "$(reply 'Вошёл парой засева, экран открылся, замер снят: ширина документа 1280.')")")" PASS
expect_stop "обычная работа проходит" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(reply 'Панель падала на пустом ответе — поправил условие.')")")" PASS

# --- при ошибке гард пропускает -------------------------------------------------------------------
expect_stop "повторный заход разрешается" \
    "$(input_stop "$(transcript "$(say 'проверь экран')" "$(reply 'Введи пароль сам.')")" true)" PASS
expect_stop "нет записи хода — проверять нечего" "$(input_stop "$TURNS/нетакого.jsonl")" PASS
expect_stop "пустой ввод пропускается" '' PASS

# Просьба, сказанная самим владельцем, ответом агента не считается: проверяется ответ, а не реплика.
expect_stop "слова владельца не проверяются" \
    "$(input_stop "$(transcript "$(say 'введи пароль сам и проверь')" "$(reply 'Готово, замер снят.')")")" PASS

suite_result "гард входа на стенд"
