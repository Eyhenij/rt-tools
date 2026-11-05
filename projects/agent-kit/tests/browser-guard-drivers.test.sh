#!/usr/bin/env bash
# Сценарии гарда обходных путей к браузеру.
#
# Проверяется механика: какие двери он узнаёт в тексте команды и какие — только в содержимом
# запускаемого файла. Второе дороже первого: браузер, поднятый библиотекой изнутри скрипта, в
# командной строке не виден вовсе, и закреплённый профиль обошли им дважды за один заход.
#
# Прогон сквозных спек здесь же и проверяется на непопадание: гард, отбивший его, отбил бы
# законную работу — там браузер водит прогонщик, а не агент.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард обходных путей к браузеру"

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

tree="$(mktemp -d)"
mkdir -p "$tree/.claude/hooks"
cp "$HOOKS/browser-device-id.sh" "$tree/.claude/hooks/browser-device-id.sh"
export CLAUDE_PROJECT_DIR="$tree"
export RT_BROWSER_DEVICE_ID=профиль-дерева

# Гард отвечает кодом возврата, а не решением в JSON.
say() {
    local label="$1" cmd="$2" want="$3" got
    if input_cmd "$cmd" Bash "$TMP" | "$HOOKS/browser-guard-no-other-drivers.sh" >/dev/null 2>&1; then
        got="PASS"
    else
        got="DENY"
    fi
    report "$label" "$got" "$want"
}

# Чем именно гард отбил: два отказа подряд бывают на одну команду по разным причинам.
reason() {
    local label="$1" cmd="$2" pattern="$3" got
    if input_cmd "$cmd" Bash "$TMP" | "$HOOKS/browser-guard-no-other-drivers.sh" 2>&1 >/dev/null \
        | grep -qE "$pattern"; then got="есть"; else got="нет"; fi
    report "$label" "$got" "есть"
}

# --- двери, видные в самой команде ------------------------------------------------------

say "открытие адреса средствами системы отбито" "open http://localhost:4200" DENY
say "сценарий автоматизации отбит" "osascript -e 'tell application \"Google Chrome\"'" DENY
say "прямой запуск бинарника отбит" "/usr/bin/chromium --headless" DENY
say "обычная команда проходит" "pnpm run lint" PASS
say "прогон сквозных спек проходит" "pnpm exec playwright test --project=chromium" PASS

# --- SC-AK-760. Браузер, поднятый библиотекой изнутри скрипта ---------------------------

printf '%s\n' \
    "import { chromium } from 'playwright';" \
    "const browser = await chromium.launch({ headless: false });" \
    > "$TMP/drive.mjs"

say "SC-AK-760 — запуск скрипта, поднимающего браузер, отбит" "node $TMP/drive.mjs" DENY
reason "SC-AK-760 — отказ называет файл" "node $TMP/drive.mjs" "from inside.*drive\.mjs"

# Тот же файл под обёрткой менеджера пакетов: под ней стоит тот же интерпретатор.
say "SC-AK-760 — обёртка менеджера пакетов не прячет запуск" "pnpm exec tsx $TMP/drive.mjs" DENY

# Присоединение к уже поднятому браузеру — та же дверь: закреплённый профиль оно не спрашивает.
printf '%s\n' "await puppeteer.connect({ browserWSEndpoint: url });" > "$TMP/attach.mjs"
say "SC-AK-760 — присоединение к поднятому браузеру отбито" "node $TMP/attach.mjs" DENY

# Глагол без имени движка перед точкой: имя вносят прямым ввозом, и судить остаётся сам глагол.
printf '%s\n' \
    "import { connectOverCDP } from 'playwright';" \
    "const browser = await connectOverCDP('http://localhost:9222');" \
    > "$TMP/cdp.mjs"
say "SC-AK-760 — присоединение по отладочному порту без имени движка отбито" "node $TMP/cdp.mjs" DENY

# Скрипт без вождения браузера проходит: судится содержимое, а не имя интерпретатора.
printf '%s\n' "console.log('сводка');" > "$TMP/plain.mjs"
say "SC-AK-760 — скрипт без вождения проходит" "node $TMP/plain.mjs" PASS

