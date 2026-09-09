# spec-driven — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. A separate file because the rule speaks by
technique and travels between repositories whole, while everything below is true only here and
goes stale at every renaming.

Here the tree not only applies the documentation layers but also produces them: the package
`@rt-tools/agent-kit` carries laws, rules and patterns to other repositories, and this tree is
their first consumer. So an edit of a rule has to be read twice: as an edit of one's own text and
as an edit of what leaves for foreign trees.

## What it is called here

- **In the rule** — Here
- **a law** — a file in `docs/constitution/`, laid out from the package
- **a rule** — `.claude/skills/<name>/SKILL.md` with the header `kind: rule` and a declared law
- **a pattern** — `.claude/skills/<rule>-<what>/SKILL.md` with the header `kind: pattern`
- **the tree's names next to a rule** — `implementation.md` beside the rule — this file is its very sample
- **a domain spec** — a directory in `docs/specs/<package>/` — `spec.md`, `scenarios.md`, `implementation.md`; the agreement of unclosed work lies in `proposed/<feature>/` next to it
- **an accepted decision** — a file in `docs/adr/`
- **a project override** — a file in `.claude/rt-kit/overrides/<resource>`, merged with the package text by `## ` sections

## Where it lives

- **the sources of the laws and rules** — `projects/agent-kit/assets/` — `laws/`, `rules/`, `patterns/`, `hooks/`, `templates/`
- **the layout and its check** — `projects/agent-kit/src/lib/` — `sync.ts`, `plan.ts`, `sections.ts`, `companion.ts`
- **the tree's choice** — `.claude/rt-kit.json` — the layout by kinds and the list of what the tree dropped
- **the overrides** — `.claude/rt-kit/overrides/`
- **the templates of a rule, a pattern and the names** — `.claude/rt-kit/templates/`
- **the law index at session entry** — `.claude/hooks/constitution-index.sh`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **The set of spec sections is fixed in advance, and a missing section is a refusal.** — `tools/check-specs.mjs:REQUIRED_HEADINGS` — the section set of a domain spec. For rules and patterns the set is given by the templates in `.claude/rt-kit/templates/` and is not held by a refusal.
- **Every statement is bound to a place in code, and the link is checked both ways.** — `tools/check-specs.mjs:checkRuleImplementation` — an article without a line and a line without an article are both named.
- **A binding does not lead into code nobody calls:** — `tools/spec-anchors.mjs:codeOf` — comments are cleared out, and a symbol declared in its own file and occurring nowhere else is named a dead binding.
- **A "not carried out" binding moves together with its article.** — `tools/check-specs.mjs:checkRuleImplementation` — the audit names a binding without an item, and a companion line removed apart turns red exactly here.
- **The procedure table is checked against the decorators both ways, the permission together with the name.** — **Not applicable.** There are no server-side procedures in the tree. The closest carrying out on another subject: `tools/verify-ui-kit-v2-docs.cjs` audits the input tables against the components themselves.
- **There are two layers of laws, and a law name is one for both.** — `tools/check-specs.mjs:laws` — the shared layer in the root of the constitution, the application law in `application/`; the name is one for both layers.
- **Portable text speaks of a neighbouring resource conditionally and names it by name.** — **Not checked by anything.** An unconditional phrase about a neighbouring resource is indistinguishable to a machine from a conditional one: both are prose.
- **An article of a rule speaks of its own applicability itself, by a sign line at its side.** — `.claude/hooks/rule-article.sh:rt_rule_articles` — the signs are read over the whole rule file, and the sample is matched against the edit path by shell means.
- **An article without a sign is legitimate, and so is a rule without a single sign.** — `.claude/hooks/rule-article.sh:rt_rule_article_marks` — when not a single sign was found, it prints nothing, and the caller stays with the former refusal.
- **A pattern is found by the `rule:` field, not by the name prefix.** — `tools/check-specs.mjs:patterned` — patterns are gathered by the header field, and a rule without a single pattern is named.
- **A decision from a spec goes to the layer, not to the archive.** — **Not checked by anything.** A live requirement can be told from an account of what happened only by whoever asks whether this will still be true tomorrow.
- **A name in an anchor is written as declared in code.** — `tools/spec-common.mjs:ANCHOR` — a hash before the name is accepted; the name without it is remembered on a par with the name itself in `tools/spec-anchors.mjs:symbolOwners`.
- **An anchor is checked against the raw text of the file, and a comment counts the same as code.** — `tools/spec-anchors.mjs:fileHasSymbol` — the existence of a symbol is searched for as a word over the whole file, while liveness is counted only for what is declared in code.
- **A refusal code is accepted only if the domain throws it.** — Not applicable: there is no server side and no refusal codes in the tree.
- **A spec has one scenario prefix, and across the whole tree it is taken by that spec alone.** — `tools/check-specs.mjs:prefixOwners` — `SC-AK` belongs to `docs/specs/agent-kit/`, `SC-UKV` to `docs/specs/ui-kit-v2/`.
- **A scenario number is issued once and never reused.** — `tools/check-specs.mjs:parseScenarios` gathers the domain's numbers but does not judge a repeated issue: a number given to a second scenario is just as lawful to it. Held by reading and by the PR review.
- **A scenario and the title of its test are edited by one change.** — `tools/check-specs.mjs:collectReferences` sees only a lost reference; a title left over while the promise changed is green. Held by reading.
- **A subdomain is asked the same as a domain.** — `tools/check-specs.mjs:collectSpecDirs` — three domains have subdomains: six in the rules package, three in the second kit, four in the receiver; the mandatory sections and the companion are asked of them on a par with a domain.
- **A proposed law requires no rule.** — `tools/check-specs.mjs:isProposedLaw` — the sign is read from the status line in the law itself.
- **A law has a mandatory "Articles" section, and beyond it holds only open questions.** — `tools/check-specs.mjs:LAW_HEADINGS` — the absence of the articles section is named; the laws are edited in `projects/agent-kit/assets/laws/`, and the shape is held there.
- **A law that names a project file is a refusal.** — `tools/check-specs.mjs:CONSTITUTION_DIR` — every constitution file is checked for a path with an extension in backticks.
- **A rule description is no longer than three hundred characters and answers one question — load this rule or not.** — `tools/check-descriptions.mjs:main` — it counts the characters of every skill's description, the limit is `LIMIT`; the accepted debt is read from `.claude/rt-kit/description-debt.json`. The meaning of a description nobody judges at that.
- **A rule declares the law it is written under.** — `tools/check-specs.mjs:law` — a rule without the `law` field in its header is named, and so is a law without a single rule.
- **A divergence between a rule and its companion is resolved in favour of the rule.** — **Not checked by anything.** The agreement of two texts with one another is counted nowhere and by nothing: the layout matches a copy against a source, not the meaning of one text against the meaning of its neighbour
- **A companion's statement about the state of an external service is checked by the command the companion itself names.** — **Not checked by anything.** The path audit reads the addresses in the tree, while the state of a neighbouring service lives at the neighbour's; only a call can ask it, and it is the executor who makes it
- **A rule may have a third file, and what is not read when deciding goes there.** — `projects/agent-kit/src/lib/config.ts:PITFALLS_FILE` — the name of the third file; `projects/agent-kit/src/lib/assets.ts:targetOf` puts it next to the rule, `projects/agent-kit/src/lib/cascade.ts:pitfallsCutByRules` removes it after a dropped rule.
- **A spec declares the laws it applies, and the link is checked both ways.** — `tools/check-specs.mjs:checkSpecLaws` — the line `**Законы:**` in `spec.md` is matched against the laws named in the spec text.

