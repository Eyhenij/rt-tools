<!-- rt-kit v0.26.0 · samples/tasks/_template/progress.md · d18a177cf8a3 · правится надстройкой, не здесь -->
# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `<name from the state list of rule task-flow>`
- **Stage:** <number> of <total> — <name>
- **Done:** <briefly>
- **Next step:** <what is done first in the new session>
- **Uncommitted:** <what lies in the tree outside the index>
- **Waiting for the owner:** <what exactly, or "no">
- **PR:** <number and state, or "not open yet">

## Steps

The steps of the plan, all of them, with a mark each. Rewritten by every turn that moves the work.

- `[x]` done · `[>]` going on right now · `[ ]` not begun

Exactly one step carries `[>]`. The numbers and the names are copied from the plan and not
reworded: a check matches the two lists, and the turn exit guard counts what is not done yet.

- [x] 1.1 <name of the first step of the first stage>
- [>] 1.2 <name of the second step of the first stage>
- [ ] 2.1 <name of the first step of the second stage>

## Decisions along the way

- **<decision>** — <reason>. Affected stage of the plan: <number>.

## Sessions

### <date>

- <what was done, in numbers: files, commits, what is green>
- <what we stumbled on and what caught it>
