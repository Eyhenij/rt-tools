#!/usr/bin/env bash
# Сценарии гарда единообразия: откуда он берёт признаки и что с ними делает.
#
# Набора у гарда не было вовсе, и это дорого стоило: он читал четыре поля, а все профили печатали
# два, поэтому в любом дереве он выходил молча и выглядел работающим. Здесь проверяется механика —
# объявленные наборы, свои признаки дерева, область признака, пустое поле и дерево без признаков.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард единообразия"

TREE="$(fixture_tree)"
export CLAUDE_PROJECT_DIR="$TREE"
mkdir -p "$TREE/tools/signals" "$TREE/src"
cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT

# Профиль дерева: гард без него выходит молча — инвентарь дерева пакет знать не может.
cat > "$TREE/.claude/rt-kit/project.sh" <<'PROFILE'
rt_reinvented_in() { :; }
rt_is_app_code() { return 0; }
PROFILE

declare_bundles() {
    cat > "$TREE/.claude/rt-kit/checks.json" <<JSON
{ "backendRoots": ["libs/api/", "apps/api/"], "reuse": { "bundles": [$1], "signals": "$2" } }
JSON
}

cat > "$TREE/tools/signals/kit.json" <<'JSON'
{
    "signals": [
        { "key": "input", "ext": ".html", "find": "<input\\b", "instead": "готовое поле кита" },
        {
            "key": "control-base",
            "ext": ".component.ts",
            "scope": "whole",
            "find": "ControlValueAccessor",
            "cancel": "extends +KitControlBase",
            "instead": "KitControlBase"
        }
    ]
}
JSON

cat > "$TREE/tools/signals/other.json" <<'JSON'
{ "signals": [{ "key": "table", "ext": ".html", "find": "<table\\b", "instead": "готовая таблица второго кита" }] }
JSON

cat > "$TREE/.claude/rt-kit/signals.json" <<'JSON'
{
    "signals": [
        { "key": "own", "ext": ".ts", "find": "console\\.log", "instead": "журнал дерева" },
        { "key": "input", "ext": ".html", "find": "<input\\b", "instead": "поле именно этого дерева" }
    ]
}
JSON

write_input() {
    jq -n --arg path "$TREE/$1" --arg text "$2" \
        '{tool_name:"Write",tool_input:{file_path:$path,content:$text}}'
}

# SC-AK-142 — объявлен один набор из двух: признаки второго не применяются вовсе.
declare_bundles '"kit"' ''
expect_decision "SC-AK-142 — признак объявленного набора отбивает" reuse-first-guard.sh \
    "$(write_input 'src/a.html' '<input type="text">')" deny
expect_decision "SC-AK-142 — признак необъявленного набора молчит" reuse-first-guard.sh \
    "$(write_input 'src/b.html' '<table></table>')" PASS

declare_bundles '"kit", "other"' ''
expect_decision "SC-AK-142 — объявленный вторым набор работает" reuse-first-guard.sh \
    "$(write_input 'src/c.html' '<table></table>')" deny

# SC-AK-143 — гард называет то же готовое, что стоит в наборе: список у него и у сплошной сверки один.
declare_bundles '"kit"' ''
expect_reason "SC-AK-143 — назван совет из набора" reuse-first-guard.sh \
    "$(write_input 'src/d.html' '<input>')" 'готовое поле кита'

# SC-AK-144, SC-AK-145 — свои признаки дерева: новый ключ дописывается, занятый замещает пакетный.
declare_bundles '"kit"' '.claude/rt-kit/signals.json'
expect_reason "SC-AK-144 — свой признак дерева применяется" reuse-first-guard.sh \
    "$(write_input 'src/e.ts' 'console.log(1);')" 'журнал дерева'
expect_reason "SC-AK-145 — свой признак замещает пакетный по ключу" reuse-first-guard.sh \
    "$(write_input 'src/f.html' '<input>')" 'поле именно этого дерева'

