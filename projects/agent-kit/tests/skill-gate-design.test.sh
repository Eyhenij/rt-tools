#!/usr/bin/env bash
# Сценарии прихода правила проектирования кода: на чём проверка правил называет `code-design` и
# таблицу приёмов, на чём молчит и что меняет запись кода командой оболочки.
#
# Проверяется механика, а не текст правила: вместо правил лежат заготовки из трёх строк.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "приход правила проектирования"

TREE="$(fixture_tree)"
export CLAUDE_PROJECT_DIR="$TREE"
for rule in code-design code-design-choose typescript-conventions testing task-flow task-flow-plan \
    task-flow-owner doc-style reuse-first; do
    mkdir -p "$TREE/.claude/skills/$rule"
    printf -- '---\nname: %s\nkind: rule\n---\n' "$rule" > "$TREE/.claude/skills/$rule/SKILL.md"
done
gate_session_reset
cleanup() {
    gate_session_cleanup
    rm -rf "$TREE"
}
trap cleanup EXIT

# Все правила одного вызова по порядку: доставка и отказ называют их в «» одной строкой.
named() {
    local rec="${TMPDIR:-/tmp}/claude-skill-gate/tests.loaded"
    rm -f "$rec"
    printf '%s' "$1" | "$HOOKS/skill-gate.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecisionReason // (.hookSpecificOutput.additionalContext | split("\n")[0])' 2>/dev/null \
        | grep -oE '«[a-z-]+»' | tr -d '«»' | tr '\n' ' '
    rm -f "$rec"
}
# d <подпись> <вход> <имя правила> <да|нет> — названо ли правило этим вызовом.
d() {
    local got=нет
    case " $(named "$2")" in *" $3 "*) got=да ;; esac
    report "$1" "$got" "$4"
}
# Ответ вызова: отказ или доставка.
answer() {
    printf '%s' "$1" | "$HOOKS/skill-gate.sh" 2>/dev/null \
        | jq -r 'if .hookSpecificOutput.permissionDecision == "deny" then "отказ" else "доставка" end' 2>/dev/null
    rm -f "${TMPDIR:-/tmp}/claude-skill-gate/tests.loaded"
}
edit() { d "$1" "$(input_edit "$TREE/$2")" "$3" "$4"; }
cmd() { d "$1" "$(input_cmd "printf x > $TREE/$2")" "$3" "$4"; }

# --- SC-AK-1915 — правило и таблица приходят до кода: на разборе, плане задачи и плане эпика --
for doc in docs/tasks/RT-1-x/grill.md docs/tasks/RT-1-x/plan.md docs/tasks/_draft-x/grill.md docs/plans/x.md; do
    edit "SC-AK-1915 — правило на $doc" "$doc" code-design да
    edit "SC-AK-1915 — таблица на $doc" "$doc" code-design-choose да
done
first="$(named "$(input_edit "$TREE/docs/tasks/RT-1-x/plan.md")")"
report "SC-AK-1915 — предметное правило папки остаётся первым" "${first%% *}" "task-flow"
report "SC-AK-1915 — таблица идёт за правилом" "$(printf '%s' "$first" | grep -oE 'code-design[a-z-]*' | tr '\n' ' ')" \
    "code-design code-design-choose "
edit "SC-AK-1915 — папка задачи с именем теста своё правило получает" docs/tasks/RT-1-x-e2e/plan.md code-design-choose да
edit "SC-AK-1915 — план эпика с именем настройки своё правило получает" docs/plans/jest.config.md code-design-choose да

# --- SC-AK-1920 — документ проектирования отказан, пока правило и таблица не загружены ---------
for doc in docs/tasks/RT-1-x/grill.md docs/tasks/RT-1-x/plan.md docs/plans/x.md; do
    report "SC-AK-1920 — $doc отказан, хотя всё помещается" "$(answer "$(input_edit "$TREE/$doc")")" отказ
done
gate_session_load task-flow task-flow-plan doc-style code-design
report "SC-AK-1920 — отказан и тогда, когда не загружена одна таблица" \
    "$(answer "$(input_edit "$TREE/docs/tasks/RT-1-x/plan.md")")" отказ
gate_session_load task-flow task-flow-plan doc-style code-design code-design-choose
out="$(printf '%s' "$(input_edit "$TREE/docs/tasks/RT-1-x/plan.md")" | "$HOOKS/skill-gate.sh" 2>/dev/null)"
report "SC-AK-1920 — загруженные правила запись отпускают" "${out:-тишина}" "тишина"
gate_session_reset
report "SC-AK-1920 — запись документа командой отказана тоже" \
    "$(answer "$(input_cmd "printf x > $TREE/docs/plans/x.md")")" отказ
