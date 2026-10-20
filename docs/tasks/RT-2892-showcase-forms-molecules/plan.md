# Plan

**Task:** RT-2892 · **Branch:** RT-2892-showcase-forms-molecules
**Behaviour:** unchanged — the stories move to another group of the showcase, the components and their look do not change. Подтверждено владельцем: «бери в работу эпик с правками по сторибуку».

## Task footprint

| What      | Where                                                                 |
| --------- | --------------------------------------------------------------------- |
| Specs     | none: the showcase groups are described by the task and the epic plan |
| Laws      | none                                                                  |
| Rules     | `.claude/skills/rt-tools-storybook/`                                  |
| Code      | `projects/ui-kit-v2/src/lib/components/*/stories/`, `*/Overview.mdx`  |
| Snapshots | `projects/ui-kit-v2/.storybook/__snapshots__`                         |

## What counts as done

- No story file carries the titles Organisms/Forms/DateRange, DateRangePanel, ColorPalette,
  DynamicSelector, TreeSelector, HybridTreeSelector or Organisms/ImageUpload.
- No `Overview.mdx` links to their old addresses.
- The 53 snapshots carry the new names, and the snapshot run is green with no orphans.

## Stages

### 1. Titles and links

- **Steps:**
    1. Change the title in the 14 story files and in the `Meta` of the seven `Overview.mdx`.
    2. Change the `organisms-…` links on every `Overview.mdx`.
- **Readiness sign:** the search for the old titles and addresses finds nothing.
- **Verified by:** `grep -rIn -E "Organisms/(Forms/(DateRange|ColorPalette|DynamicSelector|TreeSelector|HybridTreeSelector)|ImageUpload)|organisms-(forms-(daterange|colorpalette|dynamicselector|treeselector|hybridtreeselector)|imageupload)" projects/ui-kit-v2/src` — no lines.

### 2. Snapshots

- **Steps:**
    1. Rename the 53 snapshot files by `git mv` to the `molecules-forms-…` names.
- **Readiness sign:** no snapshot carries the old names, 53 carry the new ones.
- **Verified by:** `ls projects/ui-kit-v2/.storybook/__snapshots__ | grep -c -E "^molecules-forms-(daterange|daterangepanel|colorpalette|dynamicselector|treeselector|hybridtreeselector|imageupload)--"` — prints 53.

### 3. The check before the push

- **Steps:**
    1. Run the push gate set, the showcase snapshots included.
- **Readiness sign:** the push passes.
- **Verified by:** `git push` — the push gate lets the branch through.

## What this work does not do

- The trees `Tree`, `HybridTree`, `DraggableTree` stay in organisms.
- The other two tasks of the epic, RT-2893 and RT-2894.
