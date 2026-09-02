#!/usr/bin/env bash
# Сценарии признака вызова: что считается командой, стоящей в позиции команды, а что её
# упоминанием.
#
# Признаком пользуются все гарды, судящие командную строку, и живёт он одним местом: разойдясь,
# копии чинятся по одной и молчат о том, что остальные остались слепыми.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "признак вызова"

# shellcheck disable=SC1090
. "$ASSETS/hooks/hook-input.sh"

# Узнаёт ли признак названную команду в этой строке.
knows() {
    if printf '%s' "$2" | grep -qE "${RT_CMD_BOUND}($1)([[:space:]]|\$)"; then
        printf 'да'
    else
        printf 'нет'
    fi
}
PR='gh[[:space:]]+pr[[:space:]]+create'

# --- SC-AK-844. Присваивание перед вызовом вызова не прячет ------------------------------------
# Заявки открывают командой с подстановкой токена, и её признак не узнавал вовсе: значение
# бралось без пробелов, а путь в подстановке пробел содержит. Гард поставки на такой команде
# молчал, и молчание читалось как разрешение.
report "SC-AK-844 — подстановка в значении вызова не прячет" \
    "$(knows "$PR" 'GH_TOKEN=$(cat ~/.config/token) gh pr create --title x')" да
report "SC-AK-844 — значение в кавычках тоже" "$(knows "$PR" 'GH_TOKEN="a b" gh pr create')" да
report "SC-AK-844 — значение в одинарных кавычках тоже" "$(knows "$PR" "GH_TOKEN='a b' gh pr create")" да
report "SC-AK-844 — два присваивания подряд" \
    "$(knows "$PR" 'A=1 GH_TOKEN=$(cat f) gh pr create')" да
report "SC-AK-844 — та же форма за разделителем" \
    "$(knows "$PR" 'cd /tmp && GH_TOKEN=$(cat f) gh pr create')" да

# --- прежние случаи не поехали ------------------------------------------------------------------
report "голый вызов узнаётся" "$(knows "$PR" 'gh pr create --title x')" да
report "значение без пробелов узнаётся" "$(knows "$PR" 'GH_TOKEN=$TOKEN gh pr create')" да
report "вызов полным путём узнаётся" "$(knows "$PR" '/opt/homebrew/bin/gh pr create')" да
report "упоминание в кавычках вызовом не считается" \
    "$(knows "$PR" 'echo "GH_TOKEN=$(cat f) gh pr create"')" нет
report "поиск по дереву вызовом не считается" "$(knows "$PR" 'grep -rn "gh pr create" docs/')" нет
report "само присваивание вызовом не считается" "$(knows "$PR" 'GH_TOKEN=$(cat f)')" нет

suite_result "признак вызова"
