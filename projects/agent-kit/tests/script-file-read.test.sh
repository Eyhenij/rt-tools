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

printf 'p = pathlib.Path("tools/laid.mjs")\np.write_text("x")\n' > "$OUT/path.py"
report "SC-AK-1943 — запись через переменную от Path" "$(judge $PLACE "python3 $OUT/path.py")" отказ
for run in 'bash -e' 'bash -euo pipefail' 'bash -o pipefail' 'bash <' '/usr/bin/env bash' "A='a b' bash" 'X="$(date)" bash' '.'; do
    report "SC-AK-1943 — форма запуска «$run»" "$(judge $PLACE "$run $OUT/edit.sh")" отказ
done
mkdir -p "$OUT/a b" "$OUT/node-x" && cp "$OUT/edit.sh" "$OUT/a b/edit.sh" && cp "$OUT/edit.sh" "$OUT/node-x/edit.sh"
report "SC-AK-1943 — путь с пробелом" "$(judge $PLACE "bash \"$OUT/a b/edit.sh\"")" отказ
report "SC-AK-1943 — вид файла не берут из имени каталога" "$(judge $PLACE "bash $OUT/node-x/edit.sh")" отказ
report "SC-AK-1943 — код «bash -c» зовёт файл" "$(judge $PLACE "bash -lc 'true; bash $OUT/edit.sh'")" отказ
report "SC-AK-1943 — «bash -n» ничего не исполняет" "$(judge $PLACE "bash -n $OUT/edit.sh")" прошло
report "SC-AK-1943 — запуск в кавычках — текст" "$(judge $PLACE "grep -n 'x; bash $OUT/edit.sh' a.md")" прошло
printf '# было: sed -i "" s/a/b/ tools/laid.mjs\n' > "$OUT/note.sh"
report "SC-AK-1943 — комментарий сценария — не правка" "$(judge $PLACE "bash $OUT/note.sh")" прошло
printf 'node tools/laid.mjs > /tmp/o 2>&1\n' > "$OUT/run-node-checks.sh"
report "SC-AK-1943 — запуск разложенной проверки — не правка" "$(judge $PLACE "bash $OUT/run-node-checks.sh")" прошло
printf 'd="$(mktemp -d)"; cd "$d" && sed -i "" s/a/b/ tools/laid.mjs\n' > "$OUT/away.sh"
report "SC-AK-1943 — правка в своём временном каталоге проходит" "$(judge $PLACE "bash $OUT/away.sh")" прошло
printf 'cd %s\nsed -i "" s/a/b/ tools/laid.mjs\n' "$SF" > "$OUT/home.sh"
report "SC-AK-1943 — сценарий, который входит в дерево, отказан" "$(cd "$OUT" && judge $PLACE "bash $OUT/home.sh")" отказ

report "SC-AK-1943 — сообщение с решёткой за русской буквой перед запуском" "$(judge $PLACE "git commit -m исправлено#12 && bash $OUT/edit.sh")" отказ
report "SC-AK-1943 — «cd» внутри скобок наружу не выходит" "$(judge $PLACE "cd $OUT; H=\$(cd node-x && pwd); (cd node-x && ls); bash edit.sh")" отказ
for run in 'node --check' 'bash --version' 'command -v'; do
    report "SC-AK-1943 — «$run» ничего не исполняет" "$(judge $PLACE "$run $OUT/edit.sh")" прошло
done
report "SC-AK-1943 — сценарий, который пишет сам вызов, судится не по прежнему тексту" \
    "$(judge $PLACE "printf 'echo x\n' > $OUT/edit.sh && bash $OUT/edit.sh")" прошло
