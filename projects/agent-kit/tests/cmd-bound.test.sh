#!/usr/bin/env bash
# Сценарии признака вызова: что считается командой, стоящей в позиции команды, а что её
# упоминанием.
#
# Признаком пользуются все гарды, проверяющие командную строку, и объявлен он в одном месте:
# копии расходились бы молча, и починка одной не чинила бы остальные.
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
# Заявки открывают командой с подстановкой токена, и признак её не распознавал: значение
# бралось без пробелов, а путь в подстановке содержит пробел. Гард поставки на такой команде
# молчал, и молчание читалось как разрешение.
report "SC-AK-844 — подстановка в значении вызова не прячет" \
    "$(knows "$PR" 'GH_TOKEN=$(cat ~/.config/token) gh pr create --title x')" да
report "SC-AK-844 — значение в кавычках тоже" "$(knows "$PR" 'GH_TOKEN="a b" gh pr create')" да
report "SC-AK-844 — значение в одинарных кавычках тоже" "$(knows "$PR" "GH_TOKEN='a b' gh pr create")" да
report "SC-AK-844 — два присваивания подряд" \
    "$(knows "$PR" 'A=1 GH_TOKEN=$(cat f) gh pr create')" да
report "SC-AK-844 — та же форма за разделителем" \
    "$(knows "$PR" 'cd /tmp && GH_TOKEN=$(cat f) gh pr create')" да

# --- прежние случаи проходят как раньше ---------------------------------------------------------------
report "вызов без присваивания распознаётся" "$(knows "$PR" 'gh pr create --title x')" да
report "значение без пробелов распознаётся" "$(knows "$PR" 'GH_TOKEN=$TOKEN gh pr create')" да
report "вызов полным путём распознаётся" "$(knows "$PR" '/opt/homebrew/bin/gh pr create')" да
report "упоминание в кавычках вызовом не считается" \
    "$(knows "$PR" 'echo "GH_TOKEN=$(cat f) gh pr create"')" нет
report "поиск по дереву вызовом не считается" "$(knows "$PR" 'grep -rn "gh pr create" docs/')" нет
report "само присваивание вызовом не считается" "$(knows "$PR" 'GH_TOKEN=$(cat f)')" нет

# --- SC-AK-1116. Запускатель перед вызовом вызова не прячет -------------------------------------
# `timeout`, `nohup`, `env` и прочие берут команду своим доводом. Признак смотрел только на начало
# строки и такой вызов не видел: одна отправка с `timeout` прошла мимо всего набора проверок.
GP='git[[:space:]]+push'
report "SC-AK-1116 — timeout перед вызовом" "$(knows "$GP" 'timeout 1800 git push')" да
report "SC-AK-1116 — timeout с ключом" "$(knows "$GP" 'timeout -k 5 30s git push -u origin b')" да
report "SC-AK-1116 — nohup перед вызовом" "$(knows "$GP" 'nohup git push')" да
report "SC-AK-1116 — два запускателя подряд" "$(knows "$GP" 'nohup timeout 30 git push')" да
report "SC-AK-1116 — env с присваиванием" "$(knows "$PR" 'env GH_TOKEN=x gh pr create')" да
report "SC-AK-1116 — запускатель за разделителем" \
    "$(knows "$GP" 'cd /tmp && timeout 60 git push')" да
# Список закрытый: любое слово перед вызовом считало бы вызовом и упоминание.
report "SC-AK-1116 — печать строки вызовом не считается" "$(knows "$GP" 'echo git push')" нет
report "SC-AK-1116 — чужая команда перед вызовом не считается" \
    "$(knows "$GP" 'xargs -n1 git push')" нет

suite_result "признак вызова"