report "SC-AK-1920 — на коде правило по-прежнему приходит доставкой" \
    "$(answer "$(input_edit "$TREE/libs/x/src/lib/a.ts")")" доставка
expect_reason "SC-AK-1920 — отказ говорит, почему не доставлено" skill-gate.sh \
    "$(input_edit "$TREE/docs/plans/x.md")" 'before this text is composed'
rm -rf "$TREE/.claude/rt-kit/observations"
answer "$(input_edit "$TREE/docs/plans/x.md")" >/dev/null
got="$(cat "$TREE"/.claude/rt-kit/observations/*.jsonl 2>/dev/null | jq -r 'select(.why == "before") | .res' | tr '\n' ' ')"
report "SC-AK-1920 — причина записана в наблюдение с именем правила" "$got" "code-design "
expect_reason "SC-AK-1920 — отказ называет запасной ход" skill-gate.sh "$(input_edit "$TREE/docs/plans/x.md")" 'read .claude/skills/code-design/SKILL.md'
for doc in docs/tasks/RT-1-x/plan.md docs/plans/x.md; do
    report "SC-AK-1920 — запись $doc с ./ в пути отказана" "$(answer "$(input_cmd "printf x > ./$doc")")" отказ
    report "SC-AK-1920 — копия на $doc с ./ в пути отказана" "$(answer "$(input_cmd "cp /tmp/p.md ./$doc")")" отказ
    report "SC-AK-1920 — перенос на $doc отказан" "$(answer "$(input_cmd "mv /tmp/p.md $TREE/$doc")")" отказ
done
gate_session_reset

# --- SC-AK-1916 — правило приходит на код с поведением, скрипт и входной файл -----------------
#
# Слово теста или настройки внутри имени и каталога кода не прячет.
for code in libs/x/src/lib/a.ts tools/a.mjs tools/a.cjs tools/a.js hooks/a.sh libs/x/src/index.ts \
    libs/x/src/public-api.ts libs/x/a.mts libs/x/a.cts apps/x/a.tsx apps/x/a.jsx apps/x/src/app.config.ts \
    tools/rt-checks.config.mjs libs/tests/src/lib/t.store.ts libs/specs/a.ts libs/x/contest.ts libs/x/claude.ts \
    libs/x/latest-e2ee.ts libs/x/theme.preset.ts libs/x/jest.configure.ts; do
    edit "SC-AK-1916 — правило на $code" "$code" code-design да
done
edit "SC-AK-1916 — на коде таблица не приходит" libs/x/src/lib/a.ts code-design-choose нет
first="$(named "$(input_edit "$TREE/libs/x/src/lib/a.ts")")"
report "SC-AK-1916 — предметное правило кода остаётся первым" "${first%% *}" "typescript-conventions"

# --- SC-AK-1917 — молчит там, где модулей нет -------------------------------------------------
for quiet in libs/x/src/lib/a.spec.ts libs/x/src/lib/a.stories.ts tools/a.test.mjs tests/a.sh \
    libs/x/src/lib/a.d.ts jest.config.ts eslint.config.mjs dist/x/a.ts node_modules/x/a.js \
    .claude/hooks/a.sh .claude/workflows/a.js apps/x-e2e/src/a.ts docs/tasks/RT-1-x/progress.md \
    docs/specs/x/spec.md libs/x/src/lib/a.html libs/x/src/lib/a.scss libs/x/test-setup.ts jest.preset.js \
    .eslintrc.js libs/x/a.mock.ts libs/x/a.fixture.ts libs/x/generated/a.ts .storybook/main.ts e2e/a.ts \
    vite.config.ts docs/plans/x-findings.md docs/plans/x.json libs/x/grill.md libs/x/a.json libs/x/a.prisma \
    libs/x/fixtures/a.ts libs/x/__tests__/a.ts libs/x/__mocks__/a.ts libs/x/a.cy.ts libs/x/a.e2e-spec.ts \
    libs/x/a.d.mts libs/x/a.d.cts jest.setup.ts stylelint.config.mjs stylelint-order.config.mjs prettier.config.cjs \
    playwright.config.ts tsup.config.ts babel.config.js karma.conf.js prisma.config.ts tailwind.config.ts \
    docs/tasks/_template/plan.md docs/tasks/_template/grill.md docs/plans/README.md libs/x/fixtures/docs/plans/x.md; do
    edit "SC-AK-1917 — молчит на $quiet" "$quiet" code-design нет
done

