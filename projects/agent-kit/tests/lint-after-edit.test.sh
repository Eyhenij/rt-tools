#!/usr/bin/env bash
# Сценарии линтера по следам правки.
#
# Проверяется механика входа: какие файлы хук берёт на проверку. Правку инструментом он брал
# всегда, у команды оболочки — только перенос файла, и файл, записанный перенаправлением или
# интерпретатором, линтера не получал вовсе. Признак записи при этом объявлен в профиле дерева
# и читается тем же способом, что и гейтом правил.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "линтер по следам правки"

TREE="$(mktemp -d)"
export CLAUDE_PROJECT_DIR="$TREE"
cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT

mkdir -p "$TREE/src" "$TREE/.claude/rt-kit/defaults"
printf '{"name":"probe"}\n' > "$TREE/package.json"
cp "$DEFAULTS/project.sh" "$TREE/.claude/rt-kit/defaults/project.sh"

# Надстройка дерева-фикстуры: линтер, который всегда находит замечание, и код приложения —
# всё, что лежит в дереве. Сам линтер здесь не предмет проверки, предмет — выбор файлов.
cat > "$TREE/.claude/rt-kit/project.sh" <<'PROFILE'
rt_lint_for() { printf 'sh -c "echo замечание-линтера; exit 1"'; }
rt_is_app_code() { case "$1" in *.ts) return 0 ;; *) return 1 ;; esac; }
rt_push_checks() { printf ''; }
PROFILE

printf 'const a = 1;\n' > "$TREE/src/a.ts"

# Что хук отдал сессии после названной команды оболочки.
after() {
    input_cmd "$1" Bash "$TREE" | bash "$HOOKS/lint-after-edit.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.additionalContext // ""' 2>/dev/null
}

# SC-AK-724. Файл, записанный перенаправлением, линтуется: запись оболочкой меняет тот же файл,
# что и правка инструментом.
case "$(after 'printf "x" > src/a.ts')" in
    *замечание-линтера*) report "SC-AK-724 — запись перенаправлением линтуется" да да ;;
    *) report "SC-AK-724 — запись перенаправлением линтуется" "$(after 'printf "x" > src/a.ts')" да ;;
esac

# SC-AK-725. Запись телом интерпретатора линтуется тем же признаком: путь стоит в теле, а не в
# строке вызова.
out="$(after 'python3 - <<PY
open("src/a.ts", "w").write("x")
PY')"
case "$out" in
    *замечание-линтера*) report "SC-AK-725 — запись интерпретатором линтуется" да да ;;
    *) report "SC-AK-725 — запись интерпретатором линтуется" "$out" да ;;
esac

# SC-AK-727. Каталог в команде записи не разворачивается: пишут всегда в файл, а каталог там —
# рабочий, и развёрнутый он отдал бы линтеру половину дерева.
mkdir -p "$TREE/src/deep"
printf 'const b = 1;\n' > "$TREE/src/deep/b.ts"
out="$(after "cd $TREE; printf x > docs/note.txt")"
report "SC-AK-727 — каталог записи не разворачивается" "$out" ''

# SC-AK-726. Чтение линтера не зовёт: команда, которая ничего не пишет, уходит молча — иначе хук
# гонял бы линтер на каждый греп по дереву.
report "SC-AK-726 — чтение линтера не зовёт" "$(after 'grep -n x src/a.ts')" ''

suite_result "линтер по следам правки"
