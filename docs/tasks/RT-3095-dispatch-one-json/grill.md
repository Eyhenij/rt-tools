# Grill

## The owner request

> бери

Said to the offer of RT-3095 among three tasks outside an epic. The task body: when several guards
answer one event, the dispatcher glues their output by a newline. Several JSON objects in a row are
no longer one JSON, and the agent reads the whole as raw text. In a tree that installs the package
the session start gave three objects and a plain text, the parse fell on `Extra data`, and the laws,
the glossary and the handover reached the session cut.

## What is already in the tree

- `projects/agent-kit/assets/hooks/dispatch.sh` — `collected` gathers every branch output and the
  end prints it as it is; a refusal by a decision in the output already leaves alone.
- The suite `projects/agent-kit/tests/dispatch.test.sh` (311 lines); the spec
  `docs/specs/agent-kit/dispatch/` (177 scenario lines).

## Questions and answers

Closed by assumption, as the tasks before it:

- **Does the task change the behaviour** — yes, of the package dispatcher; no application code.
- **Does it need an edit of a law or a rule** — no: one spec rule.
- **One task or several** — one.
- **What is not part of the task** — the refusal path: it already prints one object and leaves.
- **What shows the task is closed** — scenarios: two guards answering one event give one JSON
  object with both texts in it; a single guard's output stays as it was.
- **The sample** — the task body names the fields.

## Decisions

- **One answer is given out as it is.** Merging is needed only where there are several, and a single
  answer stays byte for byte what the guard printed.
- **Plain text goes into the context of the event, objects are merged field by field.** The texts of
  `additionalContext` and of `systemMessage` are joined by an empty line; the other fields are taken
  over in the order of the branches.
- **An event without a context field keeps the text in the system message.** The end of a turn and
  the compaction take no `additionalContext`, and a field the agent does not know would be dropped.
