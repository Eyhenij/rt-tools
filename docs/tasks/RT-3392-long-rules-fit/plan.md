# Plan

**Task:** RT-3392 · **Branch:** RT-3392-long-rules-fit
**Behaviour:** changes
**Spec:** `docs/specs/agent-kit/work-result/spec.md`

## Points

- **A:** the rules gate puts the rules of one edit into the session only when they fit 10 000
  characters together. The probe of the gate (`gate-probe.sh` next to this plan, one edit per area,
  an empty memory of loaded rules) refuses 16 of 21 areas on 19.11.2026: the styles, the showcase,
  the package rules and skills, the tests of the tools, the typescript files, the rollout, the
  application code, the receiver's lists, guards and access, the intake mark, the laid-out skills.
  Since RT-3326 landed (18.11, 10:06Z) the gate gave 4 of 67 refusals on 979 calls — 0.41 per hundred;
  each long rule still costs one refusal per area per session. The weekly report cannot tell a
  refusal by its reason.
- **This task reaches:** every area of the probe passes on the first edit, and the report shows gate
  refusals by reason and the rules delivered with no refusal.
- **Sign:** the probe prints no refusal; no paragraph of the old hot parts is lost
  (`meaning-check.mjs`); the report prints the two numbers over the observations of this tree.
- **Milestone G of the epic:** fewer than five refusals per hundred commands. This task removes at
  most 0.4 per hundred; the rest of G stands on `turn-exit-guard` and the refusals with no check
  named, which this task does not touch.