# Файла, которого нет, гард не судит вовсе: сломанная проверка не имеет права заклинить работу.
say "SC-AK-760 — несуществующий файл работу не останавливает" "node $TMP/нет-такого.mjs" PASS

# --- SC-AK-761. Код, переданный доводом вместо файла ------------------------------------

say "SC-AK-761 — вождение из довода отбито" \
    "node -e \"const b = await chromium.launch();\"" DENY
say "SC-AK-761 — тот же довод у другого интерпретатора отбит" \
    "python3 -c 'p.chromium.launch()'" DENY

# Поиск того же слова по дереву работой с браузером не является, и отбивать его нечем.
say "SC-AK-761 — поиск слова по дереву проходит" "grep -rn 'chromium.launch' projects" PASS
say "SC-AK-761 — счётчик совпадений проходит" "grep -c 'chromium.launch' README.md" PASS

# --- SC-AK-1267. Драйвер из плагина отбивается так же, как поставленный руками ------------
tool_call() {
    local label="$1" tool="$2" want="$3" got
    if input_cmd '' "$tool" "$TMP" | "$HOOKS/browser-guard-no-other-drivers.sh" >/dev/null 2>&1; then
        got="PASS"
    else
        got="DENY"
    fi
    report "$label" "$got" "$want"
}
tool_call "SC-AK-1267 — второй драйвер по обычному имени отбит" mcp__playwright__browser_navigate DENY
tool_call "SC-AK-1267 — второй драйвер из плагина отбит" mcp__plugin_playwright_playwright__browser_navigate DENY
tool_call "SC-AK-1267 — третий драйвер по обычному имени отбит" mcp__chrome-devtools__navigate_page DENY
tool_call "SC-AK-1267 — третий драйвер из плагина отбит" mcp__plugin_chrome-devtools-mcp_chrome-devtools__navigate_page DENY
tool_call "SC-AK-1267 — закреплённое расширение проходит" mcp__claude-in-chrome__navigate PASS

# Вторая половина правки — строка `# rt-hook:`: по ней диспетчер решает, звать ли гард вообще.
# Прямой вызов гарда её не читает, и откат одной этой строки оставлял набор зелёным, а дефект
# возвращался. Поэтому имя инструмента прогоняется через диспетчер.
DISPATCH_DIR="$(mktemp -d)"
cp "$ASSETS/hooks/dispatch.sh" "$ASSETS/hooks/hook-input.sh" "$ASSETS/hooks/utf8.sh" \
    "$ASSETS/hooks/deny-tail.sh" "$ASSETS/hooks/browser-guard-no-other-drivers.sh" "$DISPATCH_DIR/" 2>/dev/null
dispatched() {
    local label="$1" tool="$2" want="$3" got
    if input_cmd '' "$tool" "$TMP" | bash "$DISPATCH_DIR/dispatch.sh" PreToolUse >/dev/null 2>&1; then
        got="PASS"
    else
        got="DENY"
    fi
    report "$label" "$got" "$want"
}
dispatched "SC-AK-1267 — диспетчер зовёт гард на драйвер из плагина" \
    mcp__plugin_playwright_playwright__browser_navigate DENY
dispatched "SC-AK-1267 — диспетчер зовёт гард на третий драйвер из плагина" \
    mcp__plugin_chrome-devtools-mcp_chrome-devtools__navigate_page DENY
dispatched "SC-AK-1267 — через диспетчер закреплённое расширение проходит" \
    mcp__claude-in-chrome__navigate PASS
rm -rf "$DISPATCH_DIR"

# --- SC-AK-762. Ненастроенное дерево ----------------------------------------------------

# Помощник не назвал профиля — гард пропускает: предлагать взамен ему нечего.
out="$(RT_BROWSER_DEVICE_ID= CLAUDE_PROJECT_DIR="$tree" input_cmd "node $TMP/drive.mjs" Bash "$TMP" \
    | env -u RT_BROWSER_DEVICE_ID "$HOOKS/browser-guard-no-other-drivers.sh" >/dev/null 2>&1; echo $?)"
report "SC-AK-762 — без названного профиля гард пропускает" "$out" 0

rm -rf "$tree"

suite_result "гард обходных путей к браузеру"
