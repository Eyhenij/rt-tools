# Binding — the rules gate delivers the rule

The code does not exist yet: this is a product agreement, and its rules have no place of execution
to name. The bindings are written by the stage that writes the code, and the agreement merges into
`docs/specs/agent-kit/rule-gate/implementation.md` together with them.

Where the work is expected to land, as a guide for the plan, not as bindings:

- the delivery and the remaining refusal — `projects/agent-kit/assets/hooks/skill-gate.sh`, the
  part after the choice of the unloaded rule; the answer form of a hook that passes with text is the
  one `projects/agent-kit/assets/hooks/git-guard-delivery-conflict.sh` prints;
- the record of a delivered rule — the same record `projects/agent-kit/assets/hooks/skill-loaded.sh`
  writes after the tool `Skill`;
- the re-arming line — `projects/agent-kit/assets/hooks/skill-gate-rearm.sh`;
- the guards that name the loading of a rule instead of the move — the callers of `rt_gate_pending`
  in `projects/agent-kit/assets/hooks/deny-tail.sh`;
- the refusal count by text — `projects/agent-kit/assets/checks/record-count.mjs`.

One rule has no place foreseen yet: **A rule longer than the host limit is not delivered and not
cut.** needs the number of the limit, and that is open question `Q-26` of the agreement.
