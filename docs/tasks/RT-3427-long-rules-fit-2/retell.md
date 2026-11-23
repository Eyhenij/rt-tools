# Blind retelling and critic — RT-3427, step 3.2

Three rounds, 22–23.11.2026. In each round a reader saw only the new hot parts
(`.claude/skills/<rule>/SKILL.md`) and retold them. A critic then compared the retelling with the
old hot part whole (`old/<rule>.md`, taken before compression) and named every requirement,
boundary, exception, sign or row of names that the reader could not know. Every loss that fits
within the step limit went back into the hot part, in the critic's own wording. The lines below
are from round three, the last one, after its fixes.

Losses in round two → round three (→ after the fix of round three): observability 14 → 9 ·
platform-access 2 → 1 → 0 · epic-flow 2 → 2 · mockups 0 → 0 · queue-audit 0 → 2 → 0 ·
doc-style-human 1 → 1 → 0 · task-flow 2 → 1 → 0 · task-flow-owner 0 → 0 · task-delivery-loop 4 → 4.

The losses still listed do not fit within the limits of steps 1.1, 1.3 and 2.1. Measured after the
last fix: observability 4791 of 4800, epic-flow 2987 of 3000, task-delivery-loop 2995 of 3000.
Each loss stands whole in the rule's cold part, `pitfalls.md`. The finding next to the epic plan
names them.

- rule: mockups — losses 0
- rule: queue-audit — losses 0
- rule: doc-style-human — losses 0
- rule: platform-access — losses 0
- rule: task-flow — losses 0
- rule: task-flow-owner — losses 0
- rule: observability — losses 9
- loss: observability · A send outside creates its own line before the call… · retelling read «also the lock» as «the same applies to the lock»; old: «The line also serves as a lock — a second call on the same record does not leave» · The line is also the lock: a second call on the same record does not leave.
- loss: observability · The store does not grow without limit… · order and third step lost: «first the excess beyond the limit, then the old beyond the age. A group left with no occurrence … goes in a third step — and only if it is older than an hour» · Occurrences go first by limit, then by age; an empty group goes third, only if older than an hour.
- loss: observability · A call to a foreign service goes with an explicit wait limit · «The limit is named as a number next to the client, because the price of waiting differs per service» · The limit is a number next to the client, per service.
- loss: observability · The startup digest holds the names of features and their state… · «The states are laid out as three lists, not as a map "name → state"» (a map gets scrubbed by key) · Three lists, not a map name → state: scrubbing would blank the state.
- loss: observability · The logger hands a failure to the sink and does not see the store · «The sink interface is declared next to the logger, the failures domain implements it, and it is set from outside at startup» · Sink interface next to the logger, implemented by the failures domain, set from outside at startup.
- loss: observability · The owner reads what was recorded in their own section… · what the section shows: «The groups that are theirs, and under a group — its occurrences with the cause, the log line fields and the bodies» · Groups, and under each its occurrences with cause, line fields and bodies.
- loss: observability · A field added to the answer of a refusal… · sign lost: «Neither the linter nor the tests next to the throws see it — the loss shows on the screen of whoever reads the answer» · Linter and throw-side tests miss it; it shows only on the reader's screen.
- loss: observability · Pitfalls (cold now) · boundary lost: «The logger is set on the whole application, so the framework lines go the same way as our own … the same output and the same selection» · Framework lines go to the same output and the same selection as ours.
- loss: observability · What of the law is not here (digest completeness) · «reading an environment variable itself demands this rule as a second layer»; a forgotten feature «in production looks not disabled but nonexistent» · Reading an environment variable demands this rule: add the feature to the digest, or production shows it as nonexistent.
- rule: epic-flow — losses 2
- loss: epic-flow · What of the law is not here · what follows from the gate's scope is lost: «Taking the epic branch, choosing the next task and opening the request of the epic do not demand it: the rule is loaded there by its description» · Taking the epic branch, choosing the next task and opening its PR: load this rule yourself, the gate won't.
- loss: epic-flow · What of the law is not here · boundary of what is checked: «the audit reads the pair "card and plan", not the list»; new text reads as if nothing checks the epic at all · The audit checks the card-and-plan pair, not the task list against queue cards.
- rule: task-delivery-loop — losses 4
- loss: task-delivery-loop · Every change passes two review rounds before the push. · Old: «Each round reads the whole diff of the branch against its base». New and retelling: «the branch diff». Lost: «whole» and «against its base». · Fresh readers get the whole branch diff against its base and their inputs, never the executor's conclusions.
- loss: task-delivery-loop · Unattended work keeps the loop and the night rule both. · Old: push and PR wait for the owner «where that rule keeps everything local». The new part drops the condition. The retelling reads it as unconditional. · Push and PR wait for the owner's return where `autonomous-work` keeps everything local.
- loss: task-delivery-loop · Duties of the steps, the screen. · Old step 10: «the address, the screen and the width to look at, and the turn waits for the answer». New: «The owner sees a screen before closing». Lost: what is shown, and that the turn waits. · Kit or admin change: the owner gets the address, screen and width before closing; the turn waits for the answer.
- loss: task-delivery-loop · What of the law is not here. · Old: the gate prints this rule first on a task folder edit, and «on a command the default rule comes along with it». Also «The owner judges both». The retelling has neither sign. · The gate prints this rule first on a task-folder edit; on a command `task-flow` comes along. The owner judges round commits and PR body.
