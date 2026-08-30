#!/usr/bin/env bash
# Сценарии гарда вопроса о выборе браузера.
#
# Проверяется область признака в обе стороны. Слово «браузер» само по себе признаком быть не
# может: у дерева, которое пишет фронт, есть правило `browser-verification` и семья хуков
# `browser-guard-*`, и вопрос об их раскладке законен — а обойти отбой можно только переписав
# вопрос без этого слова, то есть исказив его.
#
# Обратная сторона важна не меньше: вопрос, который действительно спрашивает, какой браузер
# брать, отбивается — профиль закреплён, и ответом может быть только он.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард вопроса о выборе браузера"

tree="$(mktemp -d)"
cleanup() { rm -rf "$tree"; }
trap cleanup EXIT

mkdir -p "$tree/.claude/hooks"
cp "$HOOKS/browser-device-id.sh" "$tree/.claude/hooks/browser-device-id.sh"
export CLAUDE_PROJECT_DIR="$tree"
export RT_BROWSER_DEVICE_ID=профиль-дерева

# Вход AskUserQuestion: вопрос, заголовок и подписи вариантов — гард склеивает их в одну строку.
ask() {
    local question="$1" header="$2"
    shift 2
    jq -n --arg q "$question" --arg h "$header" --args '
        {session_id:"tests",tool_name:"AskUserQuestion",
         tool_input:{questions:[{question:$q,header:$h,options:[$ARGS.positional[] | {label:.}]}]}}
    ' "$@"
}

say() {
    local label="$1" want="$2"
    shift 2
    local got
    if ask "$@" | "$HOOKS/browser-guard-no-asking.sh" >/dev/null 2>&1; then got="PASS"; else got="DENY"; fi
    report "$label" "$got" "$want"
}

# --- SC-AK-826. Слово в имени правила или хука вопроса о выборе не делает ----------------

say "SC-AK-826 — вопрос о раскладке слоя правил проходит" PASS \
    "Куда положить правило проверки в браузере?" "Раскладка" \
    "rules/browser-verification.md" "hooks/browser-guard-no-asking.sh"
say "SC-AK-826 — вопрос о поддержке браузеров проходит" PASS \
    "Какие браузеры поддерживаем в этой сборке?" "Поддержка" "последние две версии" "все живые"
say "SC-AK-826 — вопрос о хранилище браузера проходит" PASS \
    "Где держать выбор пользователя?" "Хранилище" "хранилище браузера" "на сервере"
say "SC-AK-826 — вопрос без слова вовсе проходит" PASS \
    "Какой порт занять под стенд?" "Порт" "6006" "6007"

# --- SC-AK-827. Вопрос о выборе профиля отбивается --------------------------------------

say "SC-AK-827 — «какой браузер брать» отбит" DENY \
    "Какой браузер использовать для проверки?" "Браузер" "Main" "Default"
say "SC-AK-827 — тот же вопрос по-английски отбит" DENY \
    "Which browser should I use?" "Browser" "Main" "Default"
say "SC-AK-827 — вопрос о признаке устройства отбит" DENY \
    "Уточни deviceId профиля" "Профиль" "первый" "второй"
say "SC-AK-827 — выбор профиля браузера отбит" DENY \
    "Select the browser profile to use" "Profile" "Main" "Work"

# --- SC-AK-828. Отказ называет закреплённый признак -------------------------------------

reason="$(ask "Какой браузер использовать?" "Браузер" "Main" "Default" \
    | "$HOOKS/browser-guard-no-asking.sh" 2>&1 >/dev/null)"
if printf '%s' "$reason" | grep -q 'профиль-дерева'; then got="есть"; else got="нет"; fi
report "SC-AK-828 — отказ называет признак устройства" "$got" "есть"

# --- SC-AK-829. Без закреплённого профиля гард молчит -----------------------------------

RT_BROWSER_DEVICE_ID= say "SC-AK-829 — профиль не закреплён: вопрос проходит" PASS \
    "Какой браузер использовать?" "Браузер" "Main" "Default"

suite_result "гард вопроса о выборе браузера"
