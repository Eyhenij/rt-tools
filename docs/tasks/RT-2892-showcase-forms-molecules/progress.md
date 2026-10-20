# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The check before the push
- **Done:** 21 story and overview files retitled and relinked, 53 snapshots renamed, the level
  article of `rt-tools-storybook` names the form-field exception
- **Next step:** push the branch through the gate set
- **Uncommitted:** the owner's `.claude/rt-kit/assignments.md` row
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Change the title in the 14 story files and in the `Meta` of the seven `Overview.mdx`.
- [x] 1.2 Change the `organisms-…` links on every `Overview.mdx`.
- [x] 2.1 Rename the 53 snapshot files by `git mv` to the `molecules-forms-…` names.
- [>] 3.1 Run the push gate set, the showcase snapshots included.

## Decisions along the way

- **The level article of `rt-tools-storybook` gets a form-field exception.** It sent everything that
  opens an overlay to organisms, while `Select`, `DatePicker`, `Autocomplete` and `Multiselect`
  already stood in molecules with their panels: the tree followed one practice and the rule wrote
  another. The task follows the practice and the design system, so the rule is brought to it.
  Affected stage of the plan: 1.

## Sessions

### 2026-10-20

- The task taken under epic RT-2896.