- **Metric:** отказы проверки правил: вниз.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/agent-kit/work-result/`, `docs/specs/agent-kit/rule-gate-delivery/` |
| Laws  | `docs/constitution/project-documentation.md` |
| Rules | `.claude/skills/spec-driven/`, `.claude/skills/doc-style/` |
| Code  | `projects/agent-kit/assets/rules/`, `projects/agent-kit/assets/skills/`, `projects/agent-kit/assets/pitfalls/` |
| Code  | `.claude/rt-kit/overrides/rules/`, `.claude/rt-kit/overrides/pitfalls/` |
| Code  | `.claude/skills/rt-tools-storybook/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/agent-kit-source/`, `.claude/skills/cargo-triage/` |
| Code  | `projects/agent-kit/assets/checks/record-count.mjs`, `projects/agent-kit/assets/checks/work-result.mjs`, `projects/agent-kit/tests/` |

## What counts as done

- The probe of the gate refuses none of its 21 areas.
- No paragraph of the hot parts as they stood at `c4d26402f` is lost: it stands in the hot part or
  in a cold part of its rule.
- A reader role retold every compressed rule without the old text, and a critic compared; the
  results stand in the PR.
- The weekly report prints the gate refusals by reason and the rules delivered with no refusal.
- The package is laid out.

## Stages

### 1. The report shows why the gate refused

Rules: a gate refusal is counted by the reason the gate writes into its note (`why=too-long`,
`together`, `not-read`; a note with no reason is «без причины»); the `gate-deliver` notes are counted
as rules delivered with no refusal; the report prints both in the lines of the result.

- **Steps:**
    1. The gate refusals are counted by reason
       Check: `bash projects/agent-kit/tests/record-count.test.sh >/dev/null && grep -rhE "^[^#]*SC-AK-1747" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | sort -u | wc -l | tr -d ' '` → = 1
    2. The rules delivered with no refusal are counted and printed
       Check: `bash projects/agent-kit/tests/record-count.test.sh >/dev/null && node projects/agent-kit/assets/checks/work-result.mjs --observations .claude/rt-kit/observations --until 2026-11-19 --days 7 | grep -cE 'проверка правил: .*без отказа [0-9]+' | tr -d ' '` → = 1
- **Readiness sign:** the report over the observations of this tree prints the line.
- **Verified by:** `bash projects/agent-kit/tests/record-count.test.sh` — «0 провалов».

### 2. The package rules fit

Rules: the hot part keeps the statement of every article; the argument, the sample and the rest of
a paragraph move whole to the cold part; an override of the tree is compressed the same way.

- **Steps:**
    1. agent-kit fits
       Check: `wc -m < .claude/skills/agent-kit/SKILL.md | tr -d ' '` → <= 3000
    2. testing fits, its override included
       Check: `wc -m < .claude/skills/testing/SKILL.md | tr -d ' '` → <= 3000
    3. reuse-first fits
       Check: `wc -m < .claude/skills/reuse-first/SKILL.md | tr -d ' '` → <= 3000
    4. deploy-flow fits, its override included
       Check: `wc -m < .claude/skills/deploy-flow/SKILL.md | tr -d ' '` → <= 3000
    5. typescript-conventions fits
       Check: `wc -m < .claude/skills/typescript-conventions/SKILL.md | tr -d ' '` → <= 3000
    6. styling-bem fits
       Check: `wc -m < .claude/skills/styling-bem/SKILL.md | tr -d ' '` → <= 3000
    7. write-a-skill fits
       Check: `wc -m < .claude/skills/write-a-skill/SKILL.md | tr -d ' '` → <= 2000
    8. lists fits, its override included
       Check: `wc -m < .claude/skills/lists/SKILL.md | tr -d ' '` → <= 3000
- **Readiness sign:** `pnpm run agent-kit:check` is green and the eight laid-out rules are short.
- **Verified by:** `NX_DAEMON=false pnpm run -s agent-kit:check` — exit 0.

### 3. The tree's own rules fit

- **Steps:**
    1. rt-tools-storybook fits
       Check: `wc -m < .claude/skills/rt-tools-storybook/SKILL.md | tr -d ' '` → <= 3000
    2. rt-tools-styling fits
       Check: `wc -m < .claude/skills/rt-tools-styling/SKILL.md | tr -d ' '` → <= 3000
    3. agent-kit-source fits
       Check: `wc -m < .claude/skills/agent-kit-source/SKILL.md | tr -d ' '` → <= 1500
    4. cargo-triage fits
       Check: `wc -m < .claude/skills/cargo-triage/SKILL.md | tr -d ' '` → <= 3000
- **Readiness sign:** the four rules are short, and their cold parts hold what left them.
- **Verified by:** `node tools/check-descriptions.mjs` — exit 0.

### 4. Every area passes, and nothing is lost

Rules: every area of the probe passes on the first edit; every paragraph of the old hot parts stands
in its rule directory; a reader role retells each compressed rule without the old text, a critic
compares, and a loss goes back into the hot part. A bound that does not hold is named to the owner
with the number, not cut past the meaning.

- **Steps:**
    1. The probe passes every area and no paragraph is lost
       Check: `[ "$(node docs/tasks/RT-3392-long-rules-fit/meaning-check.mjs c4d26402f agent-kit testing reuse-first deploy-flow typescript-conventions styling-bem write-a-skill lists rt-tools-storybook rt-tools-styling agent-kit-source cargo-triage | tail -1)" = 0 ] && bash docs/tasks/RT-3392-long-rules-fit/gate-probe.sh "$PWD" docs/tasks/RT-3392-long-rules-fit/gate-probe-paths.txt | grep -c REFUSED | tr -d ' '` → = 0
- **Readiness sign:** the probe prints «pass» for all 21 areas.
- **Verified by:** the probe and the meaning check, and the retellings in the PR.

## What this work does not do

- The deploy-flow variants for other hosts (`deploy-flow.azure.md`, `deploy-flow.gitlab.md`) are
  not compressed: this tree lays out the one for its host.
- The limit of the host is not raised, and the gate map is not changed.
- The release of the package: the weekly report after it judges the metric; the PR says so.
- The refusals with no check named and those of `turn-exit-guard`, the larger part of G.
