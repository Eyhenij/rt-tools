# The texts of the rules layer — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

The anchor here is the word that holds the statement. The audit looks for it across the whole file
and is satisfied by any word, so the name of a field from a foreign line passes it the same way the
needed sentence does — and the statement stays green when the text of the role itself is rewritten
whole.

- **The text of a rule names no paths, domains or ports of a tree it does not belong to.** — `projects/agent-kit/tests/texts.test.sh:found_domains`
- **The package carries the glossary as a resource, not only the hook that reads it.** — `projects/agent-kit/src/lib/config.ts:DEFAULT_LAYOUT`
- **The preamble before the glossary names the place where a word is created, not the file it prints.** — `projects/agent-kit/assets/hooks/glossary-load.sh:where` — the line is assembled before the printing and stands between the preamble and the body of the glossary; scenario SC-AK-819
- **The preamble derives the address of the override from the header of the glossary, it does not nail it in.** — `projects/agent-kit/assets/hooks/glossary-load.sh:resource` — the identifier of the resource is taken out of the first line of the file
- **The package carries the shared part of the glossary, the tree appends the subject part.** — `projects/agent-kit/src/lib/sections.ts:mergeDocuments`
- **A rule and a pattern are judged as a spec, not as a file of the agent.** — `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`
- **The steps of the work are numbered through, and the whole list of them lies in the rule of the conduct of work.** — `projects/agent-kit/assets/rules/task-flow.md:task-flow`
- **The rule about the styling of documents holds the section "A skill without a law".** — `projects/agent-kit/assets/rules/doc-style.md:doc-style`
- **A package resource does not describe the state of a tree as a fact.** — `projects/agent-kit/assets/rules/spec-driven.md:spec-driven`
- **The texts of the package are judged by the same set of requirements as the copies laid out into a tree.** — `projects/agent-kit/tests/rules-review.test.sh:missing_sections`
- **An unchosen edition is judged on a par with the chosen one.** — `projects/agent-kit/tests/rules-review.test.sh:KINDS_WITH_SECTIONS`
- **A resource without a mandatory section of its kind is a divergence.** — `projects/agent-kit/tests/rules-review.test.sh:missing_pitfalls`
- **The set of sections is declared per kind and named by name, it is not derived from a sample.** — `projects/agent-kit/tests/rules-review.test.sh:sections_for`
- **The section of the articles of a law is read under two names, English and Russian.** — `projects/agent-kit/assets/checks/check-specs.mjs:LAW_HEADINGS` — the suite of the package reads the same two names in `projects/agent-kit/tests/rules-review.test.sh:sections_for`; scenario SC-AK-906
- **The sample of a kind is judged by the declared set on a par with the corpus.** — `projects/agent-kit/tests/rules-review.test.sh:template_gaps`
- **A kind that has no set declared stays silent, it does not turn red.** — `projects/agent-kit/tests/rules-review.test.sh:KINDS_WITHOUT_SECTIONS`
- **An empty list of the debt is named aloud and with a number.** — `projects/agent-kit/tests/rules-review.test.sh:rules_without_pattern`
- **A rule without a pattern is a divergence.** — `projects/agent-kit/tests/rules-review.test.sh:rules_without_pattern`
- **The name of a neighbouring resource named in prose is checked on a par with a link of the header.** — `projects/agent-kit/tests/rules-review.test.sh:unknown_neighbours`
- **The bans of the texts act inside a code block too.** — `projects/agent-kit/tests/texts.test.sh:domains_in`
- **What counts as the address of a specific tree is what is listed, not everything that looks like a path.** — `projects/agent-kit/tests/texts.test.sh:COMMON_SEGMENTS`
- **The machine half turns red only on the countable.** — `projects/agent-kit/tests/rules-review.test.sh:suite_result`
- **The check of the package texts stands in the suite run before a push.** — `projects/agent-kit/src/lib/assets.spec.ts:expectGreen`
- **The review reads the family whole, not a file at a time.** — `projects/agent-kit/assets/agents/rules-reviewer.md:family`
- **The role gives back findings and edits nothing.** — `projects/agent-kit/assets/agents/rules-reviewer.md:tools`
- **A finding names two places verbatim and what they diverge by.** — `projects/agent-kit/assets/agents/rules-reviewer.md:verbatim`
- **A gap is looked for by reading, not by counting the bindings.** — `projects/agent-kit/assets/agents/rules-reviewer.md:gap`
- **The review is called in two ways: by a command by hand and by the machine half in the gate.** — `.claude/commands/rules-review.md:ARGUMENTS`
- **The graph draws the flow of a rule and lies in the text of the rule itself.** — `projects/agent-kit/assets/templates/rule.md:mermaid`
- **A graph is created for every rule, not only for a branching one.** — `projects/agent-kit/tests/rules-review.test.sh:sections_for`
- **The graph is edited by the same change as the prose it draws.** — `projects/agent-kit/assets/agents/rules-reviewer.md:mermaid`
- **A word declared forbidden by the glossary turns red by a check, not by proofreading.** — `projects/agent-kit/assets/checks/check-glossary.mjs:forbiddenWords` — the left column is read from the section of the glossary, it is not listed by the package; scenario SC-AK-690
- **A word of which one meaning of two is forbidden is not judged by a search and is named aloud.** — `projects/agent-kit/assets/checks/check-glossary.mjs:HINT` — a word with a refinement in brackets goes into the list of what is left to the reader; scenario SC-AK-691
- **The section of the forbidden words is found by two names: the English one and the Russian one.** — `projects/agent-kit/assets/checks/check-glossary.mjs:SECTIONS` — both names in one list, the first that matched is read; scenario SC-AK-904
- **The glossary holds a table of Russian names at the English terms.** — `projects/agent-kit/assets/docs/GLOSSARY.md:Russian` — the section "Russian names" of the package and "Russian names of this tree" of the override
- **A text for the owner is written in the words of the product, not in the words of the rules layer.** — `projects/agent-kit/assets/rules/doc-style.md:product` — an article of the section "Texts for a person"; scenario `SC-AK-837`
- **From the task it is visible what broke at a person, not only where a check is red.** — `projects/agent-kit/assets/patterns/doc-style-human.md:Task` — the samples "like this" and "not like this"; scenario `SC-AK-837`
- **The passive voice and metaphors are not written in these texts.** — `projects/agent-kit/assets/patterns/doc-style-human.md:въехало` — the sample "like this" and "not like this" in place; scenario `SC-AK-837`
- **The language of these three texts is checked by nothing.** — Not checked by a machine: the task lives at the hosting, the answer in the chat does not land in the tree, the description of the request is read by a person. This is held by the section "Texts for a person" of the rule `doc-style`.
- **A text has an addressee, and the wording is picked by them, not by what was written before it.** — `projects/agent-kit/assets/rules/doc-style.md:addressee` — an article of the rule; scenario `SC-AK-837`
- **A command publishing the body of a task or a request demands the rule of the wording.** — `projects/agent-kit/assets/defaults/gate-map.sh:doc-style-human` — scenario `SC-AK-850`