# SC-AK-196, SC-AK-197 — поля, которые гард и сплошная проверка обязаны читать одинаково. Пока
# гард их не читал, он отбивал ту самую правку, которую проверка пропускает: расхождение видно
# только на гейте, а провести правку больше нечем.
cat > "$TREE/tools/signals/layers.json" <<'JSON'
{
    "signals": [
        {
            "key": "mapper-base",
            "ext": ".mapper.ts",
            "skipBackendRoots": true,
            "find": "class +\\w+Mapper",
            "instead": "общая основа перевода"
        },
        {
            "key": "site-only",
            "ext": ".ts",
            "onlyNamed": "^libs/site/",
            "find": "fetch\\(",
            "instead": "готовый клиент сайта"
        }
    ]
}
JSON
declare_bundles '"layers"' ''
mkdir -p "$TREE/libs/api/x" "$TREE/libs/site/x" "$TREE/libs/admin/x"
expect_decision "SC-AK-196 — под корнем бэкенда признак с пропуском молчит" reuse-first-guard.sh \
    "$(write_input 'libs/api/x/a.mapper.ts' 'export class UserMapper {}')" PASS
expect_decision "SC-AK-196 — вне корней бэкенда тот же признак отбивает" reuse-first-guard.sh \
    "$(write_input 'libs/admin/x/a.mapper.ts' 'export class UserMapper {}')" deny
expect_decision "SC-AK-197 — образец имени сверяется с путём, а не с именем файла" reuse-first-guard.sh \
    "$(write_input 'libs/site/x/b.ts' 'fetch("/api")')" deny
expect_decision "SC-AK-197 — тот же файл в чужом корне признака не получает" reuse-first-guard.sh \
    "$(write_input 'libs/admin/x/b.ts' 'fetch("/api")')" PASS

# SC-AK-874 — обратная сторона образца имени. Дерево, которое готовое само и пишет, выводит
# из-под признака папки источника этого готового: иначе выбор у него один — не брать набор
# вовсе, и внутри самого набора готовых компонентов обход готового не ловит ничто.
cat > "$TREE/tools/signals/source.json" <<'JSON'
{
    "signals": [
        {
            "key": "native-input",
            "ext": ".html",
            "exceptNamed": "src/lib/ui-kit/dynamic-input/",
            "find": "<input\\b",
            "instead": "поле набора готовых компонентов"
        }
    ]
}
JSON
declare_bundles '"source"' ''
mkdir -p "$TREE/projects/kit/src/lib/ui-kit/dynamic-input" "$TREE/projects/kit/src/lib/ui-kit/table"
expect_decision "SC-AK-874 — внутри набора признак отбивает, как и снаружи" reuse-first-guard.sh \
    "$(write_input 'projects/kit/src/lib/ui-kit/table/t.html' '<input>')" deny
expect_decision "SC-AK-874 — папка источника готового выведена из-под признака" reuse-first-guard.sh \
    "$(write_input 'projects/kit/src/lib/ui-kit/dynamic-input/i.html' '<input>')" PASS

# SC-AK-1085 — набор объявлен вместе с областью дерева. Гард и сплошная проверка читают поле
# одинаково: прочитанное одним из двух отбивало бы ту самую правку, которую второй пропускает.
mkdir -p "$TREE/apps/admin" "$TREE/apps/site" "$TREE/apps/administration"
declare_bundles '{"name":"kit","roots":["apps/admin"]}' ''
expect_decision "SC-AK-1085 — внутри области признак отбивает" reuse-first-guard.sh \
    "$(write_input 'apps/admin/a.html' '<input>')" deny
expect_decision "SC-AK-1085 — вне области то же приложение проходит" reuse-first-guard.sh \
    "$(write_input 'apps/site/a.html' '<input>')" PASS
expect_decision "SC-AK-1085 — соседний каталог с тем же началом имени не захвачен" reuse-first-guard.sh \
    "$(write_input 'apps/administration/a.html' '<input>')" PASS

declare_bundles '{"name":"kit","roots":["apps/admin","apps/site"]}' ''
expect_decision "SC-AK-1085 — вторая область объявлена и отбивает" reuse-first-guard.sh \
    "$(write_input 'apps/site/a.html' '<input>')" deny

declare_bundles '"kit"' ''
expect_decision "SC-AK-1085 — набор без области судит дерево целиком" reuse-first-guard.sh \
    "$(write_input 'apps/site/a.html' '<input>')" deny

