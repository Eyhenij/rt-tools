# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — texts and showcase
- **Done:** behaviour, styles and handles; the spec's scenarios and bindings
- **Next step:** the overview tables and the stories
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Closing by overlay disposal in both handles
- [x] 1.2 The owner's injector and the close requests
- [x] 1.3 The focus trap and the pending layer of the panel
- [x] 1.4 The header content slot
- [x] 2.1 The panel's padding, footer, title and error properties
- [x] 3.1 The spec of the subdomain, its bindings and scenarios
- [>] 3.2 The overview tables and the stories for the new inputs, slot and properties
- [ ] 3.3 Snapshots for the new stories

## Decisions along the way

- The owner's destruction closes the panel through the service's per-open stream, not a separate
  subscription: the tree's lint forbids a subscription inside a method, and the stream ends with the
  overlay anyway.
- The focus trap is created by the factory only while the input is on: the CDK directive would
  insert its anchors into every panel, the ones without a trap too.
- Escape and the backdrop are now listened to always, so that a switched-off gesture is reported. A
  panel with Escape switched off now keeps that key from an overlay under it.

## Sessions

### 2026-10-02

- The branch stands on the epic branch RT-2472-kit2-migration-gaps, which carries main.
