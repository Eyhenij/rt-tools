# Grill

## The owner request

> RT-3088 (Рекомендуется)

The owner picked it from three described tasks; the other options were RT-3100 (an arrow in quotes
read as a write to a file) and RT-3084 (one icon input in the second kit). The task body: the
closing pattern measures the domain spec only right after the merge of an agreement; a spec that
outgrew the limit by direct edits before it is split by nobody, and every next merge inherits the
excess.

## What is already in the tree

- The text is `projects/agent-kit/assets/patterns/task-flow-close.md`: the "When to use" item «The
  spec is measured for length right after the merge» and the paragraph «The spec is measured for
  length in the same turn» in the state `этапы-кончились`.
- No spec rule binds that paragraph: the patterns spec binds only the name of the pattern.
- The same miss twice in this session: RT-3097 and RT-3098 learned of an outgrown scenario file
  from the push set, after the work, and ran the checks again after the split.

## Questions and answers

The owner took the recommended answer three times in a row, so the six questions are closed by
assumption:

- **Does the task change the behaviour** — no application code; a text of a package pattern.
- **Does it need an edit of a law or a rule** — no: one pattern.
- **One task or several** — one.
- **What is not part of the task** — a check that measures the spec at the edit; the RT-3086
  scenario parser.
- **What shows the task is closed** — the pattern says the spec is measured before the merge and
  before a direct edit adds to it, and a spec over the limit is split by a separate commit first;
  the package is laid out and the layout audit matches.
- **The sample** — the paragraph about measuring after the merge, in the same pattern.

## Decisions

- **The measure goes before the merge and before a direct edit adds a rule or a scenario.** The task
  names the merge; this session showed the same excess arriving by a direct edit, and the cost is
  the same — a second run of the push set.
