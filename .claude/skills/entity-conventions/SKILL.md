---
name: entity-conventions
kind: rule
law: entity-editing
description: Rule under the entity-editing law. Load when editing any admin store and any panel that creates or edits a record. Names the shared base of the aside and of the list store, and that the aside opens by a route of its own. Patterns entity-aside, entity-store.
---
<!-- rt-kit v0.37.0 · rules/entity-conventions.needs-admin.md · 8e18aac03418 · правится надстройкой, не здесь -->

# Entity editing — how it works here

Rule under the law `docs/constitution/entity-editing.md`. Cold part: `pitfalls.md`. Where it lives: the
table in `implementation.md` next to it.

The panel inherits `RtRouteAsideComponent<T>`, the list store `BaseListStoreService`; the record
names are `entity`, `entityId`, `isCreateMode`; saving is `runMutation` in the panel and `mutate` in
the store; pristineness is `pristineSignal(control)`. The store file is `<entity>.store.ts`:
`<entity>-store.service.ts` escapes the linter and the rule gate. Reading a record by a separate
procedure is not set up everywhere — debt `Q-M-3`.

## How the law applies here

- **The aside opens by a route in the `ro` outlet, not by a service call.** No
  `RtAsideService.open()` in the admin.
- **Saving goes through `runMutation`, and the panel hands the base the mutation stream and the
  keys.** The base holds busy, the error reset, the toast and closing. An action
  with a busy state of its own (polling with its `pollingId`) does not go through the base.
- **The mutation stream must give a value or an error.** An empty one freezes the panel; on an
  error the panel shows the refusal and stays open.
- **A mutation ends with a re-read list, not with a sent request.** The list is re-read inside the
  mutation, before closing; a re-read after closing shows the previous value.
- **The store answers with a stream: success is a value, refusal is a stream error.** No boolean
  answers.
- **Names come from the entity, not from the domain.** `save`, `remove`, `load`, not `createBooking`
  or `loadBookings`: the domain is already in the store name.
- **The unsaved-edits guard is set by the panel itself, on all four closing paths.** The header
  button, the footer button, a press outside, Esc.
- **Leaving the panel goes through `openRelated`, not through an own `router.navigate`.** An own
  `router.navigate` leaves the `ro` outlet in the address, and the router silently rejects the
  navigation; `routerLink` in the panel bypasses the unsaved-edits question.
- **The record is read by the identifier from the address as the full model, not taken from the
  list.**

## Patterns

- `entity-aside` — the edit panel: route, base, `runMutation`, header and footer, guard.
- `entity-store` — the entity store: heir of the shared base, `mutate`, refusal keys.
