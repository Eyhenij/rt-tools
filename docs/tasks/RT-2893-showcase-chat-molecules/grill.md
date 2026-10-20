# Grill

## The owner request

> бери в работу эпик с правками по сторибуку

The task body (#2893) was written by the application side; its request: move the message field
and the rich text field from organisms to `Molecules/Chat`, rename their comparison snapshots, keep
Chat, AiChat, ThreadList and Timeline in organisms.

## What the tree already has

- Four story files and two `Overview.mdx` pages carry the titles Organisms/Chat/MessageComposer and
  Organisms/Chat/RichEditor; seven lines link to them by `organisms-chat-…` addresses.
- 13 snapshots in `projects/ui-kit-v2/.storybook/__snapshots__` carry these two stories' names.
- No document outside the archive, the task folders and the plans names the two titles.

## Questions and answers

The six questions are closed by assumption: the owner took the recommended options throughout this
session, and the task body answers the rest.

- **Behaviour changes?** No: titles, links and snapshot names move, the look does not.
- **A law or a rule edit?** No: the form-field article of `rt-tools-storybook` from RT-2892 already
  covers an input field with buttons.
- **One task or several?** One, as the task body says.
- **Not part of it:** Chat, AiChat, ThreadList, Timeline stay in organisms.
- **Done sign:** no story under the two old titles, no link to the old addresses, snapshot run green
  with no orphans.
- **Sample:** RT-2892, the same move for seven form fields.

## Decisions

- **Snapshots are renamed by `git mv`, not re-taken** — the look does not change, and a re-take would
  hide a real divergence.
