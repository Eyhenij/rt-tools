#!/usr/bin/env bash
# Сценарии срока описания прошлого: чистка снимает по сроку, проверка требует с запасом.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "срок описания прошлого"

TREE="$(fixture_repo main)"
cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT

mkdir -p "$TREE/tools" "$TREE/.claude/rt-kit" "$TREE/docs/archive"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/archive-age.mjs" "$CHECKS/check-archive-age.mjs" \
    "$CHECKS/archive-prune.mjs" "$TREE/tools/"
printf '{ "archiveRetentionDays": 7 }\n' > "$TREE/.claude/rt-kit/checks.json"

# Запись с коммитом на названное число часов назад: возраст считается по дате коммита.
record_aged() {
    local name="$1" hours="$2" stamp
    stamp="$(python3 -c "import datetime; print((datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=$hours)).strftime('%Y-%m-%dT%H:%M:%S +0000'))")"
    printf '# %s\n' "$name" > "$TREE/docs/archive/$name.md"
    git -C "$TREE" add -A 2>/dev/null
    GIT_AUTHOR_DATE="$stamp" GIT_COMMITTER_DATE="$stamp" \
        git -C "$TREE" -c user.email=p@p -c user.name=p -c commit.gpgsign=false \
        commit -q -m "запись $name" 2>/dev/null
}

check_says() {
    local label="$1" pattern="$2" got
    if node "$TREE/tools/check-archive-age.mjs" 2>&1 | grep -qE "$pattern"; then got="есть"; else got="нет"; fi
    report "$label" "$got" "$3"
}

prune_says() {
    local label="$1" pattern="$2" got
    if node "$TREE/tools/archive-prune.mjs" 2>&1 | grep -qE "$pattern"; then got="есть"; else got="нет"; fi
    report "$label" "$got" "$3"
}

# Семь суток и час: срок вышел, а запас проверки — нет.
record_aged RT-1-week $((7 * 24 + 1))
prune_says "SC-AK-869 — запись в 7 суток и час чистка снимает" 'RT-1-week' "есть"
check_says "SC-AK-869 — а проверка о ней молчит: запас в сутки" 'RT-1-week' "нет"
check_says "SC-AK-869 — проверка при этом зелёная" 'none outstood' "есть"

# Восемь суток и час: вышел и запас.
record_aged RT-2-late $((8 * 24 + 1))
check_says "SC-AK-870 — запись в 8 суток и час проверка называет" 'RT-2-late.*8 days at a term of 7 and a grace of 1' "есть"
check_says "SC-AK-870 — семисуточную по-прежнему нет" 'RT-1-week' "нет"
prune_says "SC-AK-870 — чистка снимает обе" '2 of 2 outstood' "есть"

# Свежая запись не трогается ни той, ни другой стороной.
record_aged RT-3-fresh 1
check_says "SC-AK-871 — свежую проверка не называет" 'RT-3-fresh' "нет"
prune_says "SC-AK-871 — и чистка не снимает" 'RT-3-fresh' "нет"

suite_result "срок описания прошлого"
