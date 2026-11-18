# Plan

**Task:** RT-3326 · **Branch:** RT-3326-rule-gate-gives-rule
**Draft:** `docs/specs/agent-kit/proposed/rule-gate-delivery/`
**Behaviour:** changes

## Points

- **A:** before the first edit of a new area the gate refuses and names a rule; the session loads
  it and repeats the edit. This session alone holds 260 gate refusals and 328 loads of a rule; the
  week 07–13.11 held about 560 refusals.
- **This task reaches:** the edit of a new area passes with the first call, and the text of the
  rule is in the session at once. No other guard refuses that edit for the same rule. A refusal
  stays only for a rule longer than the host limit or one the gate cannot read.
- **Sign:** the gate scenarios show the rule in the hook answer of a passed call; this session's
  own record shows a delivered rule after the layout; a week after the release `agent-kit metrics`
  counts the remaining rounds — gate refusals and refusals with the move «load the rule» — by the
  over-limit and unreadable rules alone.
- **Milestone G of the epic:** fewer than five refusals per hundred commands over a working day,
  and no dead end the executor cannot leave by itself.
- **Metric:** gate refusals per week, down; the baseline is about 560 over 07–13.11, of them 445
  on rules longer than the host limit. Seven rules — spec-driven, git-workflow, task-flow,
  ui-component-tests, doc-style, agent-kit-extend, browser-verification — hold 976 of the 1 484
  refusals in the journal; their hot part goes down to 3 000 characters by the owner's word, and
  then the delivery takes them.

## Task footprint

| What  | Where                                                                                          |
| ----- | ---------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/rule-gate/`, `docs/specs/agent-kit/rule-article/`                        |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/work-conduct.md` — read, not edited   |
| Rules | `.claude/skills/agent-kit-source/` — the order «edit, build, lay out»; shortened: `projects/agent-kit/assets/rules/{spec-driven,doc-style,browser-verification,task-flow,git-workflow.github}.md`, their pitfalls, `projects/agent-kit/assets/skills/agent-kit-extend.md`, `.claude/skills/ui-component-tests/`, and the companions `implementation.md` of each |
| Code  | `projects/agent-kit/assets/hooks/skill-gate.sh`, `skill-gate-rearm.sh`, `skill-loaded.sh`, `facts.sh` (`rt_fact_rule_loaded`, read by 14 guards), `projects/agent-kit/assets/checks/decide.mjs`, `projects/agent-kit/tests/skill-gate.test.sh` |

## What counts as done

- An edit of a new area whose rule fits the host limit passes with the first call, and the hook
  answer carries the text of the rule.
- No guard that reads the fact of a loaded rule refuses that edit for that rule.
- A rule longer than the limit or not read is refused, and the refusal names which of the two; a
  read of such a rule by the tool `Read` loads it.
- The delivered rule counts as loaded, and a delivery is observed as a delivery, not as a refusal.
- The hot part of each of the seven rules is at most 3 000 characters, and a role that never saw
  the former text makes the same decisions by the new one as the former text gives.
- The agreement is merged into the package spec as the subdomain `rule-gate-delivery`.

## Stages

### 1. The delivery

- **Steps:**
    1. The gate passes a call whose rule fits the limit, puts the rule with its opening line into the hook answer and records the rule as loaded
       Check: `bash projects/agent-kit/tests/skill-gate.test.sh >/dev/null 2>&1 && grep -oE 'c "SC-AK-(1669|1671|1674)' projects/agent-kit/tests/skill-gate.test.sh | sort -u | wc -l | tr -d ' '` → = 3
    2. The companion arrives with the rule when it fits, falls back to its path, and the limit is read from the setting
       Check: `bash projects/agent-kit/tests/skill-gate.test.sh >/dev/null 2>&1 && grep -oE 'c "SC-AK-(1672|1673|1682|1683)' projects/agent-kit/tests/skill-gate.test.sh | sort -u | wc -l | tr -d ' '` → = 4
    3. Every call kind gets the delivery, a call needing two rules passes with both, and rules that do not fit together are refused together
       Check: `bash projects/agent-kit/tests/skill-gate.test.sh >/dev/null 2>&1 && grep -oE 'c "SC-AK-(1670|1677|1681)' projects/agent-kit/tests/skill-gate.test.sh | sort -u | wc -l | tr -d ' '` → = 3
- **Readiness sign:** the gate suite is green and names ten scenarios of the delivery.
- **Verified by:** `bash projects/agent-kit/tests/skill-gate.test.sh` — the last line ends with «0 провалов».

### 2. What stays a refusal, and the record

