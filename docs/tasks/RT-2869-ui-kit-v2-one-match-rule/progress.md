# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The check before the push
- **Done:** the subdomain spec `search-match`; `rtSearchMatches` and `rtMatchParts` in
  `src/lib/options`; six places switched; 2927 tests, the typecheck and the lint green
- **Next step:** push the branch through the gate set
- **Uncommitted:** the owner's `.claude/rt-kit/assignments.md` row
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the subdomain spec `search-match` with its scenarios and companion, numbered from `SC-UKV-874`.
- [x] 1.2 Rewrite the search rules of the places that promised a phrase search.
- [x] 2.1 Write the match and the highlight functions in `src/lib/options` with tests on word order, case and «ё».
- [x] 2.2 Switch the six places to them and remove their own copies.
- [>] 3.1 Run the push gate set, the showcase snapshots included.

## Decisions along the way

- **One highlight function, not two.** `rtMatchParts` now cuts by every word of the query, and the
  phrase cut is gone: no place marks by the phrase under the rule. `rtMatchPartsByWords` from
  RT-2868 never left the epic branch, so nothing outside uses it. Affected stage of the plan: 2.
- **The dynamic selector gives up `dynamicSelectorMatches` and `dynamicMatchParts`, the tree
  selector `rtTreeSelectorWords`.** A wrapper with the old name would be a re-export of the rule
  in another form. No code in this tree calls these names. Affected stage of the plan: 2.
- **An empty label gives no pieces in the dynamic selector too.** Its own copy returned one empty
  piece; the popup never draws a row without a label, so nothing changes on the screen. Affected
  stage of the plan: 2.

## Sessions

### 2026-10-20

- The task taken under epic RT-2861 after RT-2868 was merged.
