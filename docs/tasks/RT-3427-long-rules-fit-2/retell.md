# Blind retelling and critic — RT-3427, step 3.2

Four rounds, 22–23.11.2026. In each round a reader saw only the new hot parts
(`.claude/skills/<rule>/SKILL.md`) and retold them. A critic then compared the retelling with the
old hot part whole (`old/<rule>.md`, taken before compression) and named every requirement,
boundary, exception, sign or row of names that the reader could not know. Every loss that fits
went back into the hot part, in the critic's own wording. Round four ran on the final text of the
seven rules changed after round three; observability and task-flow-owner did not change after it.

Losses per round, round two → three → four, «fixed» where a round's losses went back afterwards:
observability 14 → 9 · platform-access 2 → 1 → 1, fixed · epic-flow 2 → 2 → 0 · mockups 0 → 0 → 0
· queue-audit 0 → 2 → 0 · doc-style-human 1 → 1 → 0 · task-flow 2 → 1 → 0 · task-flow-owner
0 → 0 · task-delivery-loop 4 → 4 → 2, fixed.

The losses still listed do not fit. observability stands at 4791 of 4800 characters, and an edit
of a receiver service that reads the environment delivers it at 9 947 of 10 000; putting the
losses back weighs about 760. Each loss stands whole in the rule's cold part, `pitfalls.md`. The
finding next to the epic plan names them.

- rule: mockups — losses 0
- rule: queue-audit — losses 0
- rule: doc-style-human — losses 0
- rule: platform-access — losses 0
- rule: task-flow — losses 0
- rule: task-flow-owner — losses 0
- rule: epic-flow — losses 0
- rule: task-delivery-loop — losses 0
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