- **Steps:**
    1. A rule longer than the limit and a rule not read are refused with the reason, and a read of an over-limit rule by the tool `Read` loads it
       Check: `bash projects/agent-kit/tests/skill-gate.test.sh >/dev/null 2>&1 && grep -oE 'c "SC-AK-(1675|1676|1679|1684)' projects/agent-kit/tests/skill-gate.test.sh | sort -u | wc -l | tr -d ' '` → = 4
    2. The record is created when missing, an unwritable record still passes, a call without a session id is refused, and a subagent is recorded apart
       Check: `bash projects/agent-kit/tests/skill-gate.test.sh >/dev/null 2>&1 && grep -oE 'c "SC-AK-(1685|1686|1687|1688)' projects/agent-kit/tests/skill-gate.test.sh | sort -u | wc -l | tr -d ' '` → = 4
    3. A delivery is observed as a delivery
       Check: `bash projects/agent-kit/tests/skill-gate.test.sh >/dev/null 2>&1 && grep -oE 'c "SC-AK-1678' projects/agent-kit/tests/skill-gate.test.sh | sort -u | wc -l | tr -d ' '` → = 1
- **Readiness sign:** the gate suite is green and names nine more scenarios.
- **Verified by:** `bash projects/agent-kit/tests/skill-gate.test.sh` — the last line ends with «0 провалов».

### 3. The neighbours and the layout

- **Steps:**
    1. The fact of a loaded rule counts a rule the gate would deliver as loaded, and the task guard on the same edit names no load
       Check: `bash projects/agent-kit/tests/decide.test.sh >/dev/null 2>&1 && bash projects/agent-kit/tests/task-flow-guard.test.sh >/dev/null 2>&1 && grep -hoE 'SC-AK-(1680|1689)' projects/agent-kit/tests/decide.test.sh projects/agent-kit/tests/task-flow-guard.test.sh | sort -u | wc -l | tr -d ' '` → = 2
    2. The re-arming line names only the rules longer than the limit
       Check: `bash projects/agent-kit/tests/skill-gate-rearm.test.sh >/dev/null 2>&1 && grep -oE 'SC-AK-1690' projects/agent-kit/tests/skill-gate-rearm.test.sh | sort -u | wc -l | tr -d ' '` → = 1
    3. The package is laid out into this tree
       Check: `pnpm run -s agent-kit:check 2>&1 | grep -q 'разложенное сходится с пакетом' && grep -c 'Passed by the rules gate' .claude/hooks/skill-gate.sh` → >= 1
    4. This session's own record holds a rule the host put into the session whole, by a hook answer of the gate
       Check: `grep '"hook_additional_context"' /Users/eyhenij/.claude/projects/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd.jsonl | grep '"hookEvent":"PreToolUse"' | grep 'Passed by the rules gate' | grep -vc 'Output too large'` → >= 1
- **Readiness sign:** the layout matches the package, and the host put a delivered rule into this
  session.
- **Verified by:** the check of step 3.4 — the delivery line in the record.

### How a rule is shortened

The owner's words: «ужимай горячую часть правил до 3000 знаков», «убедись что смысл при этом не
теряется». The hot part is the laid-out `SKILL.md`, counted by `wc -m` with the header; in the C
locale of this machine `wc -m` counts bytes, which is stricter.

- Before a rule is cut, the progress gets a table of its sections: per section the outcome of the
  form of a compressed article of `spec-driven` — stays verbatim, folds to one line at the
  article, or leaves whole for the cold part — and the size it comes to. A rule the table brings
  over 3 000 goes to the stage of the long rules.
- The statement of every article stays verbatim. Where the statements alone do not fit, a
  statement is shortened by its meaning; the pair «было → стало» is written in the progress, and
  the first column of the companion `implementation.md` is edited by the same change. A rule that
  still does not fit is split in two by subject, the gate map names each part, and the split is
  written in the progress before it is made.
- Meaning is checked by the machine: the script `meaning.mjs` of the task folder takes the former
  text from the epic branch, and every statement of «How the law applies here» must stand in the
  new hot part, or in the progress as a pair «было → стало»; every former paragraph must stand in
  the new hot part or in the cold part, whitespace aside. It prints the number of the missing.
- Meaning is checked by reading: three edits of the rule's area are taken from the journal of the
  gate refusals by this rule, at least one per section that lost text. A role that never saw the
  former text decides them by the new hot part; `goal-critic` gets the former text and these
  decisions and gives the verdict. Its reply is written verbatim into `retell/<rule>.md` with its
  line `Verdict: matched` or `Verdict: diverged`.
- A divergence brings the lost text back into the hot part. If the rule then does not fit, its
  number is named to the owner, and the owner's answer is written verbatim in the progress; that
  answer is the second ending of the size step.
