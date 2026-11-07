#!/usr/bin/env bash
# Запуск отправки без команды: что делает запись наблюдения, начало и конец сессии, и что отказано.
# Команда пакета заменена записью вызова: здесь судится запуск. Настоящая сборка стоит в одном
# сценарии, в конце: он проходит весь путь от хука до тела запроса.
#
# Сценарии договорённости: SC-AK-1281, SC-AK-1282, SC-AK-1283, SC-AK-1288, SC-AK-1289, SC-AK-1307,
# SC-AK-1308, SC-AK-1309, SC-AK-1310.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "ЗАПУСК ОТПРАВКИ"

# Набор помечает себя и не шлёт, а здесь судится именно запуск.
unset RT_KIT_TEST

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
touch "$tree/.claude/rt-kit/observations/.marks/send.try"
note_in "$tree"
perl -e 'select(undef,undef,undef,0.3)'
report "SC-AK-1283 — свежая метка не запускает второй процесс" "$(cat "$tree/called" 2>/dev/null)" ""

tree="$(fixture_send_tree)"
note_in "$tree"
note_in "$tree"
note_in "$tree"
called_in "$tree" >/dev/null
perl -e 'select(undef,undef,undef,0.3)'
report "SC-AK-1309 — поток наблюдений запускает один процесс" "$(wc -l < "$tree/called" | tr -d ' ')" 1

tree="$(fixture_send_tree)"
RT_KIT_TEST=1 note_in "$tree"
perl -e 'select(undef,undef,undef,0.3)'
report "SC-AK-1308 — запуск с пометкой теста не шлёт" \
    "$(cat "$tree/called" 2>/dev/null)$(ls "$tree/.claude/rt-kit/observations" | grep -c jsonl)" 1

tree="$(fixture_send_tree)"
touch "$tree/.claude/rt-kit/observations/.marks/send.try"
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

# Вторая копия без своей сборки спрашивает основную.
tree="$(fixture_send_tree)"
second="$tree-second"
git -C "$tree" worktree add -q -b second-copy "$second" 2>/dev/null
mkdir -p "$second/.claude/rt-kit/observations"
cp "$tree/.claude/rt-kit.json" "$second/.claude/rt-kit.json"
note_in "$second"
got="$(called_in "$tree")"
case "$got" in *"--root $second"*) got=запущена ;; esac
report "SC-AK-1307 — копия без сборки берёт команду основной" "$got" запущена
rm -rf "$second"

tree="$(fixture_send_tree)"
rm -rf "$tree/node_modules"
report "SC-AK-1286 — адрес есть, слать нечем: начало сессии это называет" \
    "$(event_in "$tree" SessionStart | grep -c 'no package command')" 1

tree="$(fixture_send_tree)"
printf '#!/usr/bin/env bash\nexit 2\n' > "$tree/node_modules/.bin/agent-kit"
note_in "$tree"
for i in 1 2 3 4 5 6 7 8 9 10; do
    [ -f "$tree/.claude/rt-kit/observations/.marks/send.broken" ] && break
    perl -e 'select(undef,undef,undef,0.1)'
done
report "SC-AK-1286 — старая сборка не знает команду: начало сессии это называет" \
    "$(event_in "$tree" SessionStart | grep -c 'did not run the sending')" 1

tree="$(fixture_send_tree)"
event_in "$tree" SessionStart >/dev/null
printf '{"intake":"https://intake.invalid","send":false}\n' > "$tree/.claude/rt-kit.json"
event_in "$tree" SessionStart >/dev/null
report "SC-AK-1310 — смена ключа становится наблюдением" \
    "$(cat "$tree/.claude/rt-kit/observations/"*.jsonl 2>/dev/null | grep -c '"ev":"settings-change"')" 1

tree="$(fixture_send_tree)"
expect_decision "SC-AK-1310 — ключ отправки отказан" rule-source-guard.sh \
    "$(input_edit "$tree/.claude/rt-kit.json" '"send": false')" deny
expect_decision "SC-AK-1310 — ключ записи отказан" rule-source-guard.sh \
    "$(input_edit "$tree/.claude/rt-kit.json" '"observe": false')" deny
expect_decision "SC-AK-1310 — другой ключ настройки разрешён" rule-source-guard.sh \
    "$(input_edit "$tree/.claude/rt-kit.json" '"tree": "one"')" PASS
expect_decision "SC-AK-1310 — запись ключа командой отказана" rule-source-guard.sh \
    "$(input_cmd "jq '.send=false' a > .claude/rt-kit.json" Bash "$tree")" deny

tree="$(fixture_send_tree)"
expect_decision "SC-AK-1289 — правка каталога наблюдений отказана" rule-source-guard.sh \
    "$(input_edit "$tree/.claude/rt-kit/observations/2026-11-07.jsonl")" deny
expect_decision "SC-AK-1289 — запись командой в каталог наблюдений отказана" rule-source-guard.sh \
    "$(input_cmd "echo x >> .claude/rt-kit/observations/2026-11-07.jsonl" Bash "$tree")" deny

# Весь путь: настоящий хук конца сессии, настоящая сборка пакета, приём на локальном порту.
TREE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
BUILT="$TREE_ROOT/dist/agent-kit/bin/agent-kit.js"
if [ -f "$BUILT" ]; then
    tree="$(fixture_send_tree)"
    served="$tree/served"
    port_file="$tree/port"
    PORT_FILE="$port_file" SERVED="$served" node -e "
        const fs = require('node:fs');
        const server = require('node:http').createServer((request, response) => {
            let body = '';
            request.on('data', (part) => { body += part; });
            request.on('end', () => {
                fs.appendFileSync(process.env.SERVED, request.url + ' ' + body + '\n');
                response.writeHead(200, { 'content-type': 'application/json' });
                response.end('{}');
            });
        });
        server.listen(0, '127.0.0.1', () => fs.writeFileSync(process.env.PORT_FILE, String(server.address().port)));
    " &
    server_pid=$!
    port="$(wait_for_port "$port_file")"
    printf 'tree-token\n' > "$tree/token-file"
    printf '{"intake":"http://127.0.0.1:%s","token":"token-file","tree":"probe-tree"}\n' "$port" > "$tree/.claude/rt-kit.json"
    printf '#!/usr/bin/env bash\nexec node "%s" "$@"\n' "$BUILT" > "$tree/node_modules/.bin/agent-kit"
    day="$(date -u +%Y-%m-%d)"
    printf '{"t":"%sT10:00:00Z","ev":"skill-load","res":"testing","sid":"1","v":"0.35.0"}\n' "$day" \
        > "$tree/.claude/rt-kit/observations/$day.jsonl"
    event_in "$tree" SessionEnd
    for i in $(seq 1 100); do
        [ -s "$served" ] && break
        perl -e 'select(undef,undef,undef,0.1)'
    done
    kill "$server_pid" 2>/dev/null
    wait "$server_pid" 2>/dev/null
    report "SC-AK-1307 — запрос ушёл на адрес строк дня" "$(cut -d' ' -f1 "$served" 2>/dev/null)" /api/intake/metrics
    report "SC-AK-1307 — тело несёт счёт этого дня" \
        "$(cut -d' ' -f2- "$served" 2>/dev/null | jq -r --arg day "$day" 'select(.day == $day) | .metrics["ruleLoads:testing"]')" 1
else
    report "SC-AK-1307 — сборка пакета есть" "нет $BUILT" есть
fi

suite_result
