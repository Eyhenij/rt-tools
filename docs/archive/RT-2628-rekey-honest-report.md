# Grill

## The owner request

> делай работу

Said after the operator rewrite ran in production on 8 October 2026: both `UPDATE` statements
changed 0 rows, and the command still printed «the operators of 2 people now name their Keycloak
keys».

## What the tree already has

- `tools/bus-people-transfer.mjs:runRekey` prints the success line without reading what `psql`
  answered.
- `tools/bus-people-transfer.lib.mjs:rekeySql` builds the statement; the pure part is covered by
  `tools/tests/bus-people-transfer.test.sh`.
- The spec `docs/specs/message-bus/people-transfer/` holds SC-MB-422 and SC-MB-423 for the rewrite.

## Questions and answers

No question: the miss is visible in the command output, and the fix does not change what the
command writes to the database.

## Decisions

- **The report counts the rows from the `UPDATE n` answers** — `psql` already prints them, the
  command only has to read them. Rejected: a separate count query before and after — a second read
  of production for what the answer already says.
- **Zero rows is said outright and is not an error** — a second run after a successful one changes
  nothing legally. Rejected: a non-zero exit — it would refuse a repeated run that is correct.
