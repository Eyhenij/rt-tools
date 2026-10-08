# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — Delivery
- **Done:** the standard root, the chevron of the proceed link, the spec and the tests
- **Next step:** the gate set and the PR into main
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Put the standard root in place of the theme root before the standard path starts
- [x] 1.2 Drop the chevron of the proceed link
- [x] 1.3 Add the rules and scenarios to the theme spec and cover them by tests
- [>] 2.1 Run the gate set and open the PR into main

## Decisions along the way

## Sessions

### 2026-10-08

- task RT-2631 created after the production sign-in ended on a white screen
- `pnpm exec nx test auth-keycloak-theme`: 8 suites, 33 tests passed
- local stand: `login-update-profile.ftl` draws the standard form in `kc-root`, no console error

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-2631-theme-fallback-root

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 2 — Theme fixes
- **Next step:** the standard root in the standard path
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2631-theme-fallback-root/progress.md`; the plan lies next to it.

### Uncommitted

```
 M ../rt-kit/assignments.md
AM ../../docs/tasks/RT-2631-theme-fallback-root/grill.md
AM ../../docs/tasks/RT-2631-theme-fallback-root/plan.md
AM ../../docs/tasks/RT-2631-theme-fallback-root/progress.md
?? ../../docs/plans/auth-saas.md
?? ../../docs/tasks/RT-2580-mb-auth-e2e/
?? ../../docs/tasks/RT-2597-field-required/
```

### Commits over the main branch

```
no commits over the main branch
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
