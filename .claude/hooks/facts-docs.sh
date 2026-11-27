#!/usr/bin/env bash
# rt-kit v0.42.0 · hooks/facts-docs.sh · 8c27effca4d0 · правится надстройкой, не здесь
# The fact of the document pair: what a commit edits without the document that describes it. NOT a
# guard: it has no `rt-hook:` declaration and hooks into no agent event. The document guard decides
# by it, and the hooks of delivery name it first when their refusal names a commit.
#
#   rt_fact_doc_problems <command>
#
# Returns 1 when there is nothing to judge — not a commit of this tree, a declared bypass, no edits;
# otherwise 0, with `problems` holding the list of what is missing (empty — the pair holds),
# `first_doc` the first document awaited and `paths` the paths of the commit. Reads the tree profile
# the caller has loaded: `laws_dir`, `lib_marker`, `overrides_dir` and the profile functions.
#
# FAIL-OPEN: no git, not a repository — returns 1, and the caller judges nothing.

rt_fact_doc_problems() {
    # The names the analysis uses stay its own: the caller keeps its command, root and work directory.
    local cmd="$1" root companion dir from gone kept moved_added moved_deleted need_readme spec spec_paths spec_prefix to want workdir changes source_mode rule
    problems=''
    first_doc=''
    paths=''
    laws_dir="${laws_dir:-${RT_LAWS_DIR:-docs/constitution}}"
    lib_marker="${lib_marker:-${RT_LIB_MARKER:-project.json}}"
    overrides_dir="${overrides_dir:-${RT_OVERRIDES_DIR:-.claude/rt-kit/overrides}}"
    command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }
# The reason for the bypass stays in the history, so the bypass is lawful. An empty line does not
# count as a bypass: "Docs-skip:" without a reason is the same silent skip, only with a colon.
#
# The line starts a line — its own in the commit body, or a comment at the end of the command — and
# takes no substitutions. The same condition as for the bypass at the merge: otherwise a text that
# EXPLAINS the bypass lifts the requirement all by itself. A commit body about an edit of the guard
# names exactly this line, and without the binding to the start the guard would let such a commit
# through silently.
if printf '%s' "$cmd" | grep -qiE '(^|#)[[:space:]]*Docs-skip:[[:space:]]*[^[:space:]<"'"'"'][^[:space:]"'"'"']{2,}'; then
    return 1
fi

workdir="$(rt_hook_cwd)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || return 1
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || return 1

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

# `git commit -- <paths>` commits those paths alone, whatever else the index holds: the guard counts
# the set that travels, and a staged file left out of this commit is judged by the commit that takes
# it. The paths are given from the directory of the call, the list of edits from the root.
spec_paths="$(printf '%s\n' "$cmd" | sed -nE 's/.*git[[:space:]]+commit[^;&|]*[[:space:]]--[[:space:]]+([^;&|]+).*/\1/p' | head -1)"
if [ -n "$spec_paths" ]; then
    spec_prefix="$(git rev-parse --show-prefix 2>/dev/null)"
    kept=''
    for spec in $spec_paths; do
        spec="$(printf '%s' "$spec" | tr -d "\"'")"
        spec="${spec_prefix}${spec%/}"
        kept="${kept}$(printf '%s\n' "$changes" | awk -F'\t' -v s="$spec" '{ for (i = 2; i <= NF; i++) if ($i == s || index($i, s "/") == 1) { print; next } }')
"
    done
    changes="$(printf '%s' "$kept" | grep -v '^[[:space:]]*$' | sort -u)"
fi
[ -z "$changes" ] && return 1

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
# The first document the refusal awaits: the edit of it is the move the refusal names, and a
# neighbouring guard may hold that edit — the exam, the rule of the file, the handover entry.
first_doc=''
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
        add "the statements of \`$rule\` are edited without the companion — add \`$companion\` to the commit"
        [ -n "$first_doc" ] || first_doc="$companion"
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
        add "\`$file\` is edited without its document — the same commit awaits \`$want\`"
        [ -n "$first_doc" ] || first_doc="$(git ls-files -co --exclude-standard 2>/dev/null | grep -E "^${want}\$" | head -1)"
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
    [ -d "$root" ] || continue   # the lib was deleted whole — there is nothing to edit in it
    has_path "$root/README.md" || { add "the content of the lib \`$root\` changed without an edit of \`$root/README.md\`"; [ -n "$first_doc" ] || first_doc="$root/README.md"; }
done
    return 0
}
