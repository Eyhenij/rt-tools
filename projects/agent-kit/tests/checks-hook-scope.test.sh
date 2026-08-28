#!/usr/bin/env bash
# Сценарии сверки объявления гарда с тем, на что ветвится его тело.
#
# Проверяется механика: где ищутся имена инструментов, что образец объявления считается
# покрывающим и когда сверять нечего. Гарды для сверки собираются здесь же — свои проверка судила
# бы вместо фикстуры.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: область гарда"

TREE="$(mktemp -d)"
mkdir -p "$TREE/tools" "$TREE/.claude/hooks"
cp "$CHECKS/check-hook-scope.mjs" "$TREE/tools/"

cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT

# Гард фикстуры: объявление первым доводом, тело — остальными.
guard() {
    local name="$1" declared="$2"
    shift 2
    {
        printf '#!/usr/bin/env bash\n'
        printf '# rt-hook: %s\n' "$declared"
        for line in "$@"; do
            printf '%s\n' "$line"
        done
    } > "$TREE/.claude/hooks/$name"
}

said() { ( cd "$TREE" && node tools/check-hook-scope.mjs 2>&1 ); }
code() { ( cd "$TREE" && node tools/check-hook-scope.mjs >/dev/null 2>&1; echo $? ); }

# SC-AK-769. Ветка тела, которой нет в объявлении, называется расхождением.
guard probe.sh 'PreToolUse Bash' \
    'case "$tool" in' \
    '    Bash | mcp__webstorm__execute_tool)' \
    '        judge ;;' \
    'esac'
report "SC-AK-769 — незаявленная ветка отбивает" "$(code)" 1
case "$(said)" in
    *mcp__webstorm__execute_tool*) report "SC-AK-769 — расхождение названо именем инструмента" да да ;;
    *) report "SC-AK-769 — расхождение названо именем инструмента" "$(said)" да ;;
esac

# То же объявление, дополненное до тела, расхождением не считается.
guard probe.sh 'PreToolUse Bash|mcp__webstorm__execute_tool' \
    'case "$tool" in' \
    '    Bash | mcp__webstorm__execute_tool)' \
    '        judge ;;' \
    'esac'
report "SC-AK-769 — объявление по телу проходит" "$(code)" 0

# SC-AK-770. Образец объявления читается как выражение, а не как список имён.
guard probe.sh 'PreToolUse mcp__claude-in-chrome__.*' \
    'case "$tool" in' \
    '    mcp__claude-in-chrome__navigate)' \
    '        judge ;;' \
    'esac'
report "SC-AK-770 — образец со звёздочкой имя покрывает" "$(code)" 0

# Образец, который не разобрать, покрытием не считается: под ним не совпадёт ни одно имя, а
# выглядит объявление написанным.
guard probe.sh 'PreToolUse Bash|(' \
    'case "$tool" in' \
    '    Bash)' \
    '        judge ;;' \
    'esac'
report "SC-AK-770 — неразбираемый образец отбивает" "$(code)" 1

# SC-AK-771. Судится ветвление, а не упоминание: имя инструмента стоит и в тексте отказа.
guard probe.sh 'PreToolUse Bash' \
    'case "$tool" in' \
    '    Bash)' \
    '        echo "води браузер расширением mcp__claude-in-chrome__select_browser" ;;' \
    'esac' \
    '# соседний гард судит mcp__webstorm__execute_tool — это комментарий, а не ветка'
report "SC-AK-771 — упоминание в тексте и комментарии не судится" "$(code)" 0

# Ветка «всё остальное» именем инструмента не бывает.
guard probe.sh 'PreToolUse Bash' \
    'case "$tool" in' \
    '    Bash) judge ;;' \
    '    *) exit 0 ;;' \
    'esac'
report "SC-AK-771 — ветка «всё остальное» расхождением не бывает" "$(code)" 0

# Ветвление по другому предмету — не про инструменты: имена команд под ту же форму подпадают.
guard probe.sh 'PreToolUse Bash' \
    'case "$cmd" in' \
    '    push | commit) judge ;;' \
    'esac'
report "SC-AK-771 — case по другому предмету не судится" "$(code)" 0

# SC-AK-772. Файл без объявления гардом не считается: помощники его не несут намеренно.
rm -f "$TREE/.claude/hooks/probe.sh"
printf '#!/usr/bin/env bash\ncase "$tool" in\n    mcp__чужое) judge ;;\nesac\n' > "$TREE/.claude/hooks/helper.sh"
report "SC-AK-772 — помощник без объявления не судится" "$(code)" 0

# Каталога хуков нет — сверять нечего.
mv "$TREE/.claude/hooks" "$TREE/.claude/hooks-off"
report "SC-AK-772 — без каталога хуков проверка молчит" "$(code)" 0

suite_result "область гарда"
