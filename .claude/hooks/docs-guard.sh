#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/docs-guard.sh · adc9b12982e7 · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|NotebookEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/profile-check.sh, hooks/deny-tail.sh, hooks/guard-note.sh
# Guard of the pair "an edit and its document". PreToolUse.
#
# A divergence of the code from the text is soundless. Neither the linter, nor the build, nor the
# tests read the rules, the specs and the READMEs, so a text describing the previous arrangement
# lives on and looks like a working reference — the more convincingly, the older it is. It is
# caught only by reading, and it is usually the owner who catches it, not a check.
#
# The guard demands exactly those pairs where the link is mechanical and there is nothing to argue
# about:
#
#   a rule and its companion    — when the section with the statements is edited, not "Pitfalls";
#   creating and removing a lib — the README of that lib;
#   moving a file between libs  — the READMEs of both;
#   the rest of the pairs       — named by the tree profile, the function `rt_docs_pair_for <file>`.
#
# Apart from them — the laws. Whether the code came together with a law, a machine does not know:
# an edit of a file a law points to by an anchor is therefore not rejected but put to the owner as
# a question. The same question meets an edit of the law itself — both in place and through an
# override over it: a law describes a product agreement, and the guard does not let it be changed
# silently.
#
# The bypass is the line `Docs-skip: <reason>` in the commit body. The reason stays in the history
# and is visible when the branch is reviewed; an empty one is not accepted.
#
# FAIL-OPEN: not a repository, no parser, broken input, an empty list of files — let through.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=docs-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(rt_hook_tool)"

