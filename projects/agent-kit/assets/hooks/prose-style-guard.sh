#!/usr/bin/env bash
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: checks/check-prose-style.mjs, hooks/deny-tail.sh, hooks/write-targets.sh
# Prose guard: officialese and words that are not written in this tree do not reach the file.
#
# The rule about texts demands plain words, and this was held only by the memory of whoever writes:
# not one wording convention was checked. The owner reads what was written and sees machine prose
# where the convention demands human prose.
#
# Only the new text of the edit is judged, not the whole file: what has accumulated is fixed by a
# separate piece of work, and refusing an edit of a neighbouring line because of it would make the
# guard bypassed out of necessity.
#
# A write by a shell command is judged the same as one by the edit tool: the same text with the name
# of the shell instead of the name of the edit gave silence, and a document written by a heredoc
# went past the wording convention whole. The path is taken by the shared parse of write targets,
# and the new text is the body of the command — the written text stands inside it.
#
# FAIL-OPEN: no node, no check, a foreign tool, not `.md` → pass.

# Its own name in the observations: the refusal is recorded by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=prose-style-guard
RT_GUARD_RULE=doc-style

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0
command -v node >/dev/null 2>&1 || exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# The write targets are taken by the shared parse: the same sign serves the guard of the place of an
# edit, and two copies of it would let through different shapes of a write. No file — a silent
# default remains, so that the guard does not break on an incomplete layout.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/write-targets.sh" ] && . "$rt_hooks_dir/write-targets.sh" 2>/dev/null
command -v rt_write_targets >/dev/null 2>&1 || rt_write_targets() { cat >/dev/null; }

