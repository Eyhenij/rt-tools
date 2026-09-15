# Observations — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

The anchor here is the word that holds the statement. The audit looks for it across the whole file
and is satisfied by any word, so the name of a field from a foreign line passes it the same way the
needed sentence does — and the statement stays green when the text of the role itself is rewritten
whole.

- **An observation is written into the tree, not into a temporary directory.** — `projects/agent-kit/src/lib/observations.ts:OBSERVATIONS_DIR`
- **An observation names nothing of the tree except the kind of the file.** — `projects/agent-kit/assets/hooks/observe.sh:rt_observe_clean`
- **The writing of observations is switched off by a setting of the tree.** — `projects/agent-kit/assets/hooks/observe.sh:rt_observe_dir`
- **A guard that could not write an observation lets the action through.** — `projects/agent-kit/assets/hooks/observe.sh:rt_note`
- **The digest names what was not used once, too.** — `projects/agent-kit/src/lib/observations.ts:summarize`
- **The digest answers for a stretch of days, not for all time.** — `projects/agent-kit/src/lib/observations.ts:DEFAULT_DAYS`
- **Observations older than the keeping time are removed by the digest.** — `projects/agent-kit/src/lib/observations.ts:readObservations`
- **An override is counted as a state, not as an event.** — `projects/agent-kit/src/lib/snapshot.ts:treeSnapshot`
- **The snapshot of the overrides names the resource, the section and the kind of the edit, not the content of the edit.** — `projects/agent-kit/src/lib/snapshot.ts:overridesOf`
- **The heading of a section of one's own does not go outward.** — `projects/agent-kit/src/lib/cargo.ts:TOverrideKind`
- **The snapshot names the unchosen on a par with the overridden.** — `projects/agent-kit/src/lib/snapshot.ts:unpickedOf`
- **An observation carries a tree sign, and the tree address is not recovered from it.** — `projects/agent-kit/src/lib/tree-mark.ts:treeSlugOf`
- **The tree sign is the same for everyone working with one repository.** — `projects/agent-kit/src/lib/tree-mark.ts:remoteMarkOf`
- **A tree without a remote repository names its sign by a setting.** — `projects/agent-kit/src/lib/tree-mark.ts:treeSlugOf`
- **An observation line carries the version of the record schema.** — `projects/agent-kit/src/lib/cargo.ts:CARGO_SCHEMA_VERSION`
- **Lines of an unknown schema version are counted apart and named by a number.** — `projects/agent-kit/src/lib/observations.ts:parseObservation`
- **A guard that did not refuse once over the stretch stands in the digest as a line of its own.** — `projects/agent-kit/src/lib/observations.ts:summarize` — the field `silentGuards`; scenario `SC-AK-809`
- **The digest counts as a guard whoever declared their name for the observations.** — `projects/agent-kit/src/lib/commands.ts:guardsOfTree` — the name is taken from the declaration in the guard header; scenario `SC-AK-809`
- **A guard's refusal is recorded by the shared refusal tail, not by the guard itself.** — `projects/agent-kit/assets/hooks/deny-tail.sh:rt_deny_tail` — calls the record before assembling the tail; scenario `SC-AK-811`
- **The list of guards the digest asks of the tree, not of the package.** — `projects/agent-kit/src/lib/commands.ts:stats` — the hooks directory is taken from the layout of the tree; scenario `SC-AK-809`
- **The silence of a guard is not made a refusal.** — `projects/agent-kit/src/lib/commands.ts:statsLines` — the section is printed on a par with the rest and does not change the exit code; scenario `SC-AK-810`
- **The outcomes of the push gate the digest counts apart from the refusals of the guards.** — `projects/agent-kit/src/lib/observations.ts:pushGate` — the count goes by the event kind `push-gate`; scenario `SC-AK-836`
