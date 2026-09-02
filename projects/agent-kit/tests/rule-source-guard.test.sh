#!/usr/bin/env bash
# Сценарии гарда места правки: разложенная копия правится в источнике, а не на своём месте.
#
# Дерево фикстуры собирается своё: у гарда два ответа — «правь источник» и «правь надстройку», —
# и различает их наличие источника в дереве. Настоящее дерево знает один из двух.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард места правки"

TREE="$(mktemp -d)"
cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT

mkdir -p "$TREE/.claude/rt-kit/defaults" "$TREE/.claude/skills/probe" "$TREE/tools" \
    "$TREE/pkg/assets/rules" "$TREE/docs"
cp "$ASSETS/defaults/project.sh" "$TREE/.claude/rt-kit/defaults/project.sh"

# Разложенная копия правила: шапку отодвигает шапка самого правила, как в жизни.
printf '%s\n' '---' 'name: probe' 'kind: rule' '---' \
    '<!-- rt-kit v0.12.0 · rules/probe.md · abc123def456 · правится надстройкой, не здесь -->' \
    '# Правило' > "$TREE/.claude/skills/probe/SKILL.md"
# Разложенная проверка: шапку отодвигает строка запуска.
printf '%s\n' '#!/usr/bin/env node' \
    '// rt-kit v0.12.0 · checks/probe.mjs · 0123456789ab · правится надстройкой, не здесь' \
    'export const x = 1;' > "$TREE/tools/probe.mjs"
# Свой файл дерева: шапки нет.
printf '%s\n' '# Замысел' > "$TREE/docs/plan.md"
# Источник ресурса — он есть только у дерева, которое пакет и везёт.
printf '%s\n' '# Правило' > "$TREE/pkg/assets/rules/probe.md"

edit_in() {
    jq -n --arg f "$TREE/$1" --arg d "$TREE" \
        '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:$f},cwd:$d}'
}
cmd_in() {
    jq -n --arg c "$1" --arg d "$TREE" \
        '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},cwd:$d}'
}
run() {
    printf '%s' "$1" | CLAUDE_PROJECT_DIR="$TREE" "$HOOKS/rule-source-guard.sh" 2>/dev/null
}
decision() {
    local out
    out="$(run "$1")"
    [ -z "$out" ] && { printf 'PASS'; return 0; }
    printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // "deny"' 2>/dev/null
}
says() {
    run "$1" | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null | grep -cE "$2"
}

# Дерево-потребитель: источника у него нет, и адрес правки один — надстройка.
report "SC-AK-534 — правка разложенного правила отбивается" "$(decision "$(edit_in .claude/skills/probe/SKILL.md)")" deny
report "SC-AK-534 — отказ называет ресурс" "$(says "$(edit_in .claude/skills/probe/SKILL.md)" 'rules/probe\.md')" 1
report "SC-AK-534 — и адрес надстройки" "$(says "$(edit_in .claude/skills/probe/SKILL.md)" '\.claude/rt-kit/overrides/rules/probe\.md')" 1
report "SC-AK-534 — разложенная проверка судится наравне" "$(decision "$(edit_in tools/probe.mjs)")" deny
report "SC-AK-535 — свой файл дерева правится как обычно" "$(decision "$(edit_in docs/plan.md)")" PASS

# Та же правка командой оболочки: гард судит запись, а не инструмент.
report "SC-AK-536 — запись командой в разложенную копию отбивается" \
    "$(decision "$(cmd_in 'printf x > tools/probe.mjs')")" deny
report "SC-AK-536 — чтение разложенной копии проходит" \
    "$(decision "$(cmd_in 'cat tools/probe.mjs')")" PASS
# Снятие копии — законный приём: снятый файл раскладка кладёт заново, и так чинят копию,
# которую переписал форматтер.
report "SC-AK-537 — снятие разложенной копии проходит" \
    "$(decision "$(cmd_in 'rm -f tools/probe.mjs')")" PASS

