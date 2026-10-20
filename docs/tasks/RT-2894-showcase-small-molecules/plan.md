# Plan

**Task:** RT-2894 · **Branch:** RT-2894-showcase-small-molecules
**Behaviour:** unchanged — the stories move to another group of the showcase, the components and their look do not change. Подтверждено владельцем: «бери в работу эпик с правками по сторибуку».

## Task footprint

| What      | Where                                                                 |
| --------- | --------------------------------------------------------------------- |
| Specs     | none: the showcase groups are described by the task and the epic plan |
| Laws      | none                                                                  |
| Rules     | none                                                                  |
| Code      | `projects/ui-kit-v2/src/lib/components/*/stories/`, `*/Overview.mdx`  |
| Snapshots | `projects/ui-kit-v2/.storybook/__snapshots__`                         |

## What counts as done

- No story file carries the titles Organisms/Dialog/Confirm/ConfirmPopover, Organisms/FileDrop or
  Organisms/Buttons/SpeedMenu.
- No `Overview.mdx` links to their old addresses, and the confirm overview names the new group.
- The 17 snapshots carry the new names, and the snapshot run is green with no orphans.

## Stages

### 1. Titles and links

- **Steps:**
    1. Change the title in the five story files and in the `Meta` of the two `Overview.mdx`.
    2. Change the old links on every `Overview.mdx` and the group sentence of the confirm overview.
- **Readiness sign:** the search for the old titles and addresses finds nothing.
- **Verified by:** `grep -rIn -E "Organisms/(Dialog/Confirm/ConfirmPopover|FileDrop|Buttons/SpeedMenu)|organisms-(dialog-confirm-confirmpopover|filedrop|buttons-speedmenu)|Components → ConfirmPopover" projects/ui-kit-v2/src` — no lines.

### 2. Snapshots

- **Steps:**
    1. Rename the 17 snapshot files by `git mv` to the new names.
- **Readiness sign:** no snapshot carries the old names, 17 carry the new ones.
- **Verified by:** `ls projects/ui-kit-v2/.storybook/__snapshots__ | grep -c -E "^molecules-(dialog-confirmpopover|forms-filedrop|buttons-speedmenu)--"` — prints 17.

### 3. The check before the push

- **Steps:**
    1. Run the push gate set, the showcase snapshots included.
- **Readiness sign:** the push passes.
- **Verified by:** `git push` — the push gate lets the branch through.

## What this work does not do

- The `Organisms/Dialog/Confirm` story of the directive stays in organisms.
- The headers and footers of the panel and the window, the table column headers stay with their
  parents.
