# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 1 of 5 — the dev server guard asks the tree who raises the stands
- **Done:** the eleven cargo records of this row are read whole, each checked against the line of
  its resource it names; two of them got a verdict without code — record 5 is already carried out
  by this edition, record 10 asks for the opposite of a deliberate decision
- **Next step:** stage 2 — three articles of the delivery rule
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **The delivery rule was compressed to make room for its new articles** — it stood at the prose
  weight limit, and three more articles took it over. The arguments of fourteen articles were cut
  to their price of the miss, and the retargeting call moved to the pattern of the chain, where the
  ready-made code belongs. No statement was removed. Affected stage of the plan: 2.
- **The law article goes to the owner inside the PR, not past them** — an article of a law is an
  agreement with the owner, and the rule of work conduct says a law is not edited in the branch.
  Here the law is a package resource, and the owner ordered the whole intake taken into work; the
  edit therefore stays in the branch and its ready-made text stands in the PR body under a heading
  of its own, so that the owner strikes it by one word if they disagree. Affected stage of the
  plan: 3.
- **The row of the epic plan is corrected to eleven records** — nine were counted before the last
  two trees sent their cargo. Affected stage of the plan: 5.

## Stages done

- **1. The dev server guard asks the tree who raises the stands** — the profile key
  `RT_STANDS_RAISED_BY` next to the stand list, the articles, the bindings and `SC-AK-1091` in
  `docs/specs/agent-kit/dev-server/`. Checked by
  `bash projects/agent-kit/tests/dev-server-guard.test.sh` — 30 probes, no failures (23 before the
  stage), and by `npm run check:specs` — 1548 scenarios, the new one is covered.

- **3. The law article and four articles of rules** — record 8 into the law of verifiability,
  record 9 into the rule about texts, record 3 into the rule of lib layers, record 11 into the rule
  of verification, record 10 into the header of the rules gate. Checked by `npm run check:specs` —
  1549 scenarios, no divergences; `npm run check:docs` — 582 documents; `node
tools/check-file-size.mjs` — longer than the limit 0; `bash
projects/agent-kit/tests/skill-gate.test.sh` — 89 probes, no failures.

- **4. Two patterns** — record 4: a fourth place where stale text lies is the companion, and the
  search line for companions stands under the command; record 7: two misses in declaring a right of
  a procedure. The pattern of closing outgrew the line limit by the addition and was compressed by
  eight lines. Checked by `node tools/check-file-size.mjs` — longer than the limit 0; `npm run
check:specs` — 1549 scenarios, no divergences; `npm run check:docs` — 582 documents.

## Sessions

### 2026-09-11

- The intake reading in state `new` gives 18 records: 6 belong to `RT-2038`, 1 to `RT-2036`, and
  the remaining 11 are this work.
- Every record's nearest line was searched for in `projects/agent-kit/assets/` — all eleven are in
  place, so no record speaks of an older edition.
- Record 5 turned out to be already carried out: the article about the machine account being
  substituted per call and never made active stands in the delivery rule.
- Record 10 turned out to be against a deliberate decision: the re-arming of the rules gate on
  compaction is a hook of its own with its reason written in its header.
- Record 11 arrived with a refusal mark of the sending side, and the quote it was refused for is
  in the resource verbatim — the mark is stale.

## Handover of the session

Put together by a hook before the compaction of the context (auto).
