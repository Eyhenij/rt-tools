# The length limit of a rule description — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

- **The description of a rule is no longer than three hundred characters.** — `tools/check-descriptions.mjs:LIMIT` — the limit in characters; the header of every skill is read by `descriptionOf`
- **The description answers one question — take this rule or not.** — **Not checked by a machine.** The meaning of a description is invisible to it; it is held by reading and by the shape from the pattern `spec-driven-rule`
- **The length of a description is counted by a command, not by eye.** — `tools/check-descriptions.mjs:main` — a walk of the skills directory, a list of those that exceeded with their numbers; it is called by `check:descriptions`
- **A description left longer than the limit stands in the list of the accepted debt by name.** — `tools/check-descriptions.mjs:debt` — the list `.claude/rt-kit/description-debt.json`, the name of the skill and the reason
- **The rule is still found by its subject.** — **Not checked by a machine.** The pick of a rule is made by the session, and there is nothing to compare it against