- **A check nailed to a resource name breaks when the resource is split, and this has to be known before the edit.** — **Not checked.** The resource names stand in `tools/check-states.mjs`, `tools/check-state-next.mjs` and in the suite probes under `projects/agent-kit/tests/`; a machine has nothing to tell a mention nailed to a name from a lawful one — it is found by a search over the whole tree before the split
- **The spec speaking of a resource is found by a command, not by walking the subdomains.** — `tools/specs-for.mjs:main` — the bindings of every companion under `docs/specs/`; the uncovered are counted by the directories of the key `portableDirs`

- **The first column of the companion is the article text copied, not retold.** — **Not checked.** `tools/check-specs.mjs` looks for the article by its text and turns red on one not found; a line standing next to the right article and describing something else is indistinguishable to the check from a right one

## What else is worth knowing when reading the code

- A laid-out file carries the header `rt-kit v… · <resource> · <checksum>` and is not edited by
  hand: an in-place edit is lost on the next layout, and `agent-kit sync` refuses over it and
  writes nothing at all — neither this file nor the rest.
- The project appends its own section by an override in `.claude/rt-kit/overrides/<resource>`;
  the merge goes by `## ` sections, so package edits arrive in every section the tree did not
  touch.
- While `implementation.md` holds the mark of an unfilled place, the rule counts as unfolded: the
  layout check refuses, and the agent reads an instruction with nothing to name here.
- The rule gate does not allow editing a file until the rule it falls under is loaded. The map
  "file — rule" of this tree is `.claude/rt-kit/gate-map.sh`.
- **A private field is never a binding: the audit sample accepts a symbol starting with a letter
  or an underscore.** The code-structure rule tells one to write a private field with a hash, and
  a rule carried out by such a field has to be bound to the public entry that calls it. The
  refusal says "an empty binding" at that — the same word as for a line not filled in at all, so
  by the refusal text the miss is indistinguishable from an unfilled place.
- **A table row in the contract section is read by the audit as a procedure.** The arguments of a
  command line, put as a table, the audit looks for among the declared procedures — and prints a
  divergence for each: four out of nowhere. A list instead of a table does not give this, and it
  has to be known before the section is written rather than from the audit's refusal.
- **A space inside backticks breaks a binding silently.** Aligning the table columns, it is easy
  to append spaces before the closing backtick; the sample does not accept them, and the aligned
  row looks right. The spaces go after the backtick, not under it.

## What this is checked by

- `pnpm run agent-kit:check` — what is laid out matches the package, the override and the
  filled-in state of the name files.
- `pnpm run agent-kit:sync` — the layout; a refusal on even one file writes nothing.
- `pnpm exec nx test @rt-tools/agent-kit` — the specs of the layout itself: the choice, the merge
  by sections, the decision about a file's fate.

- **A free scenario number is searched for in all branches.** — `tools/spec-next-id.mjs:main` — it
  reads the scenario headings in the local and remote branches and prints the first free one after
  the highest taken; it is called by `npm run spec:next-id [<prefix>]`