report "SC-AK-1943 — запись рядом с запуском чтения файла не снимает" "$(judge $PLACE "echo x > $OUT/log; bash $OUT/edit.sh")" отказ
printf 'S=/tmp/zz; cd "$S"; sed -i "" s/a/b/ tools/laid.mjs\n' > "$OUT/zz.sh"
report "SC-AK-1943 — правка в каталоге из переменной проходит" "$(judge $PLACE "bash $OUT/zz.sh")" прошло
printf 'R="$(git rev-parse --show-toplevel)"; cd "$R"\nsed -i "" s/a/b/ tools/laid.mjs\n' > "$OUT/root.sh"
report "SC-AK-1943 — вход в корень дерева через переменную отказан" "$(judge $PLACE "bash $OUT/root.sh")" отказ
# Вложенные подстановки не растягивают разбор на минуты.
nested="$(printf '$(echo %.0s' {1..900})"
started="$(date +%s)"
judge $PLACE "$nested" >/dev/null
report "SC-AK-1943 — девятьсот незакрытых подстановок разобраны быстро" "$([ $(($(date +%s) - started)) -lt 20 ] && echo да || echo нет)" да

# --- защита доставки --------------------------------------------------------------------
printf '%s\n' "$OPEN" > "$OUT/open.sh"
report "SC-AK-1943 — заявка из файла сценария судится" "$(judge $DELIVERY "bash $OUT/open.sh")" отказ
report "SC-AK-1943 — заявка из файла через переменную и source" "$(judge $DELIVERY "S=$OUT && . \$S/open.sh")" отказ
chmod +x "$OUT/open.sh"
report "SC-AK-1943 — файл, вызванный путём, судится" "$(judge $DELIVERY "$OUT/open.sh")" отказ
report "SC-AK-1943 — файл под ограничителем времени судится" "$(judge $DELIVERY "timeout 60 bash $OUT/open.sh")" отказ
report "SC-AK-1943 — файл, который заявки не открывает, проходит" "$(judge $DELIVERY "bash $OUT/edit.sh")" прошло
report "SC-AK-1943 — заявка под ключом оболочки судится" "$(judge $DELIVERY "bash -e $OUT/open.sh")" отказ
printf '%s --base "$1" --title "$2"\n' 'gh pr'' create' > "$OUT/params.sh"
got="$(input_cmd "bash $OUT/params.sh main '[RT-1943] Готово'" Bash "$SF" | (cd "$SF" && CLAUDE_PROJECT_DIR="$SF" "$HOOKS/$DELIVERY" 2>/dev/null))"
report "SC-AK-1943 — вычисленный заголовок назван вычисленным, а не безномерным" \
    "$(printf '%s' "$got" | grep -c 'is computed there')/$(printf '%s' "$got" | grep -c 'does not start with the number')" '1/0'
printf 'cd "$(mktemp -d)" && git init -q\ngit checkout -q -b RT-3-Slug.x\n# %s --title x\ncat > a <<EOF\n%s --title x\nEOF\n' 'gh pr'' create' 'gh pr'' create' > "$OUT/own.sh"
report "SC-AK-1943 — ветка своего репозитория, комментарий и тело записи не судятся" "$(judge $DELIVERY "bash $OUT/own.sh")" прошло
printf 'grep -n "x; %s y" f\necho "\n%s --title x\n"\n' 'gh pr'' create' 'gh pr'' create' > "$OUT/said.sh"
report "SC-AK-1943 — заявка внутри кавычек сценария — текст" "$(judge $DELIVERY "bash $OUT/said.sh")" прошло
printf 'A=1 \\\n  %s --title "Без номера"\n' 'gh pr'' create' > "$OUT/two.sh"
report "SC-AK-1943 — заявка на второй строке вызова судится" "$(judge $DELIVERY "bash $OUT/two.sh")" отказ
cp "$OUT/open.sh" "$SF/tools/open.sh"
git -C "$SF" add -A && git -C "$SF" -c user.name=t -c user.email=t@e -c commit.gpgsign=false commit -qm open
report "SC-AK-1943 — сценарий дерева не читается" "$(judge $DELIVERY 'bash tools/open.sh')" прошло
report "SC-AK-1943 — чтение файла с текстом заявки проходит" "$(judge $DELIVERY "cat $OUT/open.sh")" прошло

suite_result "файл сценария за интерпретатором"
