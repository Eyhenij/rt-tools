# The binding — the rules gate delivers the rule

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **An edit that needs a rule not loaded in the session passes, and the text of the rule arrives in the session by the same call.** — `projects/agent-kit/assets/hooks/skill-gate.sh:additionalContext` — the gate prints the rule in the answer and exits 0; scenario SC-AK-1669
- **The delivery covers every call kind the gate judges: a file edit, a writing shell command, the browser and the mockups tool.** — `projects/agent-kit/assets/hooks/skill-gate.sh:kind` — the delivery runs after the kind is chosen and does not depend on it; scenario SC-AK-1670
- **The answer of a delivery allows the call and carries the delivered text in the session context field of the hook answer.** — `projects/agent-kit/assets/hooks/skill-gate.sh:additionalContext` — scenario SC-AK-1669
- **The answer of a delivery holds no permission decision of its own.** — `projects/agent-kit/assets/hooks/skill-gate.sh:hookSpecificOutput` — the answer of a delivery has no `permissionDecision`; scenario SC-AK-1669
- **The delivered rule is the file `SKILL.md` of the tree byte for byte, its header included.** — `projects/agent-kit/assets/hooks/skill-gate.sh:rt_gate_read` — the file is read with a marker after it so the trailing newlines stay; scenario SC-AK-1669
- **The delivered text opens with one line naming the rule, the law it applies and that the call passed.** — `projects/agent-kit/assets/hooks/skill-gate.sh:head_line` — the law path comes from `rt_gate_law_path`; scenario SC-AK-1671
- **The companion of the rule arrives in the same text when it fits the host limit.** — `projects/agent-kit/assets/hooks/skill-gate.sh:comps` — scenario SC-AK-1672
- **A companion that does not fit is named in the delivered text by its path, to be read as a file.** — `projects/agent-kit/assets/hooks/skill-gate.sh:comps` — the line «did not fit here and is read as a file»; scenario SC-AK-1673
- **The host limit is counted in characters over the whole delivered text, the delivery line and the separators included.** — `projects/agent-kit/assets/hooks/skill-gate.sh:rt_gate_text` — the length of `text` is compared with `gate_limit`; scenario SC-AK-1682
- **The rules of one call are packed in the order the map names them, each before its companion.** — `projects/agent-kit/assets/hooks/skill-gate.sh:need` — `need` keeps the order of the map, and `rt_gate_text` puts each companion right after its rule; scenarios SC-AK-1672, SC-AK-1677
- **A companion falls back to its path before a following rule is dropped.** — `projects/agent-kit/assets/hooks/skill-gate.sh:comps` — the companions are placed only after all the rules fit; scenario SC-AK-1682
- **The host limit is read from `RT_GATE_CONTEXT_LIMIT`, and without it is 10 000 characters.** — `projects/agent-kit/assets/hooks/skill-gate.sh:RT_GATE_CONTEXT_LIMIT` — scenario SC-AK-1683
- **A rule longer than the host limit is not delivered and not cut.** — `projects/agent-kit/assets/hooks/skill-gate.sh:too-long` — scenario SC-AK-1675
- **The refusal for a rule longer than the host limit names reading its `SKILL.md` by the tool `Read`.** — `projects/agent-kit/assets/hooks/skill-gate.sh:too-long` — the refusal text of this branch; scenario SC-AK-1675
- **A read of the file `SKILL.md` of a rule by the tool `Read` is recorded as a load of that rule.** — `projects/agent-kit/assets/hooks/skill-loaded.sh:read_path` — scenario SC-AK-1684
- **A rule the gate could not read is refused, not let through.** — `projects/agent-kit/assets/hooks/skill-gate.sh:gate_unread` — the reason `not-read`; scenario SC-AK-1676
- **An edit passes only when every rule it needs is in the session.** — `projects/agent-kit/assets/hooks/skill-gate.sh:need` — every unloaded rule of the call goes into one delivery or into one refusal; scenario SC-AK-1677
- **A call whose rules do not fit the host limit together is refused whole, and the refusal names every one of them.** — `projects/agent-kit/assets/hooks/skill-gate.sh:together` — scenario SC-AK-1681
- **A remaining refusal names why the rule was not delivered: longer than the host limit, not fitting together with the other rules of the call, or not read.** — `projects/agent-kit/assets/hooks/skill-gate.sh:gate_why` — written into `RT_DECIDE_NOTE` as `why=`; scenario SC-AK-1679
- **A rule is recorded as loaded only by an answer that allows the call.** — `projects/agent-kit/assets/hooks/skill-gate.sh:recorded` — the record is written only in the branch that prints the delivery; scenario SC-AK-1681
- **A delivered rule is recorded as loaded, the same as after a call of the tool `Skill`.** — `projects/agent-kit/assets/hooks/skill-gate.sh:loaded` — the same record `skill-loaded.sh` writes and `skill-gate-rearm.sh` removes; scenario SC-AK-1674
- **The gate creates the directory of the record itself.** — `projects/agent-kit/assets/hooks/skill-gate.sh:mkdir` — scenario SC-AK-1685
- **A delivery whose name cannot be written into the record still passes, and is observed as `gate-deliver unrecorded`.** — `projects/agent-kit/assets/hooks/skill-gate.sh:unrec` — scenario SC-AK-1686
- **A call without a session id is refused, not delivered.** — `projects/agent-kit/assets/hooks/skill-gate.sh:nosession` — scenario SC-AK-1687
- **A delivery inside a subagent is recorded by the id of the subagent when the input carries it, never for its parent.** — `projects/agent-kit/assets/hooks/skill-gate.sh:agent_id` — scenario SC-AK-1688
- **A delivery writes an observation of its own, `gate-deliver res=<rule> kind=<kind> sid=<sid>`, not a refusal and not a load by the tool.** — `projects/agent-kit/assets/hooks/skill-gate.sh:gate-deliver` — scenario SC-AK-1678
- **The delivery line never holds the words «Refused by the rules gate».** — `projects/agent-kit/assets/hooks/skill-gate.sh:head_line` — the line opens with «Passed by the rules gate»; scenario SC-AK-1671
- **The week sign counts as remaining rounds both the gate refusals and every refusal whose move is loading a rule.** — `projects/agent-kit/assets/checks/record-count.mjs:CHECK_TABLE` — the line of the load move stands before the line that reads the guard's own name; scenario SC-AK-1698
- **A neighbouring guard counts a rule as loaded when it is in the record or is a deliverable rule of the same call.** — `projects/agent-kit/assets/hooks/facts.sh:rt_fact_rule_loaded` — asks `rt_fact_rule_deliverable` when the rule is not in the record; scenario SC-AK-1680
- **A neighbouring guard neither refuses for nor names the load of a deliverable rule of the same call.** — `projects/agent-kit/assets/checks/decide.mjs:firstFor` — the `@gate` branch names the move `load_rule` only when the fact `rule_loaded` is not `yes`; scenarios SC-AK-1680, SC-AK-1689
- **The re-arming line names, of the removed record, only the rules longer than the host limit and asks to load those.** — `projects/agent-kit/assets/hooks/skill-gate-rearm.sh:over` — a rule `rt_fact_rule_deliverable` answers for is skipped; scenario SC-AK-1690
- **The re-arming line says that every other rule comes back by itself at the next edit of its area.** — `projects/agent-kit/assets/hooks/skill-gate-rearm.sh:context` — scenario SC-AK-1690
- **A re-arming line without a rule longer than the host limit asks to load nothing.** — `projects/agent-kit/assets/hooks/skill-gate-rearm.sh:over` — the request to load is added only when `over` is not empty; scenario SC-AK-1690
