# Grill

## The owner request

> Задачи вне эпиков

RT-1971 is the next single task of the queue after RT-2265.

## What the tree already has

- `loadChromium` stands as four copies: `tools/snapshot-icon-probe.mjs`, `tools/snapshot-paint-probe.mjs`,
  `tools/snapshot-window-probe.mjs` and `tools/story-sweep-v2.mjs`. The refusal of the fourth
  already differs from the other three.
- The shared module of the probes is `tools/showcase-probe.mjs`; its header says the driver was
  deliberately not moved there yet.

## What the rules already say

- `reuse-first`: what is repeated lives in one place.

## Questions and answers

**What this copy takes next**
Задачи вне эпиков

## Decisions

- Question closed by assumption: behaviour does not change — the same two paths, the same refusal.
- Question closed by assumption: the refusal is handed in by the caller, because the sweep fails by
  its own `fail` and the probes by printing and exiting.

## What is left unclear

- Nothing.
