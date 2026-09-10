# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — the spec of the layout names the new behaviour
- **Done:** the record was read whole, its consumers in the checks found — three files, one of them
  the only judge
- **Next step:** stage 3 — layout, checks, the intake and the makeup
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **The alias is found by what it points at, not by its spelling** — a lib is reachable by an alias
  or it is not, and how the tree spells it is the tree's own business. Affected stage of the plan: 1.

## Stages done

- **1. The audit reads the declared name, tag and alias** — `lib-common.mjs` gained `declaredName`,
  `declaredAlias`, `libName` and `libTag`; the formula stayed as the fallback and as the wording of
  the verdict for a lib that declared nothing. `lib-manifests.mjs` and `lib-boundaries.mjs` moved
  onto the read values. Checked by `bash projects/agent-kit/tests/checks-lib-layers.test.sh` — 17
  probes, no failures (10 before the stage), and by `node tools/check-lib-layers.mjs` on this tree —
  80 libs, no divergences.
- **2. The spec of the layout names the new behaviour** — three articles, their bindings and
  `SC-AK-1092` in `docs/specs/agent-kit/layout/`, and one article in the rule of lib layers with a
  line in its companion. Checked by `npm run check:specs` — 1549 scenarios, no divergences, the new
  one is covered.

## Sessions

### 2026-09-11

- The record is the first half of `ce256fc3…`; the second half was done by RT-2034 and is merged.
- The formula lives in `lib-common.mjs` in three lines and is read by `lib-manifests.mjs` and
  `lib-boundaries.mjs`.
- The spec of this family is the layout one: two articles of the same kind already stand there.

## Handover of the session

Put together by a hook before the compaction of the context (auto).