# SC-AK-147 — область «файл целиком»: правка приносит строку без объявления класса, признак судит файл.
declare_bundles '"kit"' ''
declare_bundles '"kit"' ''
printf 'export class FooComponent implements ControlValueAccessor {}\n' > "$TREE/src/g.component.ts"
expect_decision "SC-AK-147 — признак области «файл целиком» видит содержимое файла" reuse-first-guard.sh \
    "$(write_input 'src/g.component.ts' '    writeValue(): void {}')" deny

printf 'export class BarComponent extends KitControlBase implements ControlValueAccessor {}\n' > "$TREE/src/h.component.ts"
expect_decision "SC-AK-147 — отмена признака гасит его" reuse-first-guard.sh \
    "$(write_input 'src/h.component.ts' '    writeValue(): void {}')" PASS

# SC-AK-148 — пустое поле не съезжает в соседнее: у профиля четыре колонки, третья пуста.
cat > "$TREE/.claude/rt-kit/project.sh" <<'PROFILE'
rt_reinvented_in() {
    case "$1" in
        *.ts) printf '%s\t%s\t%s\t%s\n' 'added' '@Input\(' '' 'реактивный вход' ;;
    esac
}
rt_is_app_code() { return 0; }
PROFILE
expect_reason "SC-AK-148 — совет при пустой отмене остаётся советом" reuse-first-guard.sh \
    "$(write_input 'src/i.ts' '@Input() name = 1;')" 'реактивный вход'

# SC-AK-149 — дерево без признаков: правка проходит, но молчания нет.
BARE="$(fixture_tree)"
cat > "$BARE/.claude/rt-kit/project.sh" <<'PROFILE'
rt_reinvented_in() { :; }
rt_is_app_code() { return 0; }
PROFILE
mkdir -p "$BARE/src"
said="$(jq -n --arg path "$BARE/src/a.html" --arg text '<input>' \
    '{tool_name:"Write",tool_input:{file_path:$path,content:$text}}' \
    | CLAUDE_PROJECT_DIR="$BARE" "$HOOKS/reuse-first-guard.sh" 2>&1 >/dev/null)"
case "$said" in
    *reuse.bundles*) report "SC-AK-149 — дерево без признаков слышит, чем они объявляются" есть есть ;;
    *) report "SC-AK-149 — дерево без признаков слышит, чем они объявляются" "нет" есть ;;
esac
CLAUDE_PROJECT_DIR="$BARE" expect_decision "SC-AK-149 — и правку при этом не отбивает" reuse-first-guard.sh \
    "$(jq -n --arg path "$BARE/src/a.html" --arg text '<input>' '{tool_name:"Write",tool_input:{file_path:$path,content:$text}}')" PASS
rm -rf "$BARE"

# SC-AK-150 — набор, которого при пакете нет: сплошная сверка отказывает и перечисляет, что есть.
said="$(node --input-type=module -e "
import { loadSignals } from '$CHECKS/signals.mjs';
try {
    loadSignals({ bundles: ['нетакого'] }, '$TREE');
    console.log('без отказа');
} catch (error) {
    console.log(error.message);
}
" 2>&1)"
case "$said" in
    *'is not found'*'there are:'*) report "SC-AK-150 — неизвестный набор назван вместе с теми, что есть" есть есть ;;
    *) report "SC-AK-150 — неизвестный набор назван вместе с теми, что есть" "$said" есть ;;
esac

# --- вторая дверь: тот же признак, положенный командой оболочки -----------------------------
#
# Гард, подписанный на инструмент правки, обходится сменой способа записи. Отбитая правка дважды
# за один заход легла командой — разбор `2026-08-15-guard-denied-shell-wrote-anyway.md`. Текстом
# правки здесь служит сама команда: что она кладёт в файл, лежит в ней же.
declare_bundles '"kit"' ''

cmd_input() {
    jq -n --arg c "$1" --arg t "${2:-Bash}" '{session_id:"tests",tool_name:$t,tool_input:{command:$c}}'
}
r() { expect_decision "$1" reuse-first-guard.sh "$(cmd_input "$2" "${4:-Bash}")" "$3"; }

