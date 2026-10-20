# Grill

## The owner request

> бери в работу эпик с правками по сторибуку

The task body (#2892) was written by the application side; its request: move seven form-field
stories from organisms to molecules, rename their comparison snapshots, keep the trees in organisms.

## What the tree already has

- 14 story files carry the seven titles; `Overview.mdx` pages of the same components and of their
  neighbours link to them by `./?path=/docs/organisms-…`.
- The snapshots live in `projects/ui-kit-v2/.storybook/__snapshots__`, named by the story id: 53
  files for these seven stories (DateRange 7, DateRangePanel 5, ColorPalette 7, DynamicSelector 13,
  TreeSelector 9, HybridTreeSelector 5, ImageUpload 7).
- `tools/visual-snapshots-v2.mjs` matches the references and names orphaned ones; it runs before a
  push.
- The showcase order in `.storybook/preview.ts` names only the top groups, so a move needs no edit
  there.

## Questions and answers

The six questions are closed by assumption: the owner took the recommended options throughout this
session, and the task body answers the rest.

- **Behaviour changes?** No: titles, links and snapshot names move, the look does not.
- **A law or a rule edit?** No.
- **One task or several?** One, as the task body says.
- **Not part of it:** `Tree`, `HybridTree`, `DraggableTree` stay in organisms.
- **Done sign:** no story under the seven old titles, no link to the old addresses, snapshot run green
  with no orphans.
- **Sample:** the existing `Molecules/Forms/*` stories, for example `Molecules/Forms/DatePicker`.

## Decisions

- **The image upload goes to `Molecules/Forms/ImageUpload`** — the task says «Molecules/Forms» for all
  seven. Rejected: a group of its own, nothing in the task asks for it.
- **Snapshots are renamed by `git mv`, not re-taken** — the look does not change, and a re-take would
  hide a real divergence.
