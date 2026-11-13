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
mkdir -p "$A/laws" "$A/rules" "$A/patterns" "$A/pitfalls" "$A/hooks" "$A/checks" "$A/docs" "$A/agents" \
    "$TREE/companions/guarded" "$TREE/companions/linted" "$TREE/companions/unguarded" "$TREE/specs/area"

printf -- '---\nname: verifiability\nkind: law\n---\n\n# Law\n\nA Gate stands here.\n' > "$A/laws/verifiability.md"
printf -- '---\nname: guarded\nkind: rule\nlaw: verifiability\n---\n\n**Requires:** `hooks/edit-guard.sh`\n\nCold part: `pitfalls.md` next to it.\n\n- **The edit is refused by the guard before it lands in the tree.**\n' > "$A/rules/guarded.md"
printf -- '---\nname: unguarded\nkind: rule\nlaw: verifiability\n---\n\n# Rule\n\nSee `guarded`.\n' > "$A/rules/unguarded.md"
printf -- '---\nname: guarded-new\nkind: pattern\nrule: guarded\n---\n\nUnder `guarded`.\n\n- **The edit is refused by the guard before it lands in the tree at all.**\n' > "$A/patterns/guarded-new.github.md"
printf '# Pitfalls\n' > "$A/pitfalls/guarded.md"
printf -- '---\nname: linted\nkind: rule\nlaw: verifiability\n---\n\n# Rule\n' > "$A/rules/linted.md"
printf -- '---\nname: reviewer\ndescription: reads\n---\n\n# Role\n' > "$A/agents/reviewer.md"
printf '#!/usr/bin/env bash\n# Requires: hooks/tail.sh, agents/reviewer.md\n' > "$A/hooks/edit-guard.sh"
printf '#!/usr/bin/env bash\n' > "$A/hooks/tail.sh"
printf '#!/usr/bin/env bash\n' > "$A/hooks/bound-guard.sh"
printf '// lonely\n' > "$A/checks/lonely.config.mjs"
printf "import { x } from './shared.mjs';\n" > "$A/checks/check-thing.mjs"
printf '// shared\n' > "$A/checks/shared.mjs"
printf -- '- **Lint.** — `tools/eslint-rules/rules/no-thing.ts:create`\n' > "$TREE/companions/linted/implementation.md"
printf -- '## Where the articles are carried out\n\n- **Held by memory.** — **Not checked by anything.**\n- **Not here.** — Not applicable: no such thing\n- **Bound.** — `docs/notes.md`\n' > "$TREE/companions/unguarded/implementation.md"
printf -- '---\nname: foreign\nkind: rule\nlaw: verifiability\n---\n\n# Rule\n' > "$A/rules/foreign.md"
printf '// board\n' > "$A/checks/board-gh.github.mjs"
printf '# Glossary\n\n## Rules layer\n\n- **Gate** — a guard\n- **Issue (of a task)** — a task\n- **Seance** — never said\n\n## Not written here\n\n- **Ticket** — not written\n' > "$A/docs/GLOSSARY.md"
printf -- '- **An edit is refused.** — `.claude/hooks/bound-guard.sh:refuse`\n' > "$TREE/companions/guarded/implementation.md"
printf '# Spec\n\nThe issue is opened by `unguarded`, the board by `board-gh.github.mjs:process`.\n' > "$TREE/specs/area/spec.md"

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
report "a variant file name reaches its resource" "$(has_link 'area mentions board-gh.mjs')" 'yes'
report "a mention adds nothing to a link by header" "$(links | grep -c '^guarded-new mentions guarded$')" '0'
report "glossary words stay out of the links" "$(links | grep -c 'uses_term')" '0'
report "a hook names what it needs in its own header" "$(has_link 'edit-guard.sh requires tail.sh')" 'yes'
report "a text resource is reached by its path" "$(has_link 'edit-guard.sh requires reviewer')" 'yes'
report "a check reaches its module by import" "$(has_link 'check-thing.mjs imports shared.mjs')" 'yes'
report "a rule reaches its cold part by «pitfalls.md»" "$(has_link 'guarded mentions guarded')" 'yes'
report "a mention of a rule does not reach its pitfalls" "$(links | grep -c '^unguarded mentions guarded$')" '1'
report "a check keeps the middle of its file name" "$(node -e 'console.log(require(process.argv[1]).nodes.some((n) => n.name === "lonely.config.mjs"))' "$TREE/out/graph.json")" 'true'

report "the report lists a resource nothing names" "$(in_section 'Resources nothing links to' 'lonely.config.mjs')" 'yes'
report "the report does not list a named one" "$(in_section 'Resources nothing links to' 'edit-guard.sh')" 'no'
report "the report lists a rule nothing executes" "$(in_section 'Rules nothing executes' 'unguarded')" 'yes'
report "the report does not list an executed rule" "$(in_section 'Rules nothing executes' 'guarded,')" 'no'
report "a rule bound to a linter rule is executed" "$(in_section 'Rules nothing executes' 'linted')" 'no'
report "a rule this tree does not lay out is no unexecuted rule" "$(section 'Rules nothing executes' | grep -c '^- .*foreign')" '0'
report "it is named apart as not laid out" "$(section 'Rules nothing executes' | grep -c 'Not laid out in this tree.*foreign')" '1'
report "the report does not list a rule with a companion of its own as not laid out" "$(section 'Rules nothing executes' | grep -c 'Not laid out.*unguarded')" '0'
report "an article marked not checked is counted with all the articles" "$(in_section 'Articles nothing carries out' '- unguarded — 1 of 3')" 'yes'
report "an article not applicable is no debt" "$(section 'Articles nothing carries out' | head -1)" '## Articles nothing carries out — 1'
report "a glossary word is found without its gloss in brackets" "$(in_section 'Glossary words used nowhere' 'Issue')" 'no'
report "a word not written here is no glossary word" "$(in_section 'Glossary words used nowhere' 'Ticket')" 'no'
report "the report lists a glossary word no text says" "$(in_section 'Glossary words used nowhere' 'Seance')" 'yes'
report "the report pairs two texts stating the same thing" "$(in_section 'Texts that state the same thing' 'guarded-new.github.md')" 'yes'

suite_result "the graph of concepts and rules"
