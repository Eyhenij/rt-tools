#!/usr/bin/env bash
# rt-kit v0.10.0 · hooks/prose-style-guard.sh · 9d6ff4204c7d · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit
# Требует: checks/check-prose-style.mjs, hooks/deny-tail.sh
# Гард слога: канцелярит и слова, которых в этом дереве не пишут, не уезжают в файл.
#
# Правило о текстах требует простых слов, а держалось это памятью того, кто пишет: ни одна
# формулировочная договорённость не проверялась. Владелец читает написанное и видит машинный
# слог там, где договорённость требует человеческого.
#
# Судится только новый текст правки, а не файл целиком: накопленное чинится отдельной работой, и
# отбивать за него правку соседней строки — значит сделать гард обходимым по необходимости.
#
# FAIL-OPEN: нет узла, нет проверки, чужой инструмент, не `.md` → пропуск.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0
command -v node >/dev/null 2>&1 || exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"
case "$tool" in
    Edit | Write | MultiEdit) ;;
    *) exit 0 ;;
esac

path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
case "$path" in
    *.md) ;;
    *) exit 0 ;;
esac

# Описание прошлого и папки задач не судятся: архив не правится вовсе, а ход работы пишется
# наспех и живёт до слияния.
case "$path" in
    */docs/archive/* | */docs/tasks/*) exit 0 ;;
esac

added="$(printf '%s' "$input" | jq -r '.tool_input.new_string // .tool_input.content // ([.tool_input.edits[]?.new_string] | join("\n")) // empty' 2>/dev/null)"
[ -z "$added" ] && exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
check=""
for candidate in "$rt_hooks_dir/../checks/check-prose-style.mjs" "$rt_hooks_dir/../rt-kit/checks/check-prose-style.mjs" "${CLAUDE_PROJECT_DIR:-.}/tools/check-prose-style.mjs"; do
    [ -f "$candidate" ] && check="$candidate" && break
done
[ -z "$check" ] && exit 0

tmp="$(mktemp -t prose)" || exit 0
printf '%s\n' "$added" > "$tmp"
found="$(node "$check" "$tmp" 2>&1 | grep -- '—' | sed 's|.*proba*[^:]*:|  строка |' | head -8)"
rm -f "$tmp"
[ -z "$found" ] && exit 0

reason="BLOCKED by prose-style-guard: в новом тексте канцелярит или слово, которого в этом дереве не пишут.

${found}

Правь текст, а не обходи находку: замена названа у каждой. Слог — правило о текстах, и проверка видит перечисленные признаки, а не стиль вообще: чистый по ней абзац может быть плохим, но грязный плохой точно."

# Общий хвост отказа: два законных хода и законная форма обхода, если она у отказа есть.
# Файл может быть не разложен — тогда хвоста нет, а причина отказа остаётся прежней.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"prose-style-guard: канцелярит в новом тексте."}}\n'
exit 0