# Правка тем же интерпретатором: путь стоит внутри кода, и снаружи команда выглядит запуском.
report "SC-AK-801 — правка разложенной копии телом интерпретатора отбивается" \
    "$(decision "$(cmd_in 'python3 - <<PY
import pathlib
pathlib.Path("tools/probe.mjs").write_text("x")
PY')")" deny
report "SC-AK-801 — то же доводом с кодом" \
    "$(decision "$(cmd_in 'node -e "require(\"fs\").writeFileSync(\"tools/probe.mjs\", \"x\")"')")" deny
# Цена признака названа прямо: интерпретатору, которому дали путь копии, верят на слово.
report "SC-AK-802 — интерпретатор без пути разложенного проходит" \
    "$(decision "$(cmd_in 'python3 - <<PY
print("docs/plan.md")
PY')")" PASS

# Запуск разложенной проверки рядом с чужим heredoc целью записи не считается: берётся тело,
# а не вся команда.
report "SC-AK-802 — запуск разложенного рядом с heredoc проходит" \
    "$(decision "$(cmd_in 'cat > docs/note.md <<EOF
text
EOF
node tools/probe.mjs')")" PASS

# SC-AK-834. Файл в конфликте пропускается наравне со снятым: разрешение конфликта содержания
# копии не меняет — раскладка кладёт её заново, — а отбитый здесь исполнитель остаётся с
# наполовину слитой веткой и без законного хода.
printf '%s\n' '---' 'name: probe' 'kind: rule' '---' \
    '<!-- rt-kit v0.12.0 · rules/probe.md · abc123def456 · правится надстройкой, не здесь -->' \
    '<<<<<<< HEAD' '# Правило своё' '=======' '# Правило чужое' '>>>>>>> origin/main' \
    > "$TREE/.claude/skills/probe/SKILL.md"
report "SC-AK-834 — правка копии с маркерами конфликта проходит" \
    "$(decision "$(edit_in .claude/skills/probe/SKILL.md)")" PASS
report "SC-AK-834 — и та же правка командой оболочки" \
    "$(decision "$(cmd_in 'printf x > .claude/skills/probe/SKILL.md')")" PASS
# Конфликт снят — гард судит копию прежним порядком.
printf '%s\n' '---' 'name: probe' 'kind: rule' '---' \
    '<!-- rt-kit v0.12.0 · rules/probe.md · abc123def456 · правится надстройкой, не здесь -->' \
    '# Правило' > "$TREE/.claude/skills/probe/SKILL.md"
report "SC-AK-834 — со снятым конфликтом отбой возвращается" \
    "$(decision "$(edit_in .claude/skills/probe/SKILL.md)")" deny

# Дерево пакета: источник есть, и отказ посылает в него, а не в надстройку.
printf '%s\n' 'rt_kit_sources_dir() { printf "pkg/assets"; }' >> "$TREE/.claude/rt-kit/defaults/project.sh"
report "SC-AK-538 — дерево с источником посылается в источник" \
    "$(says "$(edit_in .claude/skills/probe/SKILL.md)" 'pkg/assets/rules/probe\.md')" 1
report "SC-AK-538 — и надстройка названа законной формой" \
    "$(says "$(edit_in .claude/skills/probe/SKILL.md)" 'overrides/rules/probe\.md')" 1

# --- SC-AK-858 — тело интерпретатора без записи путей не отдаёт ---------------------------------
# Прежде из тела бралось всё путеподобное: команда, подключившая разложенный помощник и
# напечатавшая его ответ, отбивалась как правка этого помощника — за один заход трижды подряд.
READ_BODY='bash -c ". .claude/skills/probe/SKILL.md; printf ok"'
report "SC-AK-858 — чтение разложенного из тела проходит" \
    "$(decision "$(cmd_in "$READ_BODY")")" PASS

WRITE_BODY='python3 - <<PY
io.open(".claude/skills/probe/SKILL.md", "w").write("x")
PY'
report "SC-AK-858 — запись из тела по-прежнему отбита" \
    "$(decision "$(cmd_in "$WRITE_BODY")")" deny

# Путь и вызов записи стоят в теле разными строками — связать их нечем, поэтому тело, которое
# пишет, отдаёт свои пути целиком.
SPLIT_BODY='python3 - <<PY
p = ".claude/skills/probe/SKILL.md"
io.open(p, "w").write("x")
PY'
report "SC-AK-858 — путь строкой выше записи берётся" \
    "$(decision "$(cmd_in "$SPLIT_BODY")")" deny

# SC-AK-858. Заглушённый вывод признаком записи не бывает и внутри тела: команда с правкой
# одного файла и запуском проверки рядом отбивалась по пути этой проверки.
MUTED_BODY='perl -pi -e s/a/b/ docs/proba.md; node .claude/skills/probe/SKILL.md >/dev/null 2>&1'
report "SC-AK-858 — заглушённый вывод записью не делает" \
    "$(decision "$(cmd_in "$MUTED_BODY")")" PASS

# Отказ в пользу работы: сломанный гард не заклинивает работу.
exit_code_of() {
    printf '%s' "$2" | "$HOOKS/rule-source-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "чтение файла гарду безразлично" "$(jq -n --arg d "$TREE" '{session_id:"tests",tool_name:"Read",tool_input:{file_path:"x"},cwd:$d}')"

suite_result "гард места правки"
