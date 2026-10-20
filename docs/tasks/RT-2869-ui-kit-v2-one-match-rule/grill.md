# Grill

## The owner request

> Делай RT-2861

The second task of epic RT-2861. The task body (#2869): the search is written five times with two
meanings. A query «отчёт март» filters the side menu and the tree by the whole phrase and
highlights by words, so a user sees highlighted words in rows the phrase should not keep, and
does not find a row whose words stand in another order. The task picks one match rule for the kit,
writes it in the shared module with a spec, and every place takes it.

## What the tree already has

- **By the whole phrase:** `filterSideMenuItems` in the side-menu logic and `matches` in
  `options/rt-option-tree.ts`. The tree walk serves `rt-select`, `rt-multiselect` and `rt-tree`.
- **By every word:** `dynamicMatches` in the dynamic-selector logic and the tree-selector filter.
- **Highlight:** `rtMatchPartsByWords` in `options/rt-match-parts.ts` and `dynamicMatchParts` in
  the dynamic-selector logic.
- No place folds «ё» into «е» today.

## Questions and answers

- **Which rule?** The epic plan: every word of the query, in any order, case-insensitive — two
  fields already search so, and the highlight works so.
- **Does «ё» match «е»?** Yes, by the recommended option. The question menu did not reach the
  owner: the question guard refused it three times in the turn. People often type «е» for «ё»,
  and the owner can reverse this in the same branch before the merge.
- **Do the select and the multiselect move to the rule too?** Yes, by the recommended option and
  for the same reason: they search through the shared tree walk, and one rule for the kit is the
  goal of the epic.
- **Behaviour changes?** Yes: the side menu and the tree find rows whose words stand in another
  order. The release note names it.
- **Done sign:** one match function in the shared module, every search place calls it, tests on
  word order, case and «ё».
- **Not part of it:** the option-list controller (RT-2870).
