#!/usr/bin/env bash
# Сценарии гарда затирания надстройки: надстройка правится по разделу, а не кладётся целиком.
#
# Дерево фикстуры собирается своё: гард судит непустоту надстройки и считает её разделы, а
# настоящее дерево держит их ровно столько, сколько нажило.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард затирания надстройки"

TREE="$(mktemp -d)"
cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT

mkdir -p "$TREE/.claude/rt-kit/overrides/rules" "$TREE/docs"

# Нажитая надстройка: три раздела, дописанных разными ветками.
printf '%s\n' '## Как это называется здесь' 'Своё имя.' '' \
    '## Ловушки' 'Своя ловушка.' '' \
    '## Чего из закона здесь нет' 'Своё исключение.' > "$TREE/.claude/rt-kit/overrides/rules/probe.md"
# Пустая надстройка: затирать в ней нечего.
: > "$TREE/.claude/rt-kit/overrides/rules/empty.md"
# Свой файл дерева: надстройкой не является.
printf '%s\n' '# Замысел' > "$TREE/docs/plan.md"

write_in() {
    jq -n --arg f "$TREE/$1" --arg d "$TREE" \
        '{session_id:"tests",tool_name:"Write",tool_input:{file_path:$f},cwd:$d}'
}
edit_in() {
    jq -n --arg f "$TREE/$1" --arg d "$TREE" \
        '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:$f},cwd:$d}'
}
cmd_in() {
    jq -n --arg c "$1" --arg d "$TREE" \
        '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},cwd:$d}'
}
run() {
    printf '%s' "$1" | CLAUDE_PROJECT_DIR="$TREE" "$HOOKS/override-write-guard.sh" 2>/dev/null
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

report "SC-AK-539 — запись поверх нажитой надстройки отбивается" \
    "$(decision "$(write_in .claude/rt-kit/overrides/rules/probe.md)")" deny
report "SC-AK-539 — отказ называет размер того, что затрут" \
    "$(says "$(write_in .claude/rt-kit/overrides/rules/probe.md)" '8 lines')" 1
report "SC-AK-539 — и число разделов" \
    "$(says "$(write_in .claude/rt-kit/overrides/rules/probe.md)" 'sections «## » — 3')" 1
report "SC-AK-539 — и говорит про слияние по разделу" \
    "$(says "$(write_in .claude/rt-kit/overrides/rules/probe.md)" 'merges with the package resource by the heading')" 1

report "SC-AK-540 — правка надстройки по месту проходит" \
    "$(decision "$(edit_in .claude/rt-kit/overrides/rules/probe.md)")" PASS
report "SC-AK-540 — пустая надстройка кладётся целиком" \
    "$(decision "$(write_in .claude/rt-kit/overrides/rules/empty.md)")" PASS
report "SC-AK-540 — надстройки ещё нет — запись проходит" \
    "$(decision "$(write_in .claude/rt-kit/overrides/rules/new.md)")" PASS
report "SC-AK-540 — свой файл дерева гарду безразличен" \
    "$(decision "$(write_in docs/plan.md)")" PASS

# Та же запись командой оболочки: гард судит затирание, а не инструмент.
report "SC-AK-541 — перенаправление поверх надстройки отбивается" \
    "$(decision "$(cmd_in 'printf x > .claude/rt-kit/overrides/rules/probe.md')")" deny
report "SC-AK-541 — копирование поверх надстройки отбивается" \
    "$(decision "$(cmd_in 'cp new.md .claude/rt-kit/overrides/rules/probe.md')")" deny
report "SC-AK-541 — отдача в надстройку через tee отбивается" \
    "$(decision "$(cmd_in 'printf x | tee .claude/rt-kit/overrides/rules/probe.md')")" deny
report "SC-AK-541 — '>' с чертой отбивается" \
    "$(decision "$(cmd_in 'printf x >| .claude/rt-kit/overrides/rules/probe.md')")" deny
report "SC-AK-541 — tee после -- отбивается" \
    "$(decision "$(cmd_in 'printf x | tee -- .claude/rt-kit/overrides/rules/probe.md')")" deny
report "SC-AK-541 — копия в папку с косой чертой отбивается" \
    "$(decision "$(cmd_in 'cp /tmp/probe.md .claude/rt-kit/overrides/rules/')")" deny
report "SC-AK-541 — копия в папку без косой черты отбивается" \
    "$(decision "$(cmd_in "cp /tmp/probe.md $TREE/.claude/rt-kit/overrides/rules")")" deny
report "SC-AK-541 — запись внутри bash -c отбивается" \
    "$(decision "$(cmd_in "bash -c 'printf x > .claude/rt-kit/overrides/rules/probe.md'")")" deny
report "SC-AK-541 — запись кодом отбивается" \
    "$(decision "$(cmd_in "python3 -c \"open('.claude/rt-kit/overrides/rules/probe.md','w').write('x')\"")")" deny
ide_in() { cmd_in "$1" | jq '.tool_name = "mcp__webstorm__execute_tool"'; }
report "SC-AK-541 — запись терминалом среды отбивается" \
    "$(decision "$(ide_in 'execute_terminal_command --command "printf x > .claude/rt-kit/overrides/rules/probe.md"')")" deny
report "SC-AK-541 — запись терминалом среды с флагами после команды отбивается" \
    "$(decision "$(ide_in 'execute_terminal_command --command "printf x > .claude/rt-kit/overrides/rules/probe.md" --executeInShell true')")" deny
report "SC-AK-541 — запись внутри bash -c после cd назад отбивается" \
    "$(decision "$(cmd_in "bash -c 'cd .claude/hooks; cd ../..; printf x > .claude/rt-kit/overrides/rules/probe.md'")")" deny
report "SC-AK-541 — запись по пути назад внутри bash -c отбивается" \
    "$(decision "$(cmd_in "bash -c 'cd sub; printf x > ../.claude/rt-kit/overrides/rules/probe.md'")")" deny
report "SC-AK-541 — копия из папки выше внутри bash -c отбивается" \
    "$(decision "$(cmd_in "bash -c 'cd .claude/rt-kit/overrides; cp ../../../docs/n.md rules/probe.md'")")" deny
report "SC-AK-541 — путь от pwd после cd назад отбивается" \
    "$(decision "$(cmd_in 'cd sub && cd .. && printf x > "$(pwd)/.claude/rt-kit/overrides/rules/probe.md"')")" deny
report "SC-AK-541 — папка, данная переменной через себя, отбивается" \
    "$(decision "$(cmd_in "bash -c 'D=.claude; D=\$D/rt-kit; cd \$D; printf x > overrides/rules/probe.md'")")" deny
report "SC-AK-541 — запись после cd в корень по полному пути отбивается" \
    "$(decision "$(cmd_in "cd $TREE && printf x > .claude/rt-kit/overrides/rules/probe.md")")" deny
mkdir -p "$TREE/.claude/worktrees/w/.claude/rt-kit/overrides/rules"
cp "$TREE/.claude/rt-kit/overrides/rules/probe.md" "$TREE/.claude/worktrees/w/.claude/rt-kit/overrides/rules/"
report "SC-AK-541 — запись в рабочей копии внутри дерева отбивается" \
    "$(decision "$(cmd_in "printf x > $TREE/.claude/worktrees/w/.claude/rt-kit/overrides/rules/probe.md")")" deny
report "SC-AK-541 — копия терминалом среды отбивается" \
    "$(decision "$(ide_in 'execute_terminal_command --command=cp /tmp/x .claude/rt-kit/overrides/rules/probe.md')")" deny

# Дописывание ничего не уносит: раздел встаёт в конец, прежние остаются на месте.
report "SC-AK-542 — дописывание в конец проходит" \
    "$(decision "$(cmd_in 'printf x >> .claude/rt-kit/overrides/rules/probe.md')")" PASS
report "SC-AK-542 — дописывание через tee -a проходит" \
    "$(decision "$(cmd_in 'printf x | tee -a .claude/rt-kit/overrides/rules/probe.md')")" PASS
report "SC-AK-542 — дописывание кодом проходит" \
    "$(decision "$(cmd_in "python3 -c \"open('.claude/rt-kit/overrides/rules/probe.md','a').write('x')\"")")" PASS
report "SC-AK-542 — правка на месте кодом проходит" \
    "$(decision "$(cmd_in "python3 -c \"p='.claude/rt-kit/overrides/rules/probe.md'; t=open(p).read(); open(p,'w').write(t + 'x')\"")")" PASS
report "SC-AK-542 — копия наружу из папки ниже проходит" \
    "$(decision "$(cmd_in "bash -c 'cd sub/x; cp ../../.claude/rt-kit/overrides/rules/probe.md ../../out.md'")")" PASS
report "SC-AK-542 — запись внутри bash -c мимо дерева проходит" \
    "$(decision "$(cmd_in "bash -c 'cd ../other; printf x > .claude/rt-kit/overrides/rules/probe.md'")")" PASS
report "SC-AK-542 — чтение терминалом среды проходит" \
    "$(decision "$(ide_in 'execute_terminal_command --command "cat .claude/rt-kit/overrides/rules/probe.md"')")" PASS
report "SC-AK-542 — путь в тексте сообщения проходит" \
    "$(decision "$(cmd_in "git commit -m 'x > .claude/rt-kit/overrides/rules/probe.md'")")" PASS
report "SC-AK-542 — чтение надстройки проходит" \
    "$(decision "$(cmd_in 'cat .claude/rt-kit/overrides/rules/probe.md')")" PASS

# Отказ в пользу работы: сломанный гард не заклинивает работу.
exit_code_of() {
    printf '%s' "$2" | "$HOOKS/override-write-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "правка по месту гарду безразлична" "$(jq -n --arg d "$TREE" '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:"x"},cwd:$d}')"

# Ход, названный отказом, — правка раздела надстройки, и её держит гейт, пока её правило не
# загружено: отказ называет загрузку правила в том же тексте.
mkdir -p "$TREE/.claude/skills/spec-driven"
printf -- '---\nname: spec-driven\nkind: rule\n---\n' > "$TREE/.claude/skills/spec-driven/SKILL.md"
# Правило длиннее предела хозяина: гейт не кладёт его в заход сам и держит ход до загрузки.
printf '%010000d\n' 0 >> "$TREE/.claude/skills/spec-driven/SKILL.md"
gate_session_reset
report "правку раздела держит гейт — отказ называет правило" \
    "$(run "$(write_in .claude/rt-kit/overrides/rules/probe.md)" | jq -r '.hookSpecificOutput.permissionDecisionReason' | grep -c 'load the rule «spec-driven» by the tool Skill first')" 1
gate_session_load spec-driven
report "правило загружено — ход назван один" \
    "$(run "$(write_in .claude/rt-kit/overrides/rules/probe.md)" | jq -r '.hookSpecificOutput.permissionDecisionReason' | grep -c 'held by the rules gate')" 0
gate_session_cleanup
unset TMPDIR

suite_result "гард затирания надстройки"
