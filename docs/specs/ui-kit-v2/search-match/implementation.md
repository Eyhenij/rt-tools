# What it is carried out by — the match rule of a search

The first column is the rule of the spec next to it verbatim.
The second is where it is carried out in the tree, with the scenario that checks it.
What covers every scenario is said in `scenarios.md`.

- **A row matches when every word of the query stands in its text, in any order.** — `projects/ui-kit-v2/src/lib/options/rt-search-match.ts:rtSearchMatches` — every word of the folded query is looked for in the folded text. Scenarios `SC-UKV-889`, `SC-UKV-890`
- **Case does not matter, and «ё» matches «е».** — `projects/ui-kit-v2/src/lib/options/rt-search-match.ts:rtSearchFold` — the text and the query are lowered and «ё» becomes «е» before the comparison. Scenario `SC-UKV-891`
- **A query of spaces alone is no query.** — `projects/ui-kit-v2/src/lib/options/rt-search-match.ts:rtSearchWords` — the query split on spaces gives no word. Scenario `SC-UKV-892`
- **The highlight marks every place where a word of the query stands, by the same rule.** — `projects/ui-kit-v2/src/lib/options/rt-match-parts.ts:rtMatchParts` — every occurrence of every word is marked, overlapping marks join, the pieces are cut from the original label. Scenario `SC-UKV-893`
- **Every search of the kit filters and marks by this rule.** — `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.ts:filterSideMenuItems`, `projects/ui-kit-v2/src/lib/options/rt-option-tree.ts:rtTreeRows`, `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.ts:selectableDynamicItems`, `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.logic.ts:rtTreeSelectorFilter` — each calls `rtSearchMatches`; the tag, the tree, the side menu, the dynamic selector and the chat cut their labels by `rtMatchParts`. Scenario `SC-UKV-894`
