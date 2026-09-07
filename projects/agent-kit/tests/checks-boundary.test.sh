#!/usr/bin/env bash
# Сценарии проверки границы пакета: два вопроса к ресурсу, отправляющая сторона, перечень
# отменяемого и место проверки в гейте пуша.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: граница пакета"

# --- граница пакета ---------------------------------------------------------------------------
#
# Фикстура — дерево с ресурсами пакета: проверка обходит то, что везёт раскладка, и ничего,
# кроме файлов, не спрашивает.

TREE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
BOUND_TREE="$(mktemp -d)"
mkdir -p "$BOUND_TREE/tools" "$BOUND_TREE/kit/assets/rules" "$BOUND_TREE/kit/assets/patterns" "$BOUND_TREE/kit/assets/commands" "$BOUND_TREE/kit/src/lib"
cp "$TREE_ROOT/tools/check-boundary.mjs" "$BOUND_TREE/tools/"

# Что напечатала проверка границы. Она отвечает перечнем, а не кодом на каждый ресурс.
bound_says() {
    (cd "$BOUND_TREE" && node tools/check-boundary.mjs kit 2>&1) | grep -cE "$1"
}

# Код возврата: ненулевой, пока в пакете лежит ресурс не для везения.
bound_code() {
    (cd "$BOUND_TREE" && node tools/check-boundary.mjs kit >/dev/null 2>&1)
    echo $?
}

# SC-AK-510 — отправляющая сторона проверку проходит
printf '/** Форма груза: то, что уезжает с дерева в приём. */\nexport const V = "1";\n' > "$BOUND_TREE/kit/src/lib/cargo.ts"
printf -- '---\nname: feedback\n---\n\nСлово о слое правил ложится блоком в файл предложений.\n' > "$BOUND_TREE/kit/assets/commands/feedback.md"
report "SC-AK-510 — отправляющая сторона молчит" "$(bound_says 'cargo\.ts|feedback\.md')" 0
report "SC-AK-510 — код возврата нулевой" "$(bound_code)" 0

# SC-AK-508 — ресурс, заговоривший о приёме, отбивается
printf -- '---\nname: cargo-triage\nkind: rule\n---\n\nГруз читается: админка приёма показывает столбец состояния.\n' > "$BOUND_TREE/kit/assets/rules/cargo-triage.md"
report "SC-AK-508 — ресурс о приёме назван" "$(bound_says 'cargo-triage\.md .* there is no subject')" 1
report "SC-AK-508 — код возврата ненулевой" "$(bound_code)" 1

# SC-AK-509 — ресурс, объявивший себя работой дерева пакета, отбивается
printf -- '---\nname: digest\n---\n\nЗовётся **в репозитории самого пакета**, а не в дереве, где он стоит.\n' > "$BOUND_TREE/kit/assets/commands/digest.md"
report "SC-AK-509 — ресурс дерева пакета назван" "$(bound_says 'digest\.md .* there is nobody to call it')" 1

# SC-AK-508 — паттерн наследует судьбу своего правила: своих оговорок у него не бывает
printf -- '---\nname: cargo-triage-mark\nkind: pattern\nrule: cargo-triage\n---\n\nГотовые вызовы.\n' > "$BOUND_TREE/kit/assets/patterns/cargo-triage-mark.md"
report "SC-AK-508 — паттерн правила не для везения назван" "$(bound_says 'cargo-triage-mark\.md .* a pattern of the rule')" 1

# SC-AK-511 — перечень отменяемого границу не закрывает
printf '{\n    "skip": [\n        "rules/cargo-triage.md"\n    ]\n}\n' > "$BOUND_TREE/rt-kit.json"
report "SC-AK-511 — ресурс в перечне всё равно назван" "$(bound_says 'cargo-triage\.md .* there is no subject')" 1
report "SC-AK-511 — код возврата остался ненулевым" "$(bound_code)" 1

# SC-AK-507 — известный долг держится перечнем, а не молчанием проверки
mkdir -p "$BOUND_TREE/tools"
printf '{\n    "accepted": {\n        "kit/assets/rules/cargo-triage.md": "переезжает своей задачей"\n    }\n}\n' > "$BOUND_TREE/tools/boundary-debt.json"
report "SC-AK-507 — долг назван строкой долга" "$(bound_says 'known debt')" 1
report "SC-AK-507 — ресурс не из перечня всё равно краснеет" "$(bound_code)" 1
rm "$BOUND_TREE/tools/boundary-debt.json"

# SC-AK-506 — проверка входит в гейт пуша: шаг конвейера и его местная команда сходятся
gate_step() { grep -c 'name: Package boundary' "$TREE_ROOT/.github/workflows/ci.yml"; }
gate_local() { grep -c '"Package boundary": "node tools/check-boundary.mjs"' "$TREE_ROOT/.claude/rt-kit/checks.json"; }
report "SC-AK-506 — шаг стоит в конвейере" "$(gate_step)" 1
report "SC-AK-506 — у шага есть местная команда" "$(gate_local)" 1

# SC-AK-505 — своё правило дерева гейт требует наравне с пакетным
#
# Карта гейта — своя, дерева: правило разбора груза пакет не везёт вовсе, а правку команды
# отметки без него не кладут — порядок разбора знают раньше правки.
# Судится тот файл, который в дереве есть: проба на снятый перечень долга ждала бы правила от
# карты гейта, а карта потеряла его вместе с самим перечнем — и краснела бы вечно.
own_rule() {
    (CLAUDE_PROJECT_DIR="$TREE_ROOT" . "$TREE_ROOT/.claude/rt-kit/gate-map.sh"; skill_for edit "$1" '') | grep -cE 'cargo-triage'
}
report "SC-AK-505 — правка команды отметки требует своего правила" "$(own_rule "$TREE_ROOT/tools/cargo-mark.mjs")" 1
report "SC-AK-505 — правило лежит своим, без шапки раскладки" \
    "$(grep -c 'rt-kit v' "$TREE_ROOT/.claude/skills/cargo-triage/SKILL.md")" 0

rm -rf "$BOUND_TREE"

# Итог набора и его код возврата. Без этой строки набор кончался уборкой дерева — то есть всегда
# нулём: провалившаяся проверка печаталась строкой и на цвет прогона не влияла никак.
suite_result "проверки: граница пакета"

