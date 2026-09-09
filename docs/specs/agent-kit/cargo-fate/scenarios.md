# Scenarios — the fate of one's own records in the intake

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-961 — a record is shown with its state, its fix and the version of the release

Given the intake holds a record of this tree, fixed and released
When the command of the fate is called
Then the line about the record names its state, what it was fixed by and the version of the release

Covered: `projects/agent-kit/src/lib/fate.spec.ts`.

### SC-AK-962 — an override is named next to the record its mark ties it to

Given a section of an override carries the mark of the article of a sent proposal
When the command of the fate is called
Then the section is named next to the record whose text holds that article

Covered: `projects/agent-kit/src/lib/fate.spec.ts`.

### SC-AK-963 — a section whose article the laid-out edition already holds is named for lifting

Given the article of the mark stands in the resource of the laid-out edition
When the command of the fate is called
Then the section is named among those to be lifted now

Covered: `projects/agent-kit/src/lib/fate.spec.ts`.

### SC-AK-964 — a released fix that has not reached the tree is named as an update

Given the record is released, and the laid-out edition does not hold the article of the mark
When the command of the fate is called
Then the line about the section says an installation is due, not a lifting

Covered: `projects/agent-kit/src/lib/fate.spec.ts`.

### SC-AK-965 — a mark without a record of its own is named apart

Given the mark of a section names an article no record of the answer holds
When the command of the fate is called
Then the section is named in a part of its own, and the output says the intake gave no record for it

Covered: `projects/agent-kit/src/lib/fate.spec.ts`.

### SC-AK-966 — the command changes no file of the tree

Given the tree holds overrides with marks, and the intake answered with records
When the command of the fate is over
Then the files of the overrides lie unchanged

Covered: `projects/agent-kit/src/lib/fate.spec.ts`.

### SC-AK-967 — without a token or an address the call does not go into the network

Given the tree has named no token or no intake address
When the command of the fate is called
Then it refuses before the request, names where they live and ends with a non-zero code

Covered: `projects/agent-kit/src/lib/fate.spec.ts`.