# The bodies of the heredocs of a command, one after another. The delimiter is taken as the shell
# takes it — quoted or bare — and everything up to the closing line is the written text.
rt_prose_heredoc_bodies() {
    awk -v q="'" '
        inside {
            if ($0 == tag) { inside = 0 } else { print }
            next
        }
        {
            s = $0
            re = "<<-?[ \t]*(\"[^\"]+\"|" q "[^" q "]+" q "|[A-Za-z_][A-Za-z0-9_]*)"
            while (match(s, re)) {
                t = substr(s, RSTART, RLENGTH)
                s = substr(s, RSTART + RLENGTH)
                sub(/^<<-?[ \t]*/, "", t)
                gsub(/\"/, "", t)
                gsub(q, "", t)
                tag = t
                inside = 1
            }
        }
    '
}

# The text a command without a heredoc brings with it: the whole command, part by part, less the parts
# of reading named below and the old wording of a `sed` replacement. Each part is a paragraph of its
# own: a chain of `sed -i` and checks read as one long sentence. A part not named is judged: an
# unknown form of a write must not become a way past the wording.
rt_prose_printed() {
    awk -v q="'" '
        # The text of a sed command without the patterns of its `s` replacements.
        function replaced(s,   out, i, c, d, p) {
            out = ""
            for (i = 1; i <= length(s); i++) {
                c = substr(s, i, 1); d = substr(s, i + 1, 1); p = substr(s, i - 1, 1)
                if (c != "s" || d !~ /[\/|#,@!:]/ || (i > 1 && p !~ /[ \t;"0-9$\/}{]/ && p != q)) { out = out c; continue }
                for (i += 2; i <= length(s) && substr(s, i, 1) != d; i++) { if (substr(s, i, 1) == "\\") { i++ } }
                out = out " "
            }
            return out
        }
        function flush(   head) {
            head = seg
            sub(/^[ \t]*((then|do|else|if|while|until|time|!|[{(]|[A-Za-z_][A-Za-z0-9_]*=[^ \t"\047]*[ \t])[ \t]*)*/, "", head)
            if (head ~ /^sed[ \t]/) { seg = replaced(seg) }
            if (head !~ /^(grep|egrep|rg|ls|cat|head|tail|sort|wc|cd|diff|test|\[|\[\[)([ \t]|$)/ || head ~ /<<<|[<>$]\(|`/) {
                gsub(/"/, "", seg); gsub(q, "", seg); print seg "\n"
            }
            seg = ""
        }
        { text = text $0 "\n" }
        END {
            n = length(text); quote = ""
            for (i = 1; i <= n; i++) {
                c = substr(text, i, 1)
                if (c == "\\" && quote != q && i < n) { seg = seg c substr(text, ++i, 1); continue }
                if (quote != "") {
                    if (c == quote) { quote = "" }
                } else if (c == "\"" || c == q) {
                    quote = c
                } else if (c == "#" && seg ~ /(^|[ \t])$/) {
                    # A comment: its apostrophe opens no quote.
                    while (i < n && substr(text, i + 1, 1) != "\n") { i++ }
                    continue
                } else if (c == "&" && (substr(text, i + 1, 1) == ">" || substr(text, i - 1, 1) == ">")) {
                    # A part of a redirect, not the end of a command.
                } else if (c == ";" || c == "&" || c == "\n" || c == "|") {
                    flush()
                    continue
                }
                seg = seg c
            }
            flush()
        }
    '
}

tool="$(rt_hook_tool)"
case "$tool" in
    Edit | Write | MultiEdit)
        path="$(rt_hook_file)"
        added="$(printf '%s' "$input" | jq -r '.tool_input.new_string // .tool_input.content // ([.tool_input.edits[]?.new_string] | join("\n")) // empty' 2>/dev/null)"
        ;;
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool)
        cmd="$(rt_hook_cmd)"
        [ -z "$cmd" ] && exit 0
        # The first document among the write targets. A command writing several is judged by one of
        # them: the text is one for the whole command, and a second refusal would repeat the first.
        path="$(printf '%s' "$cmd" | rt_write_targets | grep -m1 '\.md$')"
        # The new text is taken from the heredoc bodies of the command, not from the whole call.
        # A rewrite carrying the previous wording inside the call would otherwise be refused by
        # the words of that previous wording, and the refusal repeats at the second attempt. No
        # heredoc in the command — all of it but the parts that bring no text is judged.
        added="$(printf '%s' "$cmd" | rt_prose_heredoc_bodies)"
        [ -z "$added" ] && added="$(printf '%s' "$cmd" | rt_prose_printed)"
        ;;
    *) exit 0 ;;
esac

case "$path" in
    *.md) ;;
    *) exit 0 ;;
esac

# The judgement's boundary is the project root. A scratch document written outside it belongs to no
# repository, and the wording conventions of this tree are nobody's convention there: a fixture in
# the system temporary directory was refused over a word in it.
if [ -n "${CLAUDE_PROJECT_DIR:-}" ]; then
    case "$path" in
        /*)
            rt_root="$(cd "$CLAUDE_PROJECT_DIR" 2>/dev/null && pwd)"
            # A root that cannot be entered is taken as it was declared: the directory may be
            # absent on this machine, and that says nothing about where the document lies.
            [ -n "$rt_root" ] || rt_root="$CLAUDE_PROJECT_DIR"
            case "$path" in
                "$rt_root"/*) ;;
                *) exit 0 ;;
            esac
            ;;
    esac
fi

# The archive and the task folders are not judged: the archive is not edited at all, and the
# progress is written in haste and lives until the merge.
case "$path" in
    */docs/archive/* | */docs/tasks/* | docs/archive/* | docs/tasks/*) exit 0 ;;
esac

[ -z "$added" ] && exit 0
check=""
for candidate in "$rt_hooks_dir/../checks/check-prose-style.mjs" "$rt_hooks_dir/../rt-kit/checks/check-prose-style.mjs" "${CLAUDE_PROJECT_DIR:-.}/tools/check-prose-style.mjs"; do
    [ -f "$candidate" ] && check="$candidate" && break
done
[ -z "$check" ] && exit 0

tmp="$(mktemp -t prose)" || exit 0
printf '%s\n' "$added" > "$tmp"
found="$(node "$check" "$tmp" 2>&1 | grep -- '—' | sed 's|.*proba*[^:]*:|  line |' | head -8)"
rm -f "$tmp"
[ -z "$found" ] && exit 0

# The decision and the words come from the decision table; the check above is the fact, and the
# hook names what it found.
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 || exit 0
rt_decide prose-style-guard.sh write_dirty_md '{}' "$(jq -cn --arg s "$found" '{found:$s}')" PreToolUse "$input"
exit 0
