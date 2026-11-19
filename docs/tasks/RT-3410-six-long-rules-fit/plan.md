# Plan

**Task:** RT-3410 · **Branch:** RT-3410-six-long-rules-fit
**Behaviour:** unchanged — правка текстов правил пакета и дерева; код приложений не меняется. Слово владельца: «ужимай до 3000, смысл не теряй».

## Points

- **A:** the rules gate puts the rules of one edit into the session only when they fit 10 000
  characters together. The probe of the gate (`gate-probe.sh` next to this plan, one edit per area,
  an empty memory of loaded rules) over 35 areas refuses four on 19.11.2026: the store and the edit
  panel of a record in the admin, where `angular-patterns`, `entity-conventions` and `reuse-first`
  do not fit together, and a new barrel of a package and of a lib, where `lib-layers` and
  `reuse-first` do not. Fifteen rules the gate hands out are longer than 3 000 characters; these
  six stand in the «together» refusals on file edits: lib-layers 8 927, dependencies 6 438,
  entity-conventions 6 295, navigation 5 532, package-release 5 481, entity-models 4 974. The other
  nine are RT-3427. The working copies read the laid-out rules of `main`, where RT-3392 has not
  landed yet.
- **This task reaches:** every area of the probe passes on the first edit; the statement of every
  article of the six rules stays in its hot part.
- **Sign:** the probe prints no refusal; the meaning check finds no paragraph lost from the rule
  directory and no statement gone from the hot part; a reader role retells each rule without the old
  text, and a critic compares.
- **Milestone G of the epic:** fewer than five refusals per hundred commands. This task removes only
  the gate refusals of these areas; the rest of G stands on the engine of the work, the refusals with
  no check named and `flow-step-guard` (RT-3418, RT-3423).
- **Metric:** отказы проверки правил: вниз. Base — the line «проверка правил» of the weekly report
  for 13–19.11.2026: «не помещаются вместе» 53 (`node tools/work-result.mjs --observations
  .claude/rt-kit/observations --until 2026-11-19 --days 7 --no-package`); after RT-3392 reached the
  epic branch, 20, of them 18 on these six rules. The gate reads the laid-out rules of its working
  copy, not the registry: the refusals fall when the epic is merged into `main` and the copies take
  it, so the same report a week after that merge judges it.

## Task footprint

| What  | Where |
| ----- | ----- |
| Laws  | `docs/constitution/project-documentation.md` |
| Rules | `.claude/skills/spec-driven/`, `.claude/skills/doc-style/` |
| Code (правится) | `projects/agent-kit/assets/rules/` |
| Code (правится) | `projects/agent-kit/assets/pitfalls/` |
| Code  | `.claude/rt-kit/overrides/rules/` |
| Code  | `.claude/rt-kit/overrides/pitfalls/` |
| Code (правится) | `.claude/skills/package-release/` |

The tree's override of `lib-layers` (the section «Import cycles inside the package») and of
`dependencies` (the section «What of the law is not here») move whole to overrides of the cold
parts; nothing of this tree goes into a package text.

## What counts as done

- The probe of the gate passes all of its 35 areas.
- No paragraph of the hot parts as they stood at `227aa2239` is lost: it stands in the hot part or
  in a cold part of its rule; the statement of every old article stands in the hot part.
- A reader role retold every compressed rule without the old text, and a critic compared; the
  results stand in the PR.
- The package is laid out.

## Stages

### 1. The package rules fit

Rules: the hot part keeps the statement of every article; the argument, the sample and the rest of
a paragraph move whole to the cold part; an override of the tree is compressed the same way.

- **Steps:**
    1. lib-layers fits, its override included
       Check: `wc -m < .claude/skills/lib-layers/SKILL.md | tr -d ' '` → <= 3000
    2. dependencies fits, its override included
       Check: `wc -m < .claude/skills/dependencies/SKILL.md | tr -d ' '` → <= 3000
    3. entity-conventions fits
       Check: `wc -m < .claude/skills/entity-conventions/SKILL.md | tr -d ' '` → <= 3000
    4. navigation fits
       Check: `wc -m < .claude/skills/navigation/SKILL.md | tr -d ' '` → <= 3000
    5. entity-models fits
       Check: `wc -m < .claude/skills/entity-models/SKILL.md | tr -d ' '` → <= 3000
- **Readiness sign:** `pnpm run agent-kit:check` is green, the five laid-out rules are short, and
  no text of this tree landed in the package (`npm run check:boundary`, exit 0).
- **Verified by:** `NX_DAEMON=false pnpm run -s agent-kit:check` and `npm run -s check:boundary` —
  exit 0 both.

### 2. The tree's own rule fits

- **Steps:**
    1. package-release fits
       Check: `wc -m < .claude/skills/package-release/SKILL.md | tr -d ' '` → <= 3000
- **Readiness sign:** the rule is short, and its cold part holds what left it.
- **Verified by:** `node docs/tasks/RT-3410-six-long-rules-fit/meaning-check.mjs 227aa2239
  package-release | tail -1` → 0, and `node tools/check-descriptions.mjs` — exit 0.

### 3. Every area passes, and nothing is lost

Rules: every area of the probe passes on the first edit; every paragraph of the old hot parts stands
in its rule directory, and every old statement in the hot part; a reader role retells each
compressed rule without the old text, a critic compares, and a loss goes back into the hot part. A
bound that does not hold is named to the owner with the number, not cut past the meaning.

- **Steps:**
    1. The probe passes every area and nothing is lost
       Check: `[ "$(node docs/tasks/RT-3410-six-long-rules-fit/meaning-check.mjs 227aa2239 lib-layers dependencies entity-conventions navigation entity-models package-release | tail -1)" = 0 ] && bash docs/tasks/RT-3410-six-long-rules-fit/gate-probe.sh "$PWD" docs/tasks/RT-3410-six-long-rules-fit/gate-probe-paths.txt | grep -c ' pass ' | tr -d ' '` → = 35
- **Readiness sign:** the probe prints «pass» for all 35 areas.
- **Verified by:** the probe and the meaning check, and the retellings in the PR.

## What this work does not do

- The limit of the host is not raised, and the gate map is not changed.
- `angular-patterns` and `reuse-first` are not compressed further: RT-3392 brought them under
  3 000, and the three fit once `entity-conventions` does.
- The release of the package and the merge of the epic into `main`: the weekly report after the
  merge judges the metric; the PR says so.
- The nine other long rules, and the store edit whose text names `window.`: there
  `platform-access` (5 645) comes along, and the sum stays 10 601 after this task. RT-3427.
- The refusals of the engine of the work, those with no check named and `flow-step-guard`, the
  larger part of G (RT-3418, RT-3423).
