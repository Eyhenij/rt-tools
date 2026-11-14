# Findings of the epic RT-3288 — one contract for error and placeholder states

Findings of the reviews of the epic's tasks. They wait for the owner and are read at the end of the
epic.

## RT-3292 — the thread list, the chat and the details panel

- **The details panel has no empty slot, while milestone G names one for every component.** The
  panel draws its blocks or nothing, and an empty state of its own is drawn by nobody. The question
  to the owner: either G reads «the empty slot where the component has an empty state», or
  `rtWorkspaceDetailsEmpty` goes into RT-3294 or RT-3295. Address: the epic plan.
- **The approval record names only the thread list frame, though the 31 numbers cover all three.**
  The chat frame 7900:2099 and the details frame 7901:2901 were measured too; the record format
  holds one mockup line. Address: the names of this tree — the approval record check.
- **The Figma copy of the kit still differs from the code in four places:** the placeholder title
  line 24 against 20, the skeleton row 49 against 54, the details tab label, and the empty list
  frame with the inbox icon instead of the preview rows the owner chose. Address: work on the Figma
  copy, before RT-3294 draws its frames.

## RT-3294 — the table, the data list, the dynamic list and the bar list

- **The Figma copy differs from the kit in the parts the lists keep on an error.** The dynamic list
  search field is 32 high in the copy and 40 in the kit, the bar list title 21 against 17, the data
  list toolbar 112 against 68. The placeholder inside, the title line and the gap above the button,
  differs as the RT-3292 finding says. The 32 matched numbers cover the gaps, the widths and the
  centres, not these heights. Address: work on the Figma copy.
- **The approval record now takes several mockup lines.** Four frames were approved by one word,
  and the check accepted four lines. The RT-3292 finding about one frame is closed by this form.
  Address: the names of this tree — the approval record sample.
