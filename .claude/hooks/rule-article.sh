#!/usr/bin/env bash
# rt-kit v0.29.0 · hooks/rule-article.sh · 7d6519c66cc6 · правится надстройкой, не здесь
# Parsing the applicability sign of a rule article. A helper: it declares no event of its own, and
# is sourced by whoever needs the text of an article — the rules gate in its refusal.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The rules gate
# sources it: an article says whether it applies itself, and the parsing of that lives here.
#
# A rule weighs from twenty to sixty kilobytes, while one of its articles covers a particular edit.
# A refusal that calls the whole rule pays the full price of the rule for the decision — and teaches
# the wrong thing: it is cheaper to read nothing extra, that is, to work less well explored.
#
# The sign stands at the article itself: the gate map knows the path and the rule, but does not know
# which of two dozen articles is about that path. An article knows everything about itself.
#
#   - **The article heading.** The text of the article, as usual.
#     <!-- rt-when: *.scss *.css -->
#
# The comment is not visible in the assembled markup and does not get in the way of reading the
# article; the patterns are separated by a space and are matched against the edit path by the shell
# itself, not by a word search: a search names the wrong article and says nothing about it.
#
# FAIL-OPEN: an article without a sign is lawful, and so is a rule without a single sign. If not one
# fitting article was found — nothing is printed, and the caller is left with the refusal it had.

# The articles of a rule whose sign matched the edit path. Arguments: the rule file, the edit path.
# Prints the text of the fitting articles whole, article by article, separated by an empty line.
rt_rule_articles() {
    rule_file="$1"
    edited="$2"
    [ -f "$rule_file" ] || return 0
    [ -n "$edited" ] || return 0

    # The articles are picked in two passes: first the line numbers where the signs stand and the
    # patterns themselves, then the text of the article whose pattern matched. The matching is done
    # by the shell: `case` knows the rules of paths, a text parser does not.
    while IFS=' ' read -r line patterns; do
        [ -n "$line" ] || continue
        hit=''
        # The patterns are parsed with name expansion switched off: `*.scss` in the loop would
        # expand into the file names of the working directory, and the article would be picked by
        # where the call stood. The separator is set right here — an outer one could have been
        # redefined by whoever called us.
        set -f
        old_ifs="$IFS"
        IFS=' '
        # shellcheck disable=SC2086
        set -- $patterns
        IFS="$old_ifs"
        set +f
        for pattern in "$@"; do
            [ -n "$pattern" ] || continue
            # shellcheck disable=SC2254
            case "$edited" in
                $pattern) hit=1; break ;;
            esac
            # A pattern without a directory is matched against the file name too: an article says
            # "about files like these", while an edit arrives as a full path.
            # shellcheck disable=SC2254
            case "${edited##*/}" in
                $pattern) hit=1; break ;;
            esac
        done
        [ -n "$hit" ] || continue
        rt_rule_article_at "$rule_file" "$line"
    done <<EOF
$(rt_rule_article_marks "$rule_file")
EOF
}

# The signs of a rule: a line of "line number — patterns". A function of its own, because the
# completeness check of the texts calls the same one: a rule whose sign is written in the wrong form
# quietly stays without an article in the refusal, and there is nothing to notice that by.
rt_rule_article_marks() {
    [ -f "$1" ] || return 0
    grep -n 'rt-when:' "$1" 2>/dev/null \
        | sed -e 's/^\([0-9]*\):.*rt-when:[[:space:]]*/\1 /' -e 's/[[:space:]]*-->.*$//'
}

# The text of the article inside which the line with the sign stands. An article begins at the
# nearest top-level list item above and ends before the next such item or before a line without
# indentation: the continuation of an article always goes with indentation.
# The heading of an article is its bold first phrase. The gate refusal names articles by it and does
# not retell them by their body: the session loads the rule next, and the body would come into the
# context a second time. For the rule about texts the refusal printed 4,134 characters in eleven
# articles, their headings — 718.
#
# The heading is no ornament: the binding of a statement to code goes by it, and it also names the
# article in the refusal so that it can be found in the rule by eye.
rt_rule_article_heads() {
    rule_file="$1"
    edited="$2"
    rt_rule_articles "$rule_file" "$edited" 2>/dev/null | grep -o '^- \*\*[^*]*\*\*' 2>/dev/null
}

rt_rule_article_at() {
    LC_ALL=C awk -v mark="$2" '
        NR <= mark && /^- / { start = NR }
        { line[NR] = $0 }
        END {
            if (!start) { exit }
            for (i = start + 1; i <= NR; i++) {
                if (line[i] ~ /^- / || (line[i] !~ /^[ \t]/ && line[i] != "")) { break }
                stop = i
            }
            if (!stop) { stop = start }
            last = start
            for (i = start; i <= stop; i++) {
                if (line[i] ~ /rt-when:/) { continue }
                if (line[i] == "" && i == stop) { continue }
                print line[i]
                last = i
            }
            print ""
        }
    ' "$1" 2>/dev/null
}
