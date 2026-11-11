#!/usr/bin/env bash
# The scenarios of the graph of concepts and rules: which links the builder reads from the texts of
# the package and what its report lists.
#
# Why they exist. The builder runs on this tree, where every kind of link is present today. A kind it
# stops reading leaves the graph thinner and the report shorter, and a shorter report reads as a
# revision that worked.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the graph of concepts and rules"

TREE="$(mktemp -d)"
trap 'rm -rf "$TREE"' EXIT
A="$TREE/assets"
mkdir -p "$A/laws" "$A/rules" "$A/patterns" "$A/pitfalls" "$A/hooks" "$A/checks" "$A/docs" \
    "$TREE/companions/guarded" "$TREE/specs/area"

printf -- '---\nname: verifiability\nkind: law\n---\n\n# Law\n\nA Gate stands here.\n' > "$A/laws/verifiability.md"
printf -- '---\nname: guarded\nkind: rule\nlaw: verifiability\n---\n\n**Requires:** `hooks/edit-guard.sh`\n\n- **The edit is refused by the guard before it lands in the tree.**\n' > "$A/rules/guarded.md"
printf -- '---\nname: unguarded\nkind: rule\nlaw: verifiability\n---\n\n# Rule\n\nSee `guarded`.\n' > "$A/rules/unguarded.md"
printf -- '---\nname: guarded-new\nkind: pattern\nrule: guarded\n---\n\n- **The edit is refused by the guard before it lands in the tree at all.**\n' > "$A/patterns/guarded-new.github.md"
printf '# Pitfalls\n' > "$A/pitfalls/guarded.md"
printf '#!/usr/bin/env bash\n' > "$A/hooks/edit-guard.sh"
printf '#!/usr/bin/env bash\n' > "$A/hooks/bound-guard.sh"
printf '// lonely\n' > "$A/checks/lonely.config.mjs"
printf '# Glossary\n\n## Rules layer\n\n- **Gate** — a guard\n- **Issue (of a task)** — a task\n- **Seance** — never said\n\n## Not written here\n\n- **Ticket** — not written\n' > "$A/docs/GLOSSARY.md"
printf -- '- **An edit is refused.** — `.claude/hooks/bound-guard.sh:refuse`\n' > "$TREE/companions/guarded/implementation.md"
printf '# Spec\n\nThe issue is opened by `unguarded`.\n' > "$TREE/specs/area/spec.md"

(cd "$TREE" && node "$TOOLS/rules-graph.mjs" --assets assets --companions companions --specs specs --out out >/dev/null)

# The links of the graph as `source relation target`, one per line.
links() {
    node -e '
        const g = require(process.argv[1]);
        const name = Object.fromEntries(g.nodes.map((n) => [n.id, n.name]));
        for (const l of g.links) console.log(`${name[l.source]} ${l.relation} ${name[l.target]}`);
    ' "$TREE/out/graph.json"
}
has_link() { if links | grep -qxF "$1"; then printf 'yes'; else printf 'no'; fi; }
section() { sed -n "/^## $1/,/^## /p" "$TREE/out/REPORT.md"; }
in_section() { if section "$1" | grep -qF -- "$2"; then printf 'yes'; else printf 'no'; fi; }

report "a rule is joined to its law by its header" "$(has_link 'guarded applies_law verifiability')" 'yes'
report "a pattern is joined to its rule by its header, the variant suffix off" "$(has_link 'guarded-new pattern_of guarded')" 'yes'
report "a pitfalls file is joined to its rule" "$(has_link 'guarded pitfalls_of guarded')" 'yes'
report "the Requires line names an executor" "$(has_link 'guarded requires edit-guard.sh')" 'yes'
report "a companion binding names an executor" "$(has_link 'guarded executed_by bound-guard.sh')" 'yes'
report "a name in backticks is a mention" "$(has_link 'unguarded mentions guarded')" 'yes'
report "a spec is a text with its own links" "$(has_link 'area mentions unguarded')" 'yes'
report "a glossary word is found without its gloss in brackets" "$(has_link 'area uses_term Issue (of a task)')" 'yes'
report "a word not written here is no glossary word" "$(links | grep -c ' Ticket$')" '0'
report "a check keeps the middle of its file name" "$(node -e 'console.log(require(process.argv[1]).nodes.some((n) => n.name === "lonely.config.mjs"))' "$TREE/out/graph.json")" 'true'

report "the report lists a resource nothing names" "$(in_section 'Resources nothing links to' 'lonely.config.mjs')" 'yes'
report "the report does not list a named one" "$(in_section 'Resources nothing links to' 'edit-guard.sh')" 'no'
report "the report lists a rule nothing executes" "$(in_section 'Rules nothing executes' 'unguarded')" 'yes'
report "the report does not list an executed rule" "$(in_section 'Rules nothing executes' 'guarded,')" 'no'
report "the report lists a glossary word no text says" "$(in_section 'Glossary words used nowhere' 'Seance')" 'yes'
report "the report pairs two texts stating the same thing" "$(in_section 'Texts that state the same thing' 'guarded-new.github.md')" 'yes'

suite_result "the graph of concepts and rules"
