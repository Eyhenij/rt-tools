# Grill

Cargo records this task works on, by full keys (all foreign; the signs in the intake are what
`cargo:close` takes):

- `b949a153c2ede7dfc196e6abc912ecf6c849c6a073509710351b72bb1d70dfa0` · sign `abd68bc7-06e5-4bf9-bf41-70f1c03a9fa1` — a mockup is measured by node coordinates
- `4f860a3bd6650102fa5f89340e58dfb54fa8dcb2e9a00d65be091808c7179770` · sign `b5031775-5b6c-4b51-b246-24f6d9cc2389` — a kit component on a design-tool sheet is a copy that drifts
- `d9ba3ba115ed9f3e8f6964fbfef3f429ab6c83500c64a301772f15dfda96b0d0` · sign `b646d9a7-e538-40af-8a99-faf855959cdd` — a mockup of existing behaviour starts with the domain spec
- `210ceac7decaf2145b6e2f3ce402c4aea5be6cfae8344a1e085a12c4d75caa6c` · sign `19f31d09-2620-4ed4-a250-8e8351881a1f` — the agreement is checked against approved mockups
- `33df0a7eb0e21448797813994bf537174e66e436653d94a56d84aa0de4c643ed` · sign `d5f3c263-1ed1-4074-bc00-6285487faec5` — design-tool calls ask the rules gate for a rule
- `85709d617f1a2864be453eaa82c67715a9d68547ac42c0ec9a76584ee1c0df9c` · sign `0086c8c0-6765-4e9d-901c-b3b16625cc7d` — an approved mockup is the source of truth for how a screen looks
- `102d16d71b58713844c1ed310dba5f9c73fe02c0a7a8021263f6feb609b4f8bb` · sign `10c570f7-67d1-4075-95e4-8d11cc823261` — mockups are kept in step with the screens they draw

## The owner request

> разбери всё новое что есть в приёмнике

Then, at the menu for the seven design-tool records: «Завести отдельную особенность пакета». Later: «я прямо поставил тебе задачу».

## What the tree already has

- Tree traits: `projects/agent-kit/assets/traits.json` declares `db`, `admin`, `app`, `packages`; a resource names the trait it needs by `needs-<trait>` before the extension, and `projects/agent-kit/src/lib/traits.ts` reads it. Existing samples: `rules/observability.needs-app.md`, `rules/entity-conventions.needs-admin.md`.
- The rules gate (`hooks/skill-gate.sh`, `defaults/gate-map.sh`) skips a rule the tree does not carry, so a gate branch for the design tool is harmless in a tree without the trait.

## What the rules already say

- Rule `agent-kit-source`: a resource the consumer does not carry out is never a package resource; the boundary check keeps it. A trait is the lawful way to ship a text only some trees carry out.

## Questions and answers

None new: the owner chose a package trait at the menu of the epic.

## Decisions

- **The trait is called `mockups`.** All seven records go under it; a tree that does not name the trait gets none of the files.
- **The two law articles go into a law of their own, `mockups.needs-mockups.md`,** not into `work-conduct`: an article in the shared law would reach every tree.
- **The records about the kit copy, the spec before the first frame and the agreement against the mockups become articles of one rule `mockups`;** the measurement goes to a pattern of that rule.
- **The gate asks for the rule on the design-tool call `mcp__figma__use_figma`** in a new call kind `design`.

## What is left unclear

- None that blocks the work.
