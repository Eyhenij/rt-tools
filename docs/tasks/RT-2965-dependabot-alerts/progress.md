# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — The tree is checked on the new lockfile
- **Done:** the overrides are raised, the lockfile holds no vulnerable version
- **Next step:** run `pnpm run check:all`
- **Uncommitted:** none of this task
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Raise the `overrides` lines in `pnpm-workspace.yaml` to the fixed versions
- [x] 1.2 Run `pnpm install` and then `pnpm install --frozen-lockfile`
- [>] 2.1 Run `pnpm run check:all`

## Decisions along the way

## Sessions

### 2026-10-28

- The Security tab read: 33 open Dependabot alerts, no code scanning analysis, no secret alerts.
- Stage 1: 9 `overrides` lines added or raised; the stage command printed no line; the frozen
  install answered «Already up to date». Resolved: undici 7.30.1 and 8.12.3, vite 8.3.5,
  launch-editor 2.14.2, follow-redirects 1.16.2, fast-uri 3.1.9, multer 2.5.0, body-parser 2.4.0,
  qs 6.17.0, serialize-javascript 7.1.4.