r "SC-AK-249 — перенаправление с признаком отбивается" \
    "echo '<input type=\"text\">' > src/j.html" deny
r "SC-AK-249 — дописывание с признаком отбивается" \
    "echo '<input>' >> src/k.html" deny
r "SC-AK-249 — правка на месте с признаком отбивается" \
    "sed -i '' 's/x/<input>/' src/l.html" deny
r "SC-AK-249 — интерпретатор с признаком в heredoc отбивается" \
    "python3 - <<'PY'
import pathlib
pathlib.Path('src/m.html').write_text('<input>')
PY" deny

# Гард судит текст, который команда кладёт в файл, а не сам факт записи: путь, взятый из чужого
# файла, ему не виден вовсе. Это граница приёма, а не обещание — она же и у соседних гардов.
r "SC-AK-249 — запись без признака в тексте команды пропускается" \
    "cat f | tee src/n.html" PASS

# Чтение и поиск не отбиваются: признак в строке поиска — не написанный код.
r "SC-AK-250 — чтение файла с признаком пропускается" "cat src/j.html" PASS
r "SC-AK-250 — поиск того же признака пропускается" "grep -rn '<input' src/" PASS

# Расширение, гарду неинтересное, признака не получает: он судит разметку, стили и код.
r "SC-AK-250 — запись признака в текст проекта пропускается" \
    "echo '<input>' > docs/adr/0001-x.md" PASS

# Осознанное отступление в самой команде: маркер работает обеими дверями одинаково.
r "SC-AK-254 — маркер отступления в команде снимает признак" \
    "echo '<input type=\"tel\"> <!-- native-ok: в ките нет поля с маской -->' > src/o.html" PASS

# Терминал среды исполняет ту же командную строку и кладёт её в то же поле. Пока гард на него не
# звался, объявление называло его, а тело пропускало: снаружи это выглядит закрытым.
r "SC-AK-251 — та же запись из терминала среды отбивается" \
    "echo '<input>' > src/p.html" deny mcp__webstorm__execute_terminal_command

# Универсальный исполнитель прячет настоящую команду во вложенной строке.
r "SC-AK-252 — вложенная команда универсального исполнителя отбивается" \
    "execute_terminal_command --command \"echo '<input>' > src/q.html\"" deny mcp__webstorm__execute_tool

# SC-AK-151 — маркер снимает свою строку и следующую, а дальше не достаёт.
#
# Форма из паттерна — комментарий над кодом: атрибутом маркер в разметке не ставится, потому что
# форматировщик уводит первый атрибут со строки имени тега. Фикстура повторяет раскладку дерева:
# `tools/` с проверкой и списком принятых долгов, `src/` с кодом.
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/signals.mjs" "$CHECKS/check-reuse.mjs" "$TREE/tools/"
printf '{ "accepted": {}, "debt": {} }\n' > "$TREE/tools/reuse-allowlist.json"
cat > "$TREE/.claude/rt-kit/checks.json" <<'JSON'
{ "sourceRoots": ["src"], "reuse": { "bundles": [], "signals": "tools/signals/kit.json" } }
JSON

# Сколько расхождений напечатала сплошная сверка на единственном файле дерева.
reuse_findings() {
    rm -f "$TREE"/src/*.html
    printf '%b\n' "$1" > "$TREE/src/marked.html"

    (cd "$TREE" && node tools/check-reuse.mjs 2>&1) | grep -c 'input ×'
}

report "SC-AK-151 — маркер комментарием строкой выше снимает признак" \
    "$(reuse_findings '<!-- native-ok: в ките нет поля с маской -->\n<input type="tel" />')" 0
report "SC-AK-151 — маркер в самой строке снимает признак" \
    "$(reuse_findings '<input type="tel" /> <!-- native-ok: в ките нет поля с маской -->')" 0
report "SC-AK-151 — через строку после маркера признак считается" \
    "$(reuse_findings '<!-- native-ok: в ките нет поля с маской -->\n<b>всё равно</b>\n<input type="tel" />')" 1
report "SC-AK-151 — без маркера признак считается" "$(reuse_findings '<input type="tel" />')" 1

suite_result "гард единообразия"
