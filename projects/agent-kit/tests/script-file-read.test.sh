#!/usr/bin/env bash
# Сценарии файла сценария, который исполняет интерпретатор: его читают защита места правки и защита
# доставки. Скрипт правки, сохранённый в файл, — та же запись, и заявка из файла — та же заявка.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "файл сценария за интерпретатором"

SF="$(fixture_repo_branched main RT-1943-files)"
OUT="$(mktemp -d)"
trap 'rm -rf "$SF" "$OUT"' EXIT
mkdir -p "$SF/tools" "$SF/.claude/rt-kit"
printf '#!/usr/bin/env node\n// rt-kit v1.0.0 · checks/laid.mjs · abc123\n' > "$SF/tools/laid.mjs"
printf 'require("fs").writeFileSync("tools/laid.mjs", "x")\n' > "$SF/tools/own.mjs"
git -C "$SF" add -A && git -C "$SF" -c user.name=t -c user.email=t@e -c commit.gpgsign=false commit -qm tools

# Решение защиты по вызову: «отказ» или «прошло».
#   judge <защита> <команда>
judge() {
    input_cmd "$2" Bash "$SF" | (cd "$SF" && CLAUDE_PROJECT_DIR="$SF" "$HOOKS/$1" 2>/dev/null) \
        | jq -r '.hookSpecificOutput.permissionDecision // empty' 2>/dev/null | grep -q deny && echo отказ || echo прошло
}
PLACE=rule-source-guard.sh
DELIVERY=git-guard-delivery.sh
OPEN='gh pr'' create --title "Без номера" --body x'

# --- защита места правки ---------------------------------------------------------------
printf 'open("tools/laid.mjs", "w").write("x")\n' > "$OUT/edit.py"
report "SC-AK-1943 — скрипт python правит разложенный файл" "$(judge $PLACE "python3 $OUT/edit.py")" отказ
printf 'import { writeFileSync } from "node:fs";\nwriteFileSync("tools/laid.mjs", "x");\n' > "$OUT/edit.mjs"
report "SC-AK-1943 — скрипт node правит разложенный файл" "$(judge $PLACE "node $OUT/edit.mjs")" отказ
printf 'sed -i "" s/a/b/ tools/laid.mjs\n' > "$OUT/edit.sh"
report "SC-AK-1943 — сценарий оболочки правит разложенный файл" "$(judge $PLACE "bash $OUT/edit.sh")" отказ
report "SC-AK-1943 — путь через переменную команды" "$(judge $PLACE "S=$OUT; bash \"\$S/edit.sh\" 2>&1 | tail -1")" отказ
report "SC-AK-1943 — путь от каталога перед ним" "$(judge $PLACE "cd $OUT && python3 edit.py")" отказ
printf 'print(open("tools/laid.mjs").read())\n' > "$OUT/read.py"
report "SC-AK-1943 — скрипт, который читает, проходит" "$(judge $PLACE "python3 $OUT/read.py")" прошло
report "SC-AK-1943 — код дерева не читается" "$(judge $PLACE 'node tools/own.mjs')" прошло
report "SC-AK-1943 — файла нет — проходит" "$(judge $PLACE "bash $OUT/none.sh")" прошло
{ cat "$OUT/edit.sh"; head -c 70000 /dev/zero | tr '\0' '#'; } > "$OUT/long.sh"
report "SC-AK-1943 — файл длиннее 64 КБ не читается" "$(judge $PLACE "bash $OUT/long.sh")" прошло

# --- защита доставки --------------------------------------------------------------------
printf '%s\n' "$OPEN" > "$OUT/open.sh"
report "SC-AK-1943 — заявка из файла сценария судится" "$(judge $DELIVERY "bash $OUT/open.sh")" отказ
report "SC-AK-1943 — заявка из файла через переменную и source" "$(judge $DELIVERY "S=$OUT && . \$S/open.sh")" отказ
chmod +x "$OUT/open.sh"
report "SC-AK-1943 — файл, вызванный путём, судится" "$(judge $DELIVERY "$OUT/open.sh")" отказ
report "SC-AK-1943 — файл под ограничителем времени судится" "$(judge $DELIVERY "timeout 60 bash $OUT/open.sh")" отказ
report "SC-AK-1943 — файл, который заявки не открывает, проходит" "$(judge $DELIVERY "bash $OUT/edit.sh")" прошло
cp "$OUT/open.sh" "$SF/tools/open.sh"
git -C "$SF" add -A && git -C "$SF" -c user.name=t -c user.email=t@e -c commit.gpgsign=false commit -qm open
report "SC-AK-1943 — сценарий дерева не читается" "$(judge $DELIVERY 'bash tools/open.sh')" прошло
report "SC-AK-1943 — чтение файла с текстом заявки проходит" "$(judge $DELIVERY "cat $OUT/open.sh")" прошло

suite_result "файл сценария за интерпретатором"
