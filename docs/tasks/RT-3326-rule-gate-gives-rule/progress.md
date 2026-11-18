# Progress

## Where we stand

- **State:** `задача-взята`
- **Stage:** none yet — the plan is being written
- **Done:** grill closed by assumption; agreement `docs/specs/agent-kit/proposed/rule-gate-delivery/`,
  SC-AK-1669…1680, its open questions closed by decisions; the card is in work.
- **Next step:** step 1.1 — the gate delivers a rule that fits.
- **Plan approved:** «Одобряю plan.md RT-3326». After the word, the checks of stages 4–6 were
  tightened by `goal-critic` before the commit: the meaning script, the verdict by a role, the
  section tables, `&&` in place of `;`. The stages, the rules and the number stayed as approved.
- **Uncommitted:** nothing.
- **PR:** not open yet. The branch stands on RT-3283 (PR #3371).

## Steps

- [ ] 1.1 The gate passes a call whose rule fits the limit, puts the rule with its opening line into the hook answer and records the rule as loaded
- [ ] 1.2 The companion arrives with the rule when it fits, falls back to its path, and the limit is read from the setting
- [ ] 1.3 Every call kind gets the delivery, a call needing two rules passes with both, and rules that do not fit together are refused together
- [ ] 2.1 A rule longer than the limit and a rule not read are refused with the reason, and a read of an over-limit rule by the tool `Read` loads it
- [ ] 2.2 The record is created when missing, an unwritable record still passes, a call without a session id is refused, and a subagent is recorded apart
- [ ] 2.3 A delivery is observed as a delivery
- [ ] 3.1 The fact of a loaded rule counts a rule the gate would deliver as loaded, and the task guard on the same edit names no load
- [ ] 3.2 The re-arming line names only the rules longer than the limit
- [ ] 3.3 The package is laid out into this tree
- [ ] 3.4 This session's own record holds a rule the host put into the session whole, by a hook answer of the gate
- [ ] 4.1 The script of the meaning check is written, and the section tables of spec-driven, doc-style and browser-verification are in the progress
- [ ] 4.2 spec-driven: the hot part is at most 3 000 characters, and nothing of the former text is lost
- [ ] 4.3 spec-driven: the retelling matched the former text
- [ ] 4.4 doc-style: the hot part is at most 3 000 characters, and nothing of the former text is lost
- [ ] 4.5 doc-style: the retelling matched the former text
- [ ] 4.6 browser-verification: the hot part is at most 3 000 characters, and nothing of the former text is lost
- [ ] 4.7 browser-verification: the retelling matched the former text
- [ ] 5.1 The section tables of task-flow, git-workflow and ui-component-tests are in the progress, with the pairs of shortened statements
- [ ] 5.2 task-flow: every part is at most 3 000 characters, and nothing of the former text is lost
- [ ] 5.3 task-flow: the retelling of every part matched the former text
- [ ] 5.4 git-workflow: every part is at most 3 000 characters, and nothing of the former text is lost
- [ ] 5.5 git-workflow: the retelling of every part matched the former text
- [ ] 5.6 ui-component-tests: every part is at most 3 000 characters, and nothing of the former text is lost
- [ ] 5.7 ui-component-tests: the retelling of every part matched the former text
- [ ] 6.1 agent-kit-extend: the hot part is at most 3 000 characters, and nothing of the former text is lost
- [ ] 6.2 agent-kit-extend: the retelling matched the former text
- [ ] 7.1 The agreement merges into the package spec as the subdomain `rule-gate-delivery` with its bindings
- [ ] 7.2 The README of the package says the gate puts the rule into the session

## Decisions along the way

- **The branch stands on RT-3283, not on the epic branch.** PRs of the epic go as a cascade, each
  from the previous one. Affected stage of the plan: none.
- **The task had a number before the grill, so there was no task creation.** The card #3326 was
  filed earlier by the owner's word «Задача в RT-3302»; the folder took its name from the branch.
  Affected stage of the plan: none.

## Sessions

### 18.11.2026

- Grill written; the host limit for a hook's context field measured by its reference: 10 000
  characters.
