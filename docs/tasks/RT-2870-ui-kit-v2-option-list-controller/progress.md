# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The check before the push
- **Done:** the subdomain spec `option-list`; `RtOptionList` in `src/lib/options`; the select, the
  multiselect and the autocomplete on it; 2934 tests, the typecheck and the lint green
- **Next step:** push the branch through the gate set
- **Uncommitted:** the owner's `.claude/rt-kit/assignments.md` row
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the subdomain spec `option-list` with its scenarios, numbered from `SC-UKV-880`.
- [x] 2.1 Write the controller in `src/lib/options` with tests that draw no component.
- [x] 2.2 Move the select, the multiselect and the autocomplete onto it.
- [x] 2.3 Write the companion of the spec.
- [>] 3.1 Run the push gate set, the showcase snapshots included.

## Decisions along the way

- **The panel id reaches the controller as a function.** The controller is a field of the family,
  and the family's `panelId` field may be declared after it. Affected stage of the plan: 2.
- **The fields keep `activeIndex` and `activeOptionId` as names of the controller's signals.** The
  templates read them, and the markup does not change. Affected stage of the plan: 2.
- **Where the highlight lands on opening stays with each field.** The select puts it on the chosen
  option, the multiselect on the first enabled one. Affected stage of the plan: 2.

## Sessions

### 2026-10-21

- The task taken under epic RT-2861, the branch from RT-2869.