- A split rule is checked part by part: the size and the retelling of each `SKILL.md` it became.

### 4. The rules with short statements

- **Steps:**
    1. The script of the meaning check is written, and the section tables of spec-driven, doc-style and browser-verification are in the progress
       Check: `node docs/tasks/RT-3326-rule-gate-gives-rule/meaning.mjs spec-driven >/dev/null 2>&1; test $? -le 1 && grep -cE '^\| (spec-driven|doc-style|browser-verification) \|' docs/tasks/RT-3326-rule-gate-gives-rule/progress.md` → >= 3
    2. spec-driven: the hot part is at most 3 000 characters, and nothing of the former text is lost
       Check: `pnpm run -s agent-kit:sync >/dev/null 2>&1 && test "$(wc -m < .claude/skills/spec-driven/SKILL.md)" -le 3000 && node docs/tasks/RT-3326-rule-gate-gives-rule/meaning.mjs spec-driven` → = 0
    3. spec-driven: the retelling matched the former text
       Check: `grep -c '^Verdict: matched' docs/tasks/RT-3326-rule-gate-gives-rule/retell/spec-driven.md` → = 1
    4. doc-style: the hot part is at most 3 000 characters, and nothing of the former text is lost
       Check: `pnpm run -s agent-kit:sync >/dev/null 2>&1 && test "$(wc -m < .claude/skills/doc-style/SKILL.md)" -le 3000 && node docs/tasks/RT-3326-rule-gate-gives-rule/meaning.mjs doc-style` → = 0
    5. doc-style: the retelling matched the former text
       Check: `grep -c '^Verdict: matched' docs/tasks/RT-3326-rule-gate-gives-rule/retell/doc-style.md` → = 1
    6. browser-verification: the hot part is at most 3 000 characters, and nothing of the former text is lost
       Check: `pnpm run -s agent-kit:sync >/dev/null 2>&1 && test "$(wc -m < .claude/skills/browser-verification/SKILL.md)" -le 3000 && node docs/tasks/RT-3326-rule-gate-gives-rule/meaning.mjs browser-verification` → = 0
    7. browser-verification: the retelling matched the former text
       Check: `grep -c '^Verdict: matched' docs/tasks/RT-3326-rule-gate-gives-rule/retell/browser-verification.md` → = 1
- **Readiness sign:** three rules fit, nothing of their former text is lost, their retellings
  matched, and the layout matches the package.
- **Verified by:** `pnpm run -s agent-kit:check 2>&1 | grep -c 'разложенное сходится с пакетом'` — 1.

### 5. The rules with long statements

- **Steps:**
    1. The section tables of task-flow, git-workflow and ui-component-tests are in the progress, with the pairs of shortened statements
       Check: `grep -cE '^\| (task-flow|git-workflow|ui-component-tests) \|' docs/tasks/RT-3326-rule-gate-gives-rule/progress.md` → >= 3
    2. task-flow: every part is at most 3 000 characters, and nothing of the former text is lost
       Check: `pnpm run -s agent-kit:sync >/dev/null 2>&1 && for f in .claude/skills/task-flow*/SKILL.md; do test "$(wc -m < "$f")" -le 3000 || exit 1; done && node docs/tasks/RT-3326-rule-gate-gives-rule/meaning.mjs task-flow` → = 0
    3. task-flow: the retelling of every part matched the former text
       Check: `ls docs/tasks/RT-3326-rule-gate-gives-rule/retell/task-flow*.md >/dev/null 2>&1 && grep -L '^Verdict: matched' docs/tasks/RT-3326-rule-gate-gives-rule/retell/task-flow*.md | wc -l | tr -d ' '` → = 0
    4. git-workflow: every part is at most 3 000 characters, and nothing of the former text is lost
       Check: `pnpm run -s agent-kit:sync >/dev/null 2>&1 && for f in .claude/skills/git-workflow*/SKILL.md; do test "$(wc -m < "$f")" -le 3000 || exit 1; done && node docs/tasks/RT-3326-rule-gate-gives-rule/meaning.mjs git-workflow` → = 0
    5. git-workflow: the retelling of every part matched the former text
       Check: `ls docs/tasks/RT-3326-rule-gate-gives-rule/retell/git-workflow*.md >/dev/null 2>&1 && grep -L '^Verdict: matched' docs/tasks/RT-3326-rule-gate-gives-rule/retell/git-workflow*.md | wc -l | tr -d ' '` → = 0
    6. ui-component-tests: every part is at most 3 000 characters, and nothing of the former text is lost
       Check: `for f in .claude/skills/ui-component-tests*/SKILL.md; do test "$(wc -m < "$f")" -le 3000 || exit 1; done && node docs/tasks/RT-3326-rule-gate-gives-rule/meaning.mjs ui-component-tests` → = 0
    7. ui-component-tests: the retelling of every part matched the former text
       Check: `ls docs/tasks/RT-3326-rule-gate-gives-rule/retell/ui-component-tests*.md >/dev/null 2>&1 && grep -L '^Verdict: matched' docs/tasks/RT-3326-rule-gate-gives-rule/retell/ui-component-tests*.md | wc -l | tr -d ' '` → = 0
