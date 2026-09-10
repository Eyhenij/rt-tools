# Scenarios — the verdict of the layout about one file

The spec is `spec.md` next to it. The scenarios check what the layout decides about a single file:
put it, put it again, refuse it, return the right to run.

### SC-AK-08 — a divergence of the body at a matching header is visible to `doctor`

Given the version in the header of a laid-out file matches the package one, and the body diverged When
`doctor` runs Then the divergence is named

### SC-AK-886 — a hook lands executable even with a lost bit at the source

Given a file of the hooks directory in the package lies without the right to be executed
When the layout runs
Then the laid-out copy gets the right to be executed: otherwise the guard does not start at all and
looks installed — the file is in place, the layout reported, and the guards by construction stay silent

Given a check in the package lies without the right to be executed
When the layout runs
Then the laid-out copy does not get it: part of the checks are called by the executor, and they need no
bit

Given a check in the package lies with the right to be executed
When the layout runs
Then the laid-out copy keeps it

Covered: `projects/agent-kit/src/lib/sync.spec.ts`.

### SC-AK-887 — a removed right to run the layout brings back

Given a laid-out hook is whole in body, and the execution bit is removed from it When the layout is
called Then the right comes back, and the body is not rewritten: what has to be fixed is the run, not the
text

Covered: `projects/agent-kit/src/lib/plan.spec.ts`, `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-888 — the audit does not stay silent about a removed right

Given a laid-out hook lies without the right to run When the layout audit is run Then it names this file
as a divergence and answers with a non-zero code: a hook registered by a command without the bit does not
start at all and looks installed

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-1079 — a body matching the package is not a hand edit

Given the body of a laid-out file matches the package one byte for byte, and the header diverged
from it
When the layout runs
Then the file is put again and the header divergence is named: the word "edited by hand" sends the
reader looking for an edit that is not there, and a refusal by one such file cancels the whole
layout — it puts everything or nothing

Given the body of a laid-out file differs from the package one
When the layout runs
Then it refuses and names the file edited by hand, as before

Covered: `projects/agent-kit/src/lib/plan.spec.ts`.