# --- SC-AK-1919 — запись командой оболочки получает слои по пути ------------------------------
cmd "SC-AK-1919 — правило на модуле, записанном командой" libs/x/src/lib/b.ts code-design да
cmd "SC-AK-1919 — правило на скрипте, записанном командой" hooks/b.sh code-design да
cmd "SC-AK-1919 — остальные слои по пути приходят тоже" libs/x/src/lib/b.ts reuse-first да
cmd "SC-AK-1919 — на тесте, записанном командой, молчит" libs/x/src/lib/b.spec.ts code-design нет
d "SC-AK-1919 — команда без записи слоя не получает" "$(input_cmd "cat $TREE/libs/x/src/lib/b.ts")" code-design нет
d "SC-AK-1919 — вторая запись команды не теряет слоя" \
    "$(input_cmd "printf x > $TREE/libs/x/src/lib/b.spec.ts && printf x > $TREE/hooks/b.sh")" code-design да
d "SC-AK-1919 — собранный файл не гасит слоя соседней записи" \
    "$(input_cmd "printf x > $TREE/dist/x/b.ts && printf x > $TREE/hooks/b.sh")" code-design да

c() { d "$1" "$(input_cmd "$2")" code-design "$3"; }
c "SC-AK-1919 — скрипт, который запускают с выводом в файл, не правка" "node $TREE/tools/a.mjs > /tmp/o.log" нет
c "SC-AK-1919 — запуск с tee не правка скрипта" "node $TREE/tools/a.mjs 2>&1 | tee /tmp/o.log" нет
c "SC-AK-1919 — копирование наружу не правка" "cp $TREE/hooks/a.sh /tmp/a.sh" нет
c "SC-AK-1919 — удаление не правка" "rm $TREE/hooks/a.sh" нет
c "SC-AK-1919 — tee на модуль правка" "printf x | tee $TREE/hooks/a.sh" да
c "SC-AK-1919 — sed -i на модуль правка" "sed -i '' 's/a/b/' $TREE/hooks/a.sh" да
c "SC-AK-1919 — sed -E -i на модуль правка" "sed -E -i '' 's/a/b/' $TREE/hooks/a.sh" да
c "SC-AK-1919 — sed -i с & в замене правка" "sed -i '' -e 's/a/&b/' $TREE/hooks/a.sh" да
c "SC-AK-1919 — sed без -i чтение" "sed -n '1,3p' $TREE/hooks/a.sh > /tmp/o" нет
c "SC-AK-1919 — скрипт, запущенный после sed -i, не правка" "sed -i '' 's/a/b/' /tmp/x && node $TREE/tools/a.mjs > /tmp/o" нет
c "SC-AK-1919 — копия на модуль правка" "cp /tmp/a.sh $TREE/hooks/a.sh" да
c "SC-AK-1919 — перенос на модуль правка" "mv /tmp/a.sh $TREE/hooks/a.sh" да
c "SC-AK-1919 — копия модуля в текст дерева не правка модуля" "cp $TREE/hooks/a.sh $TREE/a.txt" нет
c "SC-AK-1919 — запись с ./ в пути правка" "printf x > ./hooks/a.sh" да
c "SC-AK-1919 — tee с ./ в пути правка" "printf x | tee ./hooks/a.sh" да
c "SC-AK-1919 — копия на путь с ./ правка" "cp /tmp/a.sh ./hooks/a.sh" да
c "SC-AK-1919 — sed -i на путь с ./ правка" "sed -i '' 's/a/b/' ./hooks/a.sh" да
c "SC-AK-1919 — документ в месте правка" "cat > $TREE/hooks/a.sh <<'E'
x
E" да
c "SC-AK-1919 — путь в кавычках правка" "printf x > \"$TREE/hooks/a.sh\"" да
c "SC-AK-1919 — путь от корня дерева правка" "printf x > hooks/a.sh" да
c "SC-AK-1919 — путь мимо дерева не правка" "printf x > /tmp/hooks/a.sh" нет
c "SC-AK-1919 — рабочая копия внутри дерева судится так же" "printf x > $TREE/.claude/worktrees/w/hooks/a.sh" да
c "SC-AK-1919 — '>' с чертой правка" "printf x >| $TREE/hooks/a.sh" да
c "SC-AK-1919 — sed с ';' в выражении правка" "sed -i '' 's/a;b/c/' $TREE/hooks/a.sh && node x.mjs" да
c "SC-AK-1919 — perl с ';' в выражении правка" "perl -pi -e 's/a;/b/' $TREE/hooks/a.sh" да
c "SC-AK-1919 — копия в папку с косой чертой правка" "cp /tmp/b.sh hooks/" да
mkdir -p "$TREE/hooks"
c "SC-AK-1919 — копия в папку без косой черты правка" "cp /tmp/b.sh $TREE/hooks" да
c "SC-AK-1919 — путь с пробелом правка" "cp '/tmp/a b.sh' '$TREE/hooks/a b.sh'" да
c "SC-AK-1919 — git mv на модуль правка" "git mv a.sh $TREE/hooks/b.sh" да
c "SC-AK-1919 — запись внутри bash -c правка" "bash -c 'printf x > hooks/a.sh'" да
c "SC-AK-1919 — запись телом толкователя правка" "python3 - <<'E'
open('hooks/a.sh','w').write('x')
E" да
c "SC-AK-1919 — запись кодом по списку файлов правка" \
    "node -e \"for (const f of ['hooks/a.sh','hooks/b.sh']) { require('fs').writeFileSync(f,'x') }\"" да