- **Readiness sign:** the three rules fit or are split into parts that fit, nothing is lost, the
  retellings matched, and the layout matches the package.
- **Verified by:** `pnpm run -s agent-kit:check 2>&1 | grep -c 'разложенное сходится с пакетом'` — 1.

### 6. The skill

- **Steps:**
    1. agent-kit-extend: the hot part is at most 3 000 characters, and nothing of the former text is lost
       Check: `pnpm run -s agent-kit:sync >/dev/null 2>&1 && test "$(wc -m < .claude/skills/agent-kit-extend/SKILL.md)" -le 3000 && node docs/tasks/RT-3326-rule-gate-gives-rule/meaning.mjs agent-kit-extend` → = 0
    2. agent-kit-extend: the retelling matched the former text
       Check: `grep -c '^Verdict: matched' docs/tasks/RT-3326-rule-gate-gives-rule/retell/agent-kit-extend.md` → = 1
- **Readiness sign:** all seven hot parts fit, and the layout matches the package.
- **Verified by:** `pnpm run -s agent-kit:check 2>&1 | grep -c 'разложенное сходится с пакетом'` — 1.

### 7. The texts

- **Steps:**
    1. The agreement merges into the package spec as the subdomain `rule-gate-delivery` with its bindings
       Check: `test ! -d docs/specs/agent-kit/proposed/rule-gate-delivery && grep -cE '^### SC-AK-(1669|16[78][0-9]|1690)' docs/specs/agent-kit/rule-gate-delivery/scenarios.md` → >= 22
    2. The README of the package says the gate puts the rule into the session
       Check: `grep -c 'кладёт правило' projects/agent-kit/README.md` → >= 1
- **Readiness sign:** `check:specs` is green and the subdomain holds the new scenarios. A subdomain
  of its own, not a merge into `rule-gate`: together they would be about 390 lines against the
  limit of 330.
- **Verified by:** `npm run -s check:specs` — exit 0.

## Rules of the agreement and their steps

Every rule of the agreement and every decision of the grill has its step: the scenario numbers
of a step are the scenarios of its rules. The rules of the agreement are compared with this list
before the first stage; a rule the comparison finds without a step is added as a decision along
the way in the progress, with the step that takes it.

| Scenarios | Step |
| --- | --- |
| SC-AK-1669, 1671, 1674 — the pass, the opening line, the record | 1.1 |
| SC-AK-1672, 1673, 1682, 1683 — the companion, the packing, the setting of the limit | 1.2 |
| SC-AK-1670, 1677, 1681 — the call kinds, two rules, rules that do not fit together | 1.3 |
| SC-AK-1675, 1676, 1679, 1684 — over the limit, not read, the reason, the read loads | 2.1 |
| SC-AK-1685, 1686, 1687, 1688 — the record directory, unwritable, no session, a subagent | 2.2 |
| SC-AK-1678 — the observation of a delivery | 2.3 |
| SC-AK-1680, 1689 — the fact for the neighbours, the task guard on the same edit | 3.1 |
| SC-AK-1690 — the re-arming line | 3.2 |

The grill decisions and their steps: the pass with the rule in the answer — 1.1; the rule over the
limit not cut — 2.1; the companion when it fits — 1.2; the host limit of 10 000 characters — 1.2
and 2.1; the host puts the text into the session — 3.4; the seven hot parts at most 3 000
characters — 4.2, 4.4, 4.6, 5.2, 5.4, 5.6, 6.1; the meaning checked by the machine and by reading —
the same steps and 4.3, 4.5, 4.7, 5.3, 5.5, 5.7, 6.2.

## What this work does not do

- It shortens seven rules, not the other 30 longer than the limit: those and the rules that fit already hold 508 of the 1 484
  refusals in the journal, and their refusals stay until a task of its own.
- It changes the gate map only where a rule is split in two.
- It does not shorten the editions of git-workflow for other hostings: this tree lays out the one
  for GitHub, and the other two are named in the findings of the epic.
- It does not read a week after the layout: that is the remaining step of the PR.
