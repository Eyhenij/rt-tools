# Binding — the rules gate delivers the rule

The code does not exist yet: this is a product agreement, and its rules have no place of execution
to name. The bindings are written by the stage that writes the code, and the agreement merges into
`docs/specs/agent-kit/rule-gate/implementation.md` together with them.

Where the work is expected to land, as a guide for the plan, not as bindings:

- the delivery, the packing under the limit and the remaining refusal —
  `projects/agent-kit/assets/hooks/skill-gate.sh`, the part after the choice of the unloaded rules;
  the answer form of a hook that passes with text is the one
  `projects/agent-kit/assets/hooks/git-guard-delivery-conflict.sh` prints, without a permission
  decision;
- the record of a delivered rule — the same record `projects/agent-kit/assets/hooks/skill-loaded.sh`
  writes after the tool `Skill`; a read of a rule file by the tool `Read` needs a subscription of
  its own on the event after the call;
- the re-arming line — `projects/agent-kit/assets/hooks/skill-gate-rearm.sh`;
- the fact of a loaded rule for the neighbouring guards —
  `projects/agent-kit/assets/hooks/facts.sh:rt_fact_rule_loaded` and the fact of the move next to
  it, read by about fifteen hooks; the gate among the neighbours —
  `projects/agent-kit/assets/checks/decide.mjs`, the `@gate` branch with the move `load_rule`; the
  rows with that move in `projects/agent-kit/assets/checks/decision-table.json`. The fact answers
  "deliverable" by the same choice the gate makes, so the two cannot diverge;
- `rt_gate_pending` in `projects/agent-kit/assets/hooks/deny-tail.sh` has no callers today, and the
  neighbours are reached through the fact, not through it;
- the refusal count by text — `projects/agent-kit/assets/checks/record-count.mjs`; the week sign
  adds the refusals with the move `load_rule` to it.
