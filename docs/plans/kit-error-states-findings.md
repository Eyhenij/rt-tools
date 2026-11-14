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
