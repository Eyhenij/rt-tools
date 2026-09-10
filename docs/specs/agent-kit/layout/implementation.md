# Laying resources out into the tree — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

The anchor here is the word that holds the statement. The audit looks for it across the whole file
and is satisfied by any word, so the name of a field from a foreign line passes it the same way the
needed sentence does — and the statement stays green when the text of the role itself is rewritten
whole.

- **The package checks what it carries, not only what it carries with.** — `projects/agent-kit/src/lib/assets.spec.ts:expectGreen`
- **A resource left without its kind is a refusal of the layout, not silence.** — `projects/agent-kit/src/lib/catalog.ts:variantGaps`
- **A layout from a stale build does not pass itself off as a fresh one.** — `projects/agent-kit/src/lib/freshness.ts:staleBuild`
- **What is laid out is checked by content, not by the number of the edition.** — `projects/agent-kit/src/lib/plan.ts:planFile`
- **The move of a foreign file under the package's management is made by a command, not by hand.** — `projects/agent-kit/src/lib/commands.ts:adopt`
- **An override of the check settings merges by nested keys.** — `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:mergeDeep`
- **The package does not know the layout of a foreign tree.** — `projects/agent-kit/assets/checks/lib-common.mjs:LIBS_ROOT`
- **The package does not know the words of a foreign tree either.** — `projects/agent-kit/assets/checks/lib-common.mjs:LIB_PREFIX`
- **The name of a lib is read from what the tree declared, not derived from its path.** — `projects/agent-kit/assets/checks/lib-common.mjs:declaredName` — scenario `SC-AK-1092`
- **The formula over the path speaks where the tree declared nothing.** — `projects/agent-kit/assets/checks/lib-common.mjs:libName` — scenario `SC-AK-1092`
- **The alias of a lib is looked for by what it points at, not by its spelling.** — `projects/agent-kit/assets/checks/lib-common.mjs:declaredAlias` — scenario `SC-AK-1092`
- **The first installation demands no prose written by hand.** — `projects/agent-kit/src/lib/companion.ts:draftOf`
- **A requirement of a resource is named in the resource itself, it is not derived by reading.** — `projects/agent-kit/src/lib/catalog.ts:requiresOf`
- **A broken link is a warning, not a refusal.** — `projects/agent-kit/src/lib/catalog.ts:brokenLinks`
- **The state report names the unpicked by name, not by a number.** — `projects/agent-kit/src/lib/commands.ts:doctor`
- **The state report prints the thresholds of the session window.** — `projects/agent-kit/src/lib/thresholds.ts:thresholdLines`
- **The package writes into no files belonging to the tree.** — `projects/agent-kit/README.md:observations`
- **Refusing a parent removes its children, and a surplus refusal line is declared a warning.** — `projects/agent-kit/src/lib/cascade.ts:cascadeCuts`
- **A law that did not get into the pick is rejected on a par with one named in the refusal.** — `projects/agent-kit/src/lib/catalog.ts:isChosen`
- **The cascade goes from the top down and only.** — `projects/agent-kit/src/lib/cascade.ts:cascadeCuts`
- **The link is taken from the preamble of the resources themselves.** — `projects/agent-kit/src/lib/catalog.ts:frontMatterOf`
- **What the cascade removed is named together with the parent.** — `projects/agent-kit/src/lib/commands.ts:doctor`
- **The package carries a law true of any tree of its class.** — `projects/agent-kit/src/lib/retired.ts:RETIRED`
- **A tree's refusal of a subject law is one line.** — `projects/agent-kit/src/lib/cascade.ts:chosenEntries`
- **A resource that left the package leaves together with its children.** — `projects/agent-kit/src/lib/integrity.ts:brokenLinks`
- **The package remembers the names that left it.** — `projects/agent-kit/src/lib/sync.ts:retiredOf`
- **What the cascade removed stays on the disk and is named apart from the abandoned.** — `projects/agent-kit/src/lib/sync.ts:leftOnDisk`
- **A short name from the preamble is resolved by the last link of the name inside its own kind.** — `projects/agent-kit/src/lib/cascade.ts:shortNameOf`
- **Two resources of one kind with the same last link of the name are a refusal of the set.** — **Не исполняется** — функция `ambiguousNames` написана и покрыта тестом, а ни установка файлов, ни `doctor` её не зовут: набор с двусмысленным именем проходит молча. Задача #2041.
- **A parent with several kinds is rejected only when not one of its kinds is picked.** — `projects/agent-kit/src/lib/cascade.ts:cascadeCuts`
- **A removed grandchild is named by both: by the nearest parent and by the rejected root.** — `projects/agent-kit/src/lib/cascade.ts:ICascadeCut`
- **A pick that takes nothing after the cascade is named aloud.** — `projects/agent-kit/src/lib/cascade.ts:namedButCut`
- **The parent is not in the catalogue — the cascade stays silent.** — `projects/agent-kit/src/lib/cascade.ts:cascadeCuts`
- **A link broken by the cascade itself is not counted as a warning.** — `projects/agent-kit/src/lib/catalog.ts:brokenLinks`
- **A warning of the layout is printed at any outcome of it.** — `projects/agent-kit/src/lib/commands.ts:warnings`
- **The layout names the added debt at the same moment it added it.** — `projects/agent-kit/src/lib/commands.ts:debtLines`
- **The articles are counted by the companion of the tree, not by the draft of the package.** — `projects/agent-kit/src/lib/companion.ts:unaddressedOf`
- **The count of the added debt is put together by a pure function.** — `projects/agent-kit/src/lib/companion.ts:debtLine`
- **A sample named by the text of the package is carried by the package too.** — `projects/agent-kit/src/lib/config.ts:KINDS`
- **The samples travel by a kind of resource of their own, not together with the override templates.** — `projects/agent-kit/src/lib/config.ts:TKind`
- **A tree has the right to name the samples a path of its own and to refuse them whole.** — `projects/agent-kit/src/lib/config.ts:DEFAULT_LAYOUT`
- **A sample carries the layout header on a par with the rest of the laid-out.** — `projects/agent-kit/src/lib/plan.ts:planFile`
- **The cold part of a rule is a kind of resource of its own, not a name inside the kind of the rules.** — `projects/agent-kit/src/lib/config.ts:PITFALLS_FILE`
- **"Pitfalls" is a section of the cold part, not of the rule.** — `projects/agent-kit/tests/rules-review.test.sh:sections_for`
- **The right to be executed at a file of the hooks directory is decided by the kind, not by the rights of the source.** — `projects/agent-kit/src/lib/sync.ts:HOOKS_KIND` — scenario SC-AK-886
