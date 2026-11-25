## Task footprint

<What the work touches. Filled in by exploration before the grill and confirmed by the owner. By
this same table, at closing, one sees what of the specs, rules and patterns has gone stale: what
is named here is read twice — before the work and after it.>

| What              | Where                         |
| ----------------- | ----------------------------- |
| Specs (правится)  | `docs/specs/<domain>/`        |
| Laws              | `docs/constitution/<name>.md` |
| Rules             | `.claude/skills/<name>/`      |
| Code (правится)   | `projects/<package>/`         |

A row the work edits carries the mark «(правится)» after its name; a row read only for context
carries none. The engine measures the end of the stages by the marked rows. The step guard refuses
an edit of the description of the task flow or of its engine outside a path in backticks of a
marked row. The plan is approved with its marks: a mark added later is a new approval.
