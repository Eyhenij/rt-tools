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
- **the free scenario number** — `pnpm run spec:next-id <PREFIX>` (`tools/spec-next-id.mjs`), run before the heading is written; it reads the local and remote branches
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

- **The set of spec sections is fixed in advance, and a missing section is a refusal.** — `tools/spec-common.mjs:REQUIRED_HEADINGS` — the section set of a domain spec. For rules, patterns, pitfalls and skills the set is declared in `projects/agent-kit/tests/rules-review.test.sh:sections_for`, and its scenarios refuse a missing section.
- **Every statement is bound to a place in code, and the link is checked both ways.** — `tools/spec-anchors.mjs:checkRuleImplementation` — an article without a line and a line without an article are both named.
- **A binding does not lead into code nobody calls, and a test is not a call.** — `tools/spec-anchors.mjs:checkTracedAnchors` — liveness is counted by files that are not tests. The harness named by `harnessDirs` counts whole, and so does a published file. Liveness is judged only for symbols declared in `.ts`; the callers are looked for in `.ts` and `.html` under the source roots. An anchor in `.html`, in a `.mjs` check or in a shell hook is checked for existence alone.
- **A verdict is put by substance, not by the form of the address.** — **Not checked by anything.** `tools/spec-common.mjs:ANCHOR` judges the form only: it takes a file name with an extension and whole without a dot. Whether the verdict names the real reason is told by reading.
- **A "not carried out" binding moves together with its article.** — `tools/spec-anchors.mjs:checkRuleImplementation` — the audit names a binding without an item, and a companion line removed apart turns red exactly here.
- **The procedure table is checked against the decorators both ways, the permission together with the name.** — `tools/spec-contract.mjs:checkContract` — the code carries the article out. Here no spec names a procedure root (`**Procedures:** none` or the former form), so no table is matched against decorators. The audit still refuses any «Contract» table row whose first cell is in backticks, as a procedure the domain does not have — see the note below. The second kit's input tables are audited against the components by `tools/verify-ui-kit-v2-docs.cjs`.
- **There are two layers of laws, and a law name is one for both.** — `tools/check-specs.mjs:laws` — the shared layer in the root of the constitution, the application law in `application/`; the name is one for both layers.
- **Portable text speaks of a neighbouring resource conditionally and names it by name.** — **Not checked by anything.** An unconditional phrase about a neighbouring resource is indistinguishable to a machine from a conditional one: both are prose.
- **An article of a rule speaks of its own applicability itself, by a sign line at its side.** — `.claude/hooks/rule-article.sh:rt_rule_articles` — the signs are read over the whole rule file, and the sample is matched against the edit path by shell means.
- **An article without a sign is legitimate, and so is a rule without a single sign.** — `.claude/hooks/rule-article.sh:rt_rule_article_marks` — when not a single sign was found, it prints nothing, and the caller stays with the former refusal.
- **A pattern is found by the `rule:` field, not by the name prefix.** — `tools/check-specs.mjs:patterned` — patterns are gathered by the header field, and a rule without a single pattern is named.
- **A decision from a spec goes to the layer, not to the archive.** — **Not checked by anything.** A live requirement can be told from an account of what happened only by whoever asks whether this will still be true tomorrow.
- **A name in an anchor is written as declared in code.** — `tools/spec-common.mjs:ANCHOR` — a hash before the name is accepted; the name without it is remembered on a par with the name itself in `tools/spec-anchors.mjs:symbolOwners`.
- **An anchor is checked against the raw text of the file, and a comment counts the same as code.** — `tools/spec-anchors.mjs:fileHasSymbol` — the existence of a symbol is searched for as a word over the whole file, while liveness is counted only for what is declared in code.
- **A refusal code is accepted only if the domain throws it.** — `tools/spec-contract.mjs:checkRefusalCodes` — a code is accepted only with a throw site in the procedure roots of the domain. No spec here names a root, so the audit judges no code in this tree.
- **A spec has one scenario prefix, and across the whole tree it is taken by that spec alone.** — `tools/check-specs.mjs:prefixOwners` — nine prefixes, one per domain: `SC-AK`, `SC-AUTH`, `SC-CH`, `SC-CMS`, `SC-CR`, `SC-MB`, `SC-ST`, `SC-UKV`, `SC-UT`.
- **A scenario number is issued once and never reused.** — `tools/spec-scenarios.mjs:parseScenarios` gathers the domain's numbers but does not judge a repeated issue: a number given to a second scenario is just as lawful to it. Held by reading and by the PR review.
- **A scenario and the title of its test are edited by one change.** — `tools/spec-scenarios.mjs:collectReferences` sees only a lost reference; a title left over while the promise changed is green. Held by reading.
- **A subdomain is asked the same as a domain.** — `tools/check-specs.mjs:collectSpecDirs` — eight domains have subdomains — the count changes with every split and is asked by `find docs/specs -mindepth 3 -name spec.md -not -path '*/proposed/*' | cut -d/ -f3 | sort -u`; the mandatory sections and the companion are asked of them on a par with a domain.
- **A proposed law requires no rule.** — `tools/check-specs.mjs:isProposedLaw` — the sign is read from the status line in the law itself.
- **A law has a mandatory "Articles" section, and beyond it holds only open questions.** — `tools/check-specs.mjs:LAW_HEADINGS` — the absence of the articles section is named; the laws are edited in `projects/agent-kit/assets/laws/`, and the shape is held there.
- **A law that names a project file is a refusal.** — `tools/spec-common.mjs:CONSTITUTION_DIR` — every constitution file is checked for a path with an extension in backticks.
- **A rule description is no longer than three hundred characters and answers one question — load this rule or not.** — `tools/check-descriptions.mjs:main` — it counts the characters of every skill's description, the limit is `LIMIT`; the accepted debt is read from `.claude/rt-kit/description-debt.json`. The meaning of a description nobody judges at that.
- **A rule declares the law it is written under.** — `tools/check-specs.mjs:law` — a rule without the `law` field in its header is named, and so is a law without a single rule.
- **A divergence between a rule and its companion is resolved in favour of the rule.** — **Not checked by anything.** The agreement of two texts with one another is counted nowhere and by nothing: the layout matches a copy against a source, not the meaning of one text against the meaning of its neighbour
- **A companion's statement about the state of an external service is checked by the command the companion itself names.** — **Not checked by anything.** The path audit reads the addresses in the tree, while the state of a neighbouring service lives at the neighbour's; only a call can ask it, and it is the executor who makes it
- **A rule may have a third file, and what is not read when deciding goes there.** — `projects/agent-kit/src/lib/config.ts:PITFALLS_FILE` — the name of the third file; `projects/agent-kit/src/lib/assets.ts:targetOf` puts it next to the rule, `projects/agent-kit/src/lib/cascade.ts:pitfallsCutByRules` removes it after a dropped rule.
- **A spec declares the laws it applies, and the link is checked both ways.** — `tools/spec-anchors.mjs:checkSpecLaws` — the line `**Laws:**` (or the legacy `**Законы:**`) in `spec.md` is matched against the laws named in the spec text.

- **A check nailed to a resource name breaks when the resource is split, and this has to be known before the edit.** — **Not checked.** The resource names stand in `tools/check-states.mjs`, `tools/check-state-next.mjs` and in the suite probes under `projects/agent-kit/tests/`; a machine has nothing to tell a mention nailed to a name from a lawful one — it is found by a search over the whole tree before the split
- **The spec speaking of a resource is found by a command, not by walking the subdomains.** — `tools/specs-for.mjs:main` — the bindings of every companion under `docs/specs/`; the uncovered are counted by the directories of the key `packageDirs`

- **The first column of the companion is the article text copied, not retold.** — `tools/spec-anchors.mjs:checkRuleImplementation` — the article is looked for by its text, and a retold one is not found and turns red. The address next to a copied article is not judged: a line describing something else passes.

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
- **A private field is a binding, written with its hash.** The audit sample accepts `#name`, and
  the article "A name in an anchor is written as declared in code" is bound to it.
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
