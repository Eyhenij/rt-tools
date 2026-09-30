# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — The input
- **Done:** branch from `RT-2364-widget-talk-closed`, task in «In progress», folder, plan; the
  rule and scenario SC-UKV-489; the column settings moved to `RtTableColumnSettings`
- **Next step:** connect `radius` to the table
- **Uncommitted:** nothing
- **Waiting for the owner:** the proposals of the rules reviews of RT-2373, RT-2366, RT-2365, RT-2367 and RT-2364
- **PR:** not open yet

## Steps

- [x] 1.1 Move the table from the out-of-scope list of the radius-scale spec to a rule and a scenario
- [x] 2.1 Move the column settings of the table into a class of their own
- [>] 3.1 Connect `radius` to the table and give the step to the card of the narrow view
- [ ] 3.2 Add the table to the contract test and to the table of inputs on its page
- [ ] 3.3 Show the card of the table at every step in the grid of the surfaces and take its frame
- [ ] 4.1 Run the full set of checks

## Decisions along the way

- Stage 1 closed with one divergence left on purpose: SC-UKV-489 waits for its test in stage 3.
- The saved column settings are handed out as a stream, and the component subscribes in `ngOnInit`:
  the linter forbids a subscription inside a method of the new class.

## Sessions

### 2026-09-30

- Task taken; the table component, the contract test and the radius-scale spec read.
