#!/usr/bin/env bash
# Сценарии читателей хостинга на настоящих ответах хостинга, записанных под токеном машинной учётки.
#
# 13.11.2026 правка аудита очереди прошла свой набор и упала на настоящем хостинге: токену машинной
# учётки не дано право читать поля ревьюеров. Двойник хостинга в наборах отвечал на любой токен.
# Здесь двойник проигрывает записанные ответы (`real-data/replay-gh.mjs` над `fixtures/real-host`,
# запись — `real-data/record-host.sh`) и отвечает по виду токена, как хостинг: вызов под другим
# токеном получает записанный отказ прав. Читатели — аудит очереди, таблица эпика, последний прогон
# главной ветки — идут на этих ответах и печатают то же, что напечатали на настоящем хостинге.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
. "$(dirname "${BASH_SOURCE[0]}")/lib-board.sh"

echo "читатели хостинга на настоящих ответах"
# Every case is printed: the output names what was replayed under which token, not only what failed.
VERBOSE=1

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
REAL="$HERE/fixtures/real-host"
REPLAY="$(board_replay_bin "$REAL")"
FAKE_TOKEN="$BOARD_TREE/machine-token"
printf 'machine-token-of-the-suite' > "$FAKE_TOKEN"
# The readers of the tree sign their calls with the token its settings name, a path under the home
# directory. The suite gives them a home of its own that holds the token of the suite, and the replay
# knows that token as the machine one: the suite does not read the token of the machine it runs on.
SUITE_HOME="$BOARD_TREE/home"
mkdir -p "$SUITE_HOME/.config"
cp "$FAKE_TOKEN" "$SUITE_HOME/.config/rt-tools-bot-token"
REAL_HOME="$HOME"
trap 'rm -rf "$BOARD_TREE"' EXIT

replay() { GH_TOKEN="$1" REPLAY_TOKEN_FILE="$FAKE_TOKEN" "$REPLAY" "${@:2}"; }
# A runner that forces colours — nx does — makes node paint a stack trace; the outputs were recorded
# without colours, and the readers run without them too.
reader() {
    (cd "$ROOT" && env -u FORCE_COLOR NO_COLOR=1 HOME="$SUITE_HOME" GH_BIN="$REPLAY" REPLAY_TOKEN_FILE="$FAKE_TOKEN" node "$@" 2>&1 \
        | sed -e "s#$REAL_HOME#~#g" -e "s#$SUITE_HOME#~#g")
}
# A stack trace names the tree by its absolute path, which differs from machine to machine; both sides
# are compared with the path of the tree replaced by a mark.
tree_marked() { sed -E 's#[^ (]*/((tools|projects|node_modules)/)#<tree>/\1#g'; }
same_as() {
    if [ "$(printf '%s' "$1" | tree_marked)" = "$(tree_marked < "$2")" ]; then printf 'same'; else printf 'differs'; fi
}

# --- the machine token: whose eyes, what rights ---------------------------------------------------
report "SC-AK-1599 — token: записанный логин машинного токена — rt-tools-dev" \
    "$(replay machine-token-of-the-suite api user --jq '{login: .login}')" '{"login":"rt-tools-dev"}'
report "SC-AK-1599 — token: чтение поля ревьюеров под машинным токеном получает отказ прав" \
    "$(replay machine-token-of-the-suite pr list --state open --limit 1 --json number,reviewRequests 2>&1 | grep -c 'read:org')" "1"
report "SC-AK-1599 — token: вызов, записанный под машинным токеном, без токена получает отказ" \
    "$(replay '' api user --jq '{login: .login}' > /dev/null 2>&1; printf '%s' "$?")" "1"
report "SC-AK-1599 — token: под машинным токеном тот же вызов проходит" \
    "$(replay machine-token-of-the-suite api user --jq '{login: .login}' > /dev/null 2>&1; printf '%s' "$?")" "0"

# --- the readers of the tree on the recorded answers ----------------------------------------------
# The state column of the epic table — «идёт», «влито», «впереди» — is read from the local history and
# the current branch, not from the hosting: the recorded answers do not hold it, and it moves with every
# merge into the epic branch. Both sides are compared with it marked; the hosting column stays judged.
state_marked() { sed -E 's/^(\| [0-9]+ \|[^|]*\|[^|]*\|)[^|]*\|/\1 <state> |/'; }
report "SC-AK-1600 — таблица эпика на настоящих ответах — как на хостинге" \
    "$(same_as "$(reader tools/epic-table.mjs 3302 | state_marked)" <(state_marked < "$REAL/.epic-table.txt"))" "same"
report "SC-AK-1600 — последний прогон главной на настоящих ответах — как на хостинге" \
    "$(same_as "$(reader tools/main-run.mjs)" "$REAL/.main-run.txt")" "same"
report "SC-AK-1600 — аудит очереди на настоящих ответах — как на хостинге" \
    "$(same_as "$(reader tools/check-board.mjs)" "$REAL/.audit.txt")" "same"
# The audit fell on the real host: the comparison of the deployed head with the main branch got
# HTTP 422 «diff is taking too long», and nothing caught it. A finding of RT-3277 — the case names it.
report "SC-AK-1600 — аудит очереди падает на ответе 422 сравнения веток — находка RT-3277" \
    "$(grep -c 'diff is taking too long' "$REAL/.audit.txt")" "2"

# --- the engine of the task flow: the PRs of a branch through `host.mjs` -----------------------------
report "SC-AK-1603 — host.mjs: запросы PR ветки и влитых PR на настоящих ответах — как на хостинге" \
    "$(same_as "$(reader "$HERE/real-data/host-read.mjs" "$ROOT" RT-3355-hooks-read-table)" "$REAL/.host.txt")" "same"
# The board module reads a PR without the machine token on purpose: the review fields need rights the
# machine account was not given. The two reads of `host.mjs` are the only unsigned answers recorded.
report "SC-AK-1603 — host.mjs: PR читаются без машинного токена — два неподписанных ответа" \
    "$(jq -r 'select(.token == "none") | .args[1]' "$REAL"/*.json | tr '\n' ' ')" "list list "

suite_result "читатели хостинга на настоящих ответах"
