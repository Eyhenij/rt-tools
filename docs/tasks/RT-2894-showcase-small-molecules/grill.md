# Grill

## The owner request

> бери в работу эпик с правками по сторибуку

The task body (#2894) was written by the application side; its request: move the confirm popover
to `Molecules/Dialog`, the file drop zone to `Molecules/Forms`, the speed menu to
`Molecules/Buttons`, rename their comparison snapshots, keep the parts of windows and the table
next to their parents.

## What the tree already has

- Seven story and overview files carry the three titles; seven lines link to them.
- 17 snapshots carry these stories' names: SpeedMenu 10, FileDrop 6, ConfirmPopover 1.
- The confirm family keeps one overview page for the directive and the popover. Its text names the
  popover matrices' group as «Components → ConfirmPopover», a group the showcase no longer has.
- The `Organisms/Dialog/Confirm` story and its `organisms-dialog-confirm--*` snapshots belong to the
  directive, not to the popover.

## Questions and answers

The six questions are closed by assumption: the owner took the recommended options throughout this
session, and the task body answers the rest.

- **Behaviour changes?** No: titles, links and snapshot names move, the look does not.
- **A law or a rule edit?** No.
- **One task or several?** One, as the task body says.
- **Not part of it:** the `Organisms/Dialog/Confirm` story, the headers and footers of the panel
  and the window, the table column headers.
- **Done sign:** no story under the three old titles, no link to the old addresses, snapshot run
  green with no orphans.
- **Sample:** RT-2892 and RT-2893, the same move.

## Decisions

- **The popover goes to `Molecules/Dialog/ConfirmPopover`**, as the epic plan names it; the
  directive story stays in organisms.
- **The overview sentence about the popover group is fixed** to name the new group: it is the
  only place a reader learns where the matrices stand.
- **Snapshots are renamed by `git mv`, not re-taken** — the look does not change.
