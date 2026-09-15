# Plan

**Task:** RT-2134 · **Branch:** RT-2134-people-section-title
**Spec:** `docs/specs/message-bus/people-list/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                     |
| ----- | ------------------------------------------------------------------------- |
| Specs | `docs/specs/message-bus/people-list/spec.md` — the name of the section    |
| Laws  | `docs/constitution/navigation.md`                                         |
| Rules | `.claude/skills/navigation/`, `.claude/skills/testing/`                   |
| Code  | `libs/message-bus-admin/common/core/util/`, `apps/message-bus-admin-e2e/` |

## What counts as done

- The menu item, the section heading and the tab title say «Пользователи»; the frames of the suite show it.

## Stages

### 1. The word

- **What is done:** `sectionPeople: 'Пользователи'`; the spec sentence; `SECTION.people.title` in the suite; the frames re-taken.
- **Readiness sign:** the end-to-end suite is green with the frames re-taken.
- **Verified by:** `npx playwright test --update-snapshots` in `apps/message-bus-admin-e2e` — `passed`.

## What this work does not do

- The address `/people` and the right `accounts:read` stay as they are.
