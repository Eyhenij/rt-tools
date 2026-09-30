# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Closing
- **Done:** the spec, the capsule and its tests; the stories of the nine states and the hint, 8 references; both chat screens on the new field, the frame `chat-section` re-taken
- **Next step:** the full set of checks, then the archive and the PR
- **Uncommitted:** nothing
- **Waiting for the owner:** no; the rules review of RT-2373 left three proposals for the rules
  texts, and they wait for the owner's word
- **PR:** not open yet

## Steps

- [x] 1.1 Write the message-composer subdomain spec
- [x] 1.2 Write its scenarios and binding lines
- [x] 2.1 Redraw the template and the styles of the composer as the capsule with the round buttons
- [x] 2.2 Add the spinner of sending and the hint under the field
- [x] 2.3 Cover the states by the component spec
- [x] 3.1 Show the nine states of the mockup and the hint in the stories
- [x] 3.2 Rewrite the overview page and the context of the composer
- [x] 3.3 Re-take the snapshots of the composer and the chat
- [x] 3.4 Re-take the admin frames that show the chat
- [>] 4.1 Run the full set of checks

## Decisions along the way

- `SC-UKV-479` was taken on a neighbour branch; the subdomain starts at `SC-UKV-480`.
- The text keeps the size of the kit's fields (14, 16 under a finger): the scale has no 15.
- The capsule is tall by the measured height of the text, a file inside or the formatting mode.
- The chat's default field is not the composer: the owner chose to switch the admin chat panel and
  the talks page to it by `richComposer`; three end-to-end specs take the new anchors.

## Sessions

### 2026-09-30

- The mockup read: page Message Composer, frame 6022:36 with nine states.
- The component read: the textarea, the divider, the row of icon buttons; the consumer is `rt-chat`.
