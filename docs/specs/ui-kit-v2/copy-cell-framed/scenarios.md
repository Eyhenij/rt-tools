# Scenarios — the copy cell in the frame of a field

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-1115 — a framed cell keeps its button visible and copies

Given a copy cell with the input `framed`
When the cell is drawn and the copy button is pressed
Then the cell carries the framed and the static look, and the shown value goes into the clipboard

Covered: `projects/ui-kit-v2/src/lib/components/table/copy-cell/rt-copy-cell.component.spec.ts`. The
frame itself is held by the story frames of the copy cell and of the panel of a service.
