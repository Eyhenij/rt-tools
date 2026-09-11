# Binding — the verdict of the layout about one file

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A file whose body matches the package is never a refusal.** — `projects/agent-kit/src/lib/plan.ts:planFile`
- **A body that differs from the package one is a hand edit and a refusal.** — `projects/agent-kit/src/lib/plan.ts:isRefusal`
- **A file without a header was put by somebody else and is not touched.** — `projects/agent-kit/src/lib/plan.ts:planFile`
- **A hook lands with the right to be executed, a check does not.** — `projects/agent-kit/src/lib/sync.ts:writePlanned`
- **A right removed by hand the layout brings back, and the audit does not stay silent about it.** — `projects/agent-kit/src/lib/plan.ts:planFile`