c "SC-AK-1919 — запуск кодом с выводом в файл молчит" \
    "python3 -c \"import subprocess; subprocess.run(['bash','hooks/a.sh'], stdout=open('/tmp/o.txt','w'))\"" нет
c "SC-AK-1919 — сценарий во временной папке молчит" "bash <<'E'
cd \"\$(mktemp -d)\"
echo x > hooks/a.sh
E" нет
c "SC-AK-1919 — install на модуль правка" "install -m 755 /tmp/a.sh $TREE/hooks/a.sh" да
c "SC-AK-1919 — путь от \$PWD правка" "printf x > \$PWD/hooks/a.sh" да
c "SC-AK-1919 — путь через неизвестную переменную молчит" "printf x > \$S/hooks/a.sh" нет
c "SC-AK-1919 — чтение с функцией-стрелкой молчит" "node -e 'require(\"fs\").readFileSync(\"hooks/a.sh\",\"utf8\").split(\"x\").filter(x => x.y)'" нет
c "SC-AK-1919 — стрелка в кавычках молчит" "echo 'a -> hooks/a.sh'" нет
c "SC-AK-1919 — чтение рядом с записью наружу молчит" "grep -n x $TREE/hooks/a.sh > /tmp/o" нет
c "SC-AK-1919 — голое имя после cd внутри bash -c правка" "bash -c 'cd hooks; printf x > a.sh'" да
c "SC-AK-1919 — скрипт со своим -e молчит" "node tools/a.mjs -e hooks/a.sh" нет

# --- SC-AK-1921 — путь читается от корня дерева -----------------------------------------------
OUTER="$(mktemp -d)"
for above in acme.test.app tests my-e2e x.config.d build dist; do
    mkdir -p "$OUTER/$above"
    cp -R "$TREE" "$OUTER/$above/proj"
    export CLAUDE_PROJECT_DIR="$OUTER/$above/proj"
    d "SC-AK-1921 — модуль в дереве под папкой $above" "$(input_edit "$OUTER/$above/proj/libs/x/a.ts")" code-design да
    d "SC-AK-1921 — план в дереве под папкой $above" "$(input_edit "$OUTER/$above/proj/docs/plans/x.md")" code-design-choose да
done
export CLAUDE_PROJECT_DIR="$TREE/.claude/worktrees/w"
mkdir -p "$CLAUDE_PROJECT_DIR"
cp -R "$TREE/.claude/skills" "$TREE/.claude/rt-kit" "$CLAUDE_PROJECT_DIR/" 2>/dev/null
mkdir -p "$CLAUDE_PROJECT_DIR/.claude" && mv "$CLAUDE_PROJECT_DIR/skills" "$CLAUDE_PROJECT_DIR/rt-kit" "$CLAUDE_PROJECT_DIR/.claude/"
d "SC-AK-1921 — модуль рабочей копии, открытой деревом" "$(input_edit "$CLAUDE_PROJECT_DIR/libs/x/a.ts")" code-design да
d "SC-AK-1921 — план рабочей копии, открытой деревом" "$(input_edit "$CLAUDE_PROJECT_DIR/docs/plans/x.md")" code-design-choose да
export CLAUDE_PROJECT_DIR="$TREE"
rm -rf "$OUTER"

# --- SC-AK-1918 — дерево снимает слой прежней функцией ----------------------------------------
printf 'skill_layer_skip() { [ "$1" = "code-design" ] && case "$2" in */hooks/c.sh|*/docs/plans/*) return 0 ;; esac; return 1; }\n' \
    >> "$TREE/.claude/rt-kit/defaults/gate-map.sh"
edit "SC-AK-1918 — снятый деревом слой не требуется" hooks/c.sh code-design нет
edit "SC-AK-1918 — снятый слой не оставляет и таблицу" docs/plans/x.md code-design-choose нет
edit "SC-AK-1918 — соседний файл слой получает" hooks/d.sh code-design да

suite_result "приход правила проектирования"
