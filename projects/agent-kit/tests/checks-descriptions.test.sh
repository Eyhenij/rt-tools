#!/usr/bin/env bash
# Сценарии проверки длины описаний: предел, скил без описания и принятый долг.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: длина описаний"

TREE="$(mktemp -d)"
mkdir -p "$TREE/tools" "$TREE/.claude/rt-kit"
cp "$CHECKS/check-descriptions.mjs" "$TREE/tools/"

cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT

# Скил с описанием заданной длины: имя, число знаков. Описание набирается одной буквой —
# проверка считает знаки, а не слова.
skill() {
    mkdir -p "$TREE/.claude/skills/$1"
    {
        printf -- '---\n'
        printf 'name: %s\n' "$1"
        printf 'description: '
        printf 'я%.0s' $(seq 1 "$2")
        printf '\n---\n\n# %s\n' "$1"
    } > "$TREE/.claude/skills/$1/SKILL.md"
}

# Скил без описания вовсе: у проверки для него нет предмета.
bare() {
    mkdir -p "$TREE/.claude/skills/$1"
    printf -- '---\nname: %s\n---\n\n# %s\n' "$1" "$1" > "$TREE/.claude/skills/$1/SKILL.md"
}

run() { (cd "$TREE" && node tools/check-descriptions.mjs 2>&1); }

skill длинное 400
out="$(run)"
code=$?

case "$out" in
    *'длинное: 400 знаков'*) report 'SC-AK-630 — описание длиннее предела названо поимённо' 'названо' 'названо' ;;
    *) report 'SC-AK-630 — описание длиннее предела названо поимённо' 'молчит' 'названо' ;;
esac

skill короткое 200
out="$(run)"

case "$out" in
    *'короткое'*) report 'SC-AK-631 — описание в пределе проверку не тревожит' 'названо' 'молчит' ;;
    *) report 'SC-AK-631 — описание в пределе проверку не тревожит' 'молчит' 'молчит' ;;
esac

bare безописания
out="$(run)"

case "$out" in
    *'безописания'*) report 'SC-AK-633 — скил без описания проверке не интересен' 'названо' 'молчит' ;;
    *) report 'SC-AK-633 — скил без описания проверке не интересен' 'молчит' 'молчит' ;;
esac

# Долг снимает отказ, но строку о нём печатает: молчаливое превышение и осознанное
# выглядели бы одинаково.
printf '{"длинное": "правило перестанут находить по теме"}' > "$TREE/.claude/rt-kit/description-debt.json"
out="$(run)"
code=$?

if [ "$code" -eq 0 ] && [ "${out#*долг длинное}" != "$out" ]; then
    report 'SC-AK-632 — принятый долг проверку не роняет' 'ноль и строка долга' 'ноль и строка долга'
else
    report 'SC-AK-632 — принятый долг проверку не роняет' "код $code" 'ноль и строка долга'
fi

suite_result "проверки: длина описаний"