decide() {
    reason="$2"
    if [ "$1" = "deny" ]; then
        # shellcheck disable=SC1090
        [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
            && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
        if command -v rt_deny_tail >/dev/null 2>&1; then
            reason="$2

$(rt_deny_tail "строка \`Docs-skip: <причина>\` в теле коммита; пустая причина не принимается")"
        fi
    fi

    jq -n --arg d "$1" --arg r "$reason" \
        '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:$d,permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Документ едет тем же коммитом."}}\n'
    exit 0
}

# The tree profile: first the package default, and the project override on top of it, if there is
# one. A function declared in the override replaces the default whole and may call it back through
# the `_default` suffix.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# A word about a missing profile function: a hook that left silently is indistinguishable from a
# working one. The file may be not laid out — then the previous behaviour stays, the silent one.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

laws_dir="${RT_LAWS_DIR:-docs/constitution}"
lib_marker="${RT_LIB_MARKER:-project.json}"
overrides_dir="${RT_OVERRIDES_DIR:-.claude/rt-kit/overrides}"

# ── An edit of a law asks the owner ───────────────────────────────────────────
#
# The companion next to a law is the binding of the articles to the code; it goes stale on every
# rename and is edited freely. Only the text of the law itself is asked about.
#
# There are two paths to the text of a law, and the second is walked more often. A laid-out law is
# not edited in place at all: the edit is lost on the next layout, and the layout itself refuses it
# — so the override is edited, and the file of the law is rewritten by the layout. A guard that
# knows one laws directory watches exactly the path by which nobody goes to a law: the more
# involved the tree's override, the more rarely a law is edited in place. The override is asked
# about too — by its content it is an edit of the law, not of the wrapping.
case "$tool" in
    Edit | Write | MultiEdit | NotebookEdit | mcp__webstorm__create_new_file)
        target="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.filePath // .tool_input.path // .tool_input.pathInProject // empty' 2>/dev/null)"
        case "$target" in
            */"$laws_dir"/*.implementation.md | "$laws_dir"/*.implementation.md) exit 0 ;;
            */"$laws_dir"/*.md | "$laws_dir"/*.md)
                decide ask "Правка закона: \`${target##*/}\`. Закон описывает договорённость о продукте, а не устройство кода, — назови владельцу, что и почему меняешь, и дождись ответа. Если правка уже согласована, подтверди вызов."
                ;;
            */"$overrides_dir"/laws/*.implementation.md | "$overrides_dir"/laws/*.implementation.md) exit 0 ;;
            */"$overrides_dir"/laws/*.md | "$overrides_dir"/laws/*.md)
                decide ask "Правка закона надстройкой: \`${target##*/}\`. Разложенный файл переписывает раскладка, поэтому правка надстройки — это правка самого закона: назови владельцу, что и почему меняешь, и дождись ответа. Если правка уже согласована, подтверди вызов."
                ;;
        esac
        exit 0
        ;;
esac

# ── The commit ────────────────────────────────────────────────────────────────

# The environment terminal and the universal executor put the command in the same field.
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"

# The universal executor passes the real command as a nested string. It is that string that has to
# be parsed, otherwise the command name stands right after a quote and no rule reaches it.
if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
    inner="$(printf '%s' "$cmd" | perl -0ne '
        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -n "$inner" ] && cmd="$inner"
fi

case "$cmd" in
    *git\ commit*) ;;
    *) exit 0 ;;
esac

# The reason for the bypass stays in the history, so the bypass is lawful. An empty line does not
# count as a bypass: "Docs-skip:" without a reason is the same silent skip, only with a colon.
#
# The line starts a line — its own in the commit body, or a comment at the end of the command — and
# takes no substitutions. The same condition as for the bypass at the merge: otherwise a text that
# EXPLAINS the bypass lifts the requirement all by itself. A commit body about an edit of the guard
# names exactly this line, and without the binding to the start the guard would let such a commit
# through silently.
if printf '%s' "$cmd" | grep -qiE '(^|#)[[:space:]]*Docs-skip:[[:space:]]*[^[:space:]<"'"'"'][^[:space:]"'"'"']{2,}'; then
    exit 0
fi

workdir="$(rt_hook_cwd)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# `-a` takes all tracked edits, `--amend` takes the files of the rewritten commit as well. Always
# counting by the index would mean checking a set other than the one that travels into the history.
changes=''
source_mode='index'
case "$cmd" in
    *' -a'* | *--all*)
        changes="$(git diff HEAD --name-status -M 2>/dev/null)"
        source_mode='worktree'
        ;;
    *) changes="$(git diff --cached --name-status -M 2>/dev/null)" ;;
esac
case "$cmd" in
    *--amend*) changes="$(printf '%s\n%s' "$changes" "$(git show --name-status --format= HEAD 2>/dev/null)")" ;;
esac

changes="$(printf '%s\n' "$changes" | grep -v '^[[:space:]]*$')"
[ -z "$changes" ] && exit 0

# The paths of the commit without the statuses. A rename comes as three fields — we take both sides.
paths="$(printf '%s\n' "$changes" | awk -F'\t' '{ for (i = 2; i <= NF; i++) if ($i != "") print $i }' | sort -u)"

has_path() { printf '%s\n' "$paths" | grep -qxF "$1"; }

# The content as it will travel into the commit. The source is the same one the list of edits was
# collected by: `-a` takes the working tree, an ordinary commit takes the index. Always reading the
# index is not allowed — under `-a` the previous edition lies there, and the guard would hold the
# very commit that fixes the divergence; always reading the working tree is not allowed either — an
# unstaged edit will not get into the commit.
content_of() {
    if [ "$source_mode" = 'worktree' ]; then
        cat "$1" 2>/dev/null
    else
        git show ":$1" 2>/dev/null || cat "$1" 2>/dev/null
    fi
}

problems=''
add() { problems="${problems}
  • $1"; }

# ── 1. A rule and its companion ───────────────────────────────────────────────
#
# The statements of a rule are keyed by their own text, and a rewording without an edit of the
# companion breaks the link silently. The spec audit catches this, but it is run at the push gate —
# here the same pair meets a commit earlier, while the edit is still in the author's head.
#
# The section with the statements is the only thing linked to the companion; an edit of "Pitfalls"
# or of the "Where it lives" table does not touch it, so only this section is compared. The name of
# the section is double: English in a package rule, Russian in a rule written by the tree before the
# layer was translated. The end of the range is any heading not starting with their first letter.
STATEMENTS='/^## (How the law applies here|Как закон применяется здесь)$/,/^## [^КH]/'
statements_of() { content_of "$1" | awk "$STATEMENTS"; }

for rule in $(printf '%s\n' "$paths" | grep -E '/SKILL\.md$'); do
    grep -q '^kind: rule$' "$rule" 2>/dev/null || continue
    companion="${rule%/SKILL.md}/implementation.md"

    [ -f "$companion" ] || continue
    has_path "$companion" && continue

    if [ "$(statements_of "$rule")" != "$(git show "HEAD:$rule" 2>/dev/null | awk "$STATEMENTS")" ]; then
        add "утверждения \`$rule\` правятся без спутника — добавь в коммит \`$companion\`"
    fi
done

# ── 2. The pairs the tree names ───────────────────────────────────────────────
#
# The contract and the domain spec, a guard and its scenarios — which exactly, the profile knows:
# every tree has a link of its own, and the mechanics are one.
if rt_needs rt_docs_pair_for docs-guard; then
    while IFS= read -r file; do
        [ -z "$file" ] && continue

        # A file put in place by the layout demands no pair: it has one author in a consuming tree
        # — the package, and the document about it lies there as well. Otherwise the very first
        # layout demands a bypass over its whole volume, and a bypass declared over a hundred files
        # lifts the requirement from future hand edits of those files too. The sign is the layout
        # header: it stands in every laid-out file and tells it apart more reliably than any list
        # of paths.
        if [ -f "$file" ] && head -12 "$file" 2>/dev/null | grep -qE 'rt-kit v[^ ]+ · [^ ]+ · [0-9a-f]+'; then
            continue
        fi

        want="$(rt_docs_pair_for "$file" 2>/dev/null)"
        [ -z "$want" ] && continue
        # The pair counts as arrived if at least one file of the commit fits the pattern.
        printf '%s\n' "$paths" | grep -qE "$want" && continue
        add "\`$file\` правится без документа — тем же коммитом ждёт \`$want\`"
    done <<EOF
$paths
EOF
fi

# ── 3. A lib and its README ───────────────────────────────────────────────────

lib_root() {
    dir="${1%/*}"
    while [ -n "$dir" ] && [ "$dir" != "." ]; do
        [ -f "$dir/$lib_marker" ] && { printf '%s' "$dir"; return 0; }
        case "$dir" in */*) dir="${dir%/*}" ;; *) dir='' ;; esac
    done

    return 1
}

need_readme=''
want_readme() {
    root="$1"
    [ -n "$root" ] || return 0
    case " $need_readme " in *" $root "*) return 0 ;; esac
    need_readme="$need_readme $root"
}

# Creating and removing a lib: the README is the only place where it is written what lies in it and
# who calls it, and it survives the layout only together with an edit of that text.
while IFS="$(printf '\t')" read -r status first second; do
    case "$status" in
        A* | D*)
            case "$first" in */"$lib_marker") want_readme "${first%/"$lib_marker"}" ;; esac
            ;;
        R*)
            # A move of a file changes both sides: from one lib it disappeared, in the other it
            # appeared.
            from="$(lib_root "$first")" && to="$(lib_root "$second")"
            if [ -n "$from" ] && [ -n "$to" ] && [ "$from" != "$to" ]; then
                want_readme "$from"
                want_readme "$to"
            fi
            ;;
    esac
done <<EOF
$changes
EOF

# A move given as the pair "deleted there, added here": not everything that is a rename counts as
# one — an edit of the content while moving throws the search off.
moved_added="$(printf '%s\n' "$changes" | awk -F'\t' '$1 ~ /^A/ { n = split($2, p, "/"); print p[n] "\t" $2 }' | sort -u)"
moved_deleted="$(printf '%s\n' "$changes" | awk -F'\t' '$1 ~ /^D/ { n = split($2, p, "/"); print p[n] "\t" $2 }' | sort -u)"
if [ -n "$moved_added" ] && [ -n "$moved_deleted" ]; then
    while IFS="$(printf '\t')" read -r base added; do
        [ -n "$base" ] || continue
        gone="$(printf '%s\n' "$moved_deleted" | awk -F'\t' -v b="$base" '$1 == b { print $2; exit }')"
        [ -n "$gone" ] || continue
        to="$(lib_root "$added")" || continue
        from="$(lib_root "$gone")" || continue
        [ "$from" = "$to" ] && continue
        want_readme "$from"
        want_readme "$to"
    done <<EOF
$moved_added
EOF
fi

for root in $need_readme; do
    [ -d "$root" ] || continue   # либу удалили целиком — править в ней нечего
    has_path "$root/README.md" || add "состав либы \`$root\` изменился без правки \`$root/README.md\`"
done

if [ -n "$problems" ]; then
    decide deny "BLOCKED: коммит правит код, но не документ, который его описывает.
${problems}

Текст правится в той же ветке, что и код: документ, разошедшийся с деревом, выглядит действующей справкой и уводит следующего читателя. Если правка документа здесь действительно не нужна — назови причину строкой \`Docs-skip: <причина>\` в теле коммита, она останется в истории."
fi

# ── 4. The laws ───────────────────────────────────────────────────────────────
#
# There is nothing to reject: whether the edit came together with a law is visible only by reading.
# But the place where an article of a law is carried out is named by an anchor, and an edit of
# exactly that file is the only moment when the audit is still cheap to do.
#
# There are two layers of laws: the shared one in the root, an application law in a directory under
# it. The pattern accepts both, otherwise an edit of a subject law would count as an edit past the
# laws.
if [ -d "$laws_dir" ] && ! printf '%s\n' "$paths" | grep -qE "^${laws_dir}/([^/]+/)?[^/]+\.md$"; then
    touched=''
    for anchor in $(grep -ohE '`[A-Za-z0-9_./@-]+\.(ts|mjs|html|scss|prisma|proto|json)(:[A-Za-z0-9_#.-]+)?`' "$laws_dir"/*.implementation.md 2>/dev/null \
        | tr -d '`' | sed 's/:.*//' | grep '/' | sort -u); do
        has_path "$anchor" && touched="${touched}
  • \`$anchor\`"
    done

    if [ -n "$touched" ]; then
        decide ask "Правка задевает места, где исполняются статьи законов:
${touched}

Законы лежат в \`${laws_dir}/\`, привязка — в спутниках рядом. Прочитай закон и скажи владельцу, сошлась ли с ним правка: если правка его уточняет или ему противоречит, закон правится в этой же ветке, но только с его ведома. Если закон не изменился — подтверди вызов."
    fi
fi

exit 0
