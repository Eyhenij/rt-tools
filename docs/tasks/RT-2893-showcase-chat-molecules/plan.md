# Plan

**Task:** RT-2893 · **Branch:** RT-2893-showcase-chat-molecules
**Behaviour:** unchanged — the stories move to another group of the showcase, the components and their look do not change. Подтверждено владельцем: «бери в работу эпик с правками по сторибуку».

## Task footprint

| What      | Where                                                                          |
| --------- | ------------------------------------------------------------------------------ |
| Specs     | none: the showcase groups are described by the task and the epic plan          |
| Laws      | none                                                                           |
| Rules     | none                                                                           |
| Code      | `projects/ui-kit-v2/src/rich-editor/lib/components/*/stories/`, `Overview.mdx` |
| Snapshots | `projects/ui-kit-v2/.storybook/__snapshots__`                                  |

## What counts as done

- No story file carries the titles Organisms/Chat/MessageComposer or Organisms/Chat/RichEditor.
- No `Overview.mdx` links to their old addresses.
- The 13 snapshots carry the new names, and the snapshot run is green with no orphans.

## Stages

### 1. Titles and links

- **Steps:**
    1. Change the title in the four story files and in the `Meta` of the two `Overview.mdx`.
    2. Change the `organisms-chat-…` links on every `Overview.mdx`.
- **Readiness sign:** the search for the old titles and addresses finds nothing.
- **Verified by:** `grep -rIn -E "Organisms/Chat/(MessageComposer|RichEditor)|organisms-chat-(messagecomposer|richeditor)" projects/ui-kit-v2/src` — no lines.

### 2. Snapshots

- **Steps:**
    1. Rename the 13 snapshot files by `git mv` to the `molecules-chat-…` names.
- **Readiness sign:** no snapshot carries the old names, 13 carry the new ones.
- **Verified by:** `ls projects/ui-kit-v2/.storybook/__snapshots__ | grep -c -E "^molecules-chat-(messagecomposer|richeditor)--"` — prints 13.

### 3. The check before the push

- **Steps:**
    1. Run the push gate set, the showcase snapshots included.
- **Readiness sign:** the push passes.
- **Verified by:** `git push` — the push gate lets the branch through.

## What this work does not do

- Chat, AiChat, ThreadList and Timeline stay in organisms.
- The last task of the epic, RT-2894.
