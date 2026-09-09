#!/usr/bin/env bash
# Сценарии сверки очереди работ: повтор вызова, отбитого недоступностью хостинга.
#
# Отделено от остальных сценариев очереди работ потому, что помощник хостинга здесь свой — он
# считает свои вызовы в файле и отвечает по счёту, а общий двойник набора отвечает содержимым
# окружения. Вместе с ними это переросло предел длины файла.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: повтор вызова хостинга"

# --- SC-AK-774 — вызов, отбитый недоступностью хостинга, повторяется -------------------------
#
# Хостинг около часа отвечал кодом недоступности, и перевод колонки отказал шесть раз подряд.
# Правило требует двигать колонку тем же движением, что и работу, а команда падала с первой
# попытки: исполнитель либо крутил её руками, либо оставлял колонку отставшей.
#
# Помощник хостинга здесь свой: он считает свои вызовы в файле и отвечает по счёту.
RETRY_TREE="$(mktemp -d)"
mkdir -p "$RETRY_TREE/tools"
cp "$CHECKS/rt-kit-checks.config.mjs" "$RETRY_TREE/tools/"
cp "$CHECKS/board.github.mjs" "$RETRY_TREE/tools/board.mjs"
cp "$CHECKS/board-epic-link.github.mjs" "$RETRY_TREE/tools/board-epic-link.mjs"
cp "$CHECKS/board-task-dirs.github.mjs" "$RETRY_TREE/tools/board-task-dirs.mjs"
cp "$CHECKS/board-gh.github.mjs" "$RETRY_TREE/tools/board-gh.mjs"
RETRY_CALLS="$RETRY_TREE/calls"

cat > "$RETRY_TREE/gh" <<'STUB'
#!/usr/bin/env bash
printf 'x' >> "$RETRY_CALLS"
tries="$(wc -c < "$RETRY_CALLS" | tr -d ' ')"
if [ "$tries" -le "${STUB_FAIL_TIMES:-0}" ]; then
    printf '%s
' "${STUB_FAIL_TEXT:-HTTP 503: Service Unavailable}" >&2
    exit 1
fi
printf 'ответ
'
STUB
chmod +x "$RETRY_TREE/gh"

# Сколько раз позвали помощника и чем кончился вызов.
retry_run() {
    : > "$RETRY_CALLS"
    ( cd "$RETRY_TREE" && RETRY_CALLS="$RETRY_CALLS" GH_BIN="$RETRY_TREE/gh" RT_GH_RETRY_MS=1 \
        node --input-type=module -e "
            import { gh } from './tools/board.mjs';
            try { process.stdout.write(gh(['api', 'x']).trim()); }
            catch (error) { process.stdout.write('отказ'); }
        " 2>/dev/null )
}
retry_calls() { wc -c < "$RETRY_CALLS" | tr -d ' '; }

export STUB_FAIL_TIMES=2
report "SC-AK-774 — два отказа недоступности снимаются повтором" "$(retry_run)" 'ответ'
report "SC-AK-774 — попыток было три" "$(retry_calls)" 3

# Отказ, который повтор не снимет: третья попытка стоит времени и не пройдёт.
export STUB_FAIL_TIMES=9
export STUB_FAIL_TEXT='HTTP 403: Resource not accessible by integration'
report "SC-AK-774 — отказ по праву не повторяется" "$(retry_run)" 'отказ'
report "SC-AK-774 — попытка была одна" "$(retry_calls)" 1

export STUB_FAIL_TEXT='HTTP 404: Not Found'
report "SC-AK-774 — отказ по несуществующей записи не повторяется" "$(retry_run)" 'отказ'
report "SC-AK-774 — и здесь попытка одна" "$(retry_calls)" 1

# Недоступность, не прошедшая за три попытки, отказывает — но именно после трёх.
export STUB_FAIL_TEXT='HTTP 502: Bad Gateway'
report "SC-AK-774 — недоступность дольше трёх попыток отказывает" "$(retry_run)" 'отказ'
report "SC-AK-774 — и попыток было три" "$(retry_calls)" 3

unset STUB_FAIL_TIMES STUB_FAIL_TEXT
rm -rf "$RETRY_TREE"

suite_result "повтор вызова хостинга"
