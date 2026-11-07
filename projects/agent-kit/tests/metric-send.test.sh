#!/usr/bin/env bash
# Запуск отправки без команды: что делает запись наблюдения, начало и конец сессии, и что отказано.
# Настоящая команда пакета заменена записью вызова: здесь судится запуск, а не сама отправка.
#
# Сценарии договорённости: SC-AK-1281, SC-AK-1282, SC-AK-1283, SC-AK-1288, SC-AK-1289.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "ЗАПУСК ОТПРАВКИ"

# Дерево с адресом приёма и командой, которая пишет, чем её позвали.
fixture_send_tree() {
    local dir config="${1:-}"
    dir="$(fixture_repo_branched main work)"
    mkdir -p "$dir/.claude/rt-kit/observations/.marks" "$dir/node_modules/.bin"
    printf '{"intake":"https://intake.invalid"%s}\n' "$config" > "$dir/.claude/rt-kit.json"
    cat > "$dir/node_modules/.bin/agent-kit" <<EOF
#!/usr/bin/env bash
printf '%s\n' "\$*" >> "$dir/called"
EOF
    chmod +x "$dir/node_modules/.bin/agent-kit"
    printf '%s' "$dir"
}

note_in() {
    CLAUDE_PROJECT_DIR="$1" bash -c '. "$1/observe.sh"; rt_note guard-deny res=one sid=s' _ "$HOOKS"
}

# Вызов пишется отдельным процессом: подождать его строку, но не дольше двух секунд.
called_in() {
    local i
    for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
        [ -s "$1/called" ] && break
        perl -e 'select(undef,undef,undef,0.1)'
    done
    cat "$1/called" 2>/dev/null
}

event_in() {
    printf '{"hook_event_name":"%s"}' "$2" | CLAUDE_PROJECT_DIR="$1" "$HOOKS/metric-send-start.sh" 2>/dev/null
}

tree="$(fixture_send_tree)"
note_in "$tree"
got="$(called_in "$tree")"
case "$got" in *"send --quiet --root $tree"*) got=запущена ;; esac
report "SC-AK-1283 — запись наблюдения запускает тихую отправку" "$got" запущена

tree="$(fixture_send_tree)"
touch "$tree/.claude/rt-kit/observations/.marks/send.json"
note_in "$tree"
perl -e 'select(undef,undef,undef,0.3)'
report "SC-AK-1283 — свежая метка не запускает второй процесс" "$(cat "$tree/called" 2>/dev/null)" ""

tree="$(fixture_send_tree)"
touch "$tree/.claude/rt-kit/observations/.marks/send.json"
event_in "$tree" SessionEnd
got="$(called_in "$tree")"
case "$got" in *--session-end*) got=запущена ;; esac
report "SC-AK-1283 — конец сессии шлёт и при свежей метке" "$got" запущена

tree="$(fixture_send_tree)"
event_in "$tree" SessionStart
got="$(called_in "$tree")"
case "$got" in *"send --quiet"*) got=запущена ;; esac
report "SC-AK-1287 — начало сессии шлёт то, что оставила мёртвая" "$got" запущена

tree="$(fixture_send_tree)"
event_in "$tree" Stop
got="$(called_in "$tree")"
case "$got" in *"send --quiet"*) got=запущена ;; esac
report "конец хода запускает отправку" "$got" запущена

tree="$(fixture_send_tree ',"send":false')"
note_in "$tree"
event_in "$tree" SessionEnd
perl -e 'select(undef,undef,undef,0.3)'
report "SC-AK-1288 — \`send: false\` оставляет запись и не запускает отправку" \
    "$(cat "$tree/called" 2>/dev/null)$(ls "$tree/.claude/rt-kit/observations" | grep -c jsonl)" "1"

tree="$(fixture_send_tree)"
printf '{}\n' > "$tree/.claude/rt-kit.json"
note_in "$tree"
perl -e 'select(undef,undef,undef,0.3)'
report "SC-AK-1282 — без адреса отправка не запускается" "$(cat "$tree/called" 2>/dev/null)" ""

tree="$(fixture_send_tree)"
cat > "$tree/node_modules/.bin/agent-kit" <<'EOF'
#!/usr/bin/env bash
perl -e 'select(undef,undef,undef,5)'
EOF
started="$(perl -MTime::HiRes=time -e 'print int(time*1000)')"
note_in "$tree"
ended="$(perl -MTime::HiRes=time -e 'print int(time*1000)')"
if [ $((ended - started)) -lt 2000 ]; then got=вернулась; else got=ждала; fi
report "SC-AK-1281 — проверка не ждёт отправку" "$got" вернулась

tree="$(fixture_send_tree)"
printf '{"fault":1,"tried":1000,"reason":"нет ответа"}\n' > "$tree/.claude/rt-kit/observations/.marks/send.json"
got="$(event_in "$tree" SessionStart)"
case "$got" in *"нет ответа"*) got=названа ;; esac
report "SC-AK-1286 — начало сессии называет старый сбой" "$got" названа

tree="$(fixture_send_tree)"
printf '{"fault":0,"tried":1000,"reason":""}\n' > "$tree/.claude/rt-kit/observations/.marks/send.json"
report "сбоя нет — начало сессии молчит" "$(event_in "$tree" SessionStart)" ""

tree="$(fixture_send_tree)"
expect_decision "SC-AK-1289 — правка каталога наблюдений отказана" rule-source-guard.sh \
    "$(input_edit "$tree/.claude/rt-kit/observations/2026-11-07.jsonl")" deny
expect_decision "SC-AK-1289 — запись командой в каталог наблюдений отказана" rule-source-guard.sh \
    "$(input_cmd "echo x >> .claude/rt-kit/observations/2026-11-07.jsonl" Bash "$tree")" deny

suite_result
