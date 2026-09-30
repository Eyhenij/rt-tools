# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Closing
- **Done:** branch from `RT-2367-visitor-talks-and-operator`, task in «In progress», folder, plan;
  the mockup frame «Закрыт» read; the rules and scenarios SC-CH-112…115; the service keeps the
  minute of the closing and sends it to the stream of the visitor; the widget draws the closed talk
  and starts a new talk from it, SC-CH-112 and SC-CH-113 pass end to end, frame `widget-talk-closed`
- **Next step:** run the full set of checks
- **Uncommitted:** nothing
- **Waiting for the owner:** the proposals of the rules reviews of RT-2373, RT-2366, RT-2365 and RT-2367
- **PR:** not open yet

## Steps

- [x] 1.1 Write the rules, the state and the scenarios into the widget spec and the chat data
- [x] 2.1 Keep the minute of the closing and send the closing into the stream of the visitor
- [x] 2.2 Cover it by the service tests
- [x] 3.1 Draw the closed talk and send the next remark into a new talk
- [x] 3.2 Write the end-to-end checks and take the frame of the closed talk
- [>] 4.1 Run the full set of checks

## Decisions along the way

- The second remark of any talk did not leave the widget: the send handler found a bubble instead
  of the field by the shared part mark. The miss came with RT-2367, so the fix went there as its
  own commit with SC-CH-116 and was merged into this branch.
- The storage helpers of the widget moved to a file of their own: the element stood at the limit
  of the file length.

## Sessions

### 2026-09-30

- The mockup frame «Закрыт» read: the line under the thread, the placeholder of a new question.
- The widget end-to-end specs: 19 of 19 two runs in a row.
