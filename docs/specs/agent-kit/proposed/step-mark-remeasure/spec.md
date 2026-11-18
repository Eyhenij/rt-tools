# A mark is measured again, not believed

**Status:** proposed · **Revision:** 2026-11-18 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/turn-guards/flow-script/spec.md`,
`docs/specs/agent-kit/turn-guards/flow-script/guard/spec.md`,
`docs/specs/agent-kit/turn-guards/flow-script/replay/spec.md`
**Laws:** `work-conduct`, `verifiability`, `delivery`
**Procedures:** none

## Why

The engine writes a step mark after the check of the step matched, and the approval mark after the
owner's approving answer is found. The guard of the course of work and the measurers of exits 5 and
7 believe both files as they lie. They are plain JSON in the common directory of git, and the hooks
run as the same user on the same filesystem as the agent: a command the guard does not read as a
write, or a script that computes the path itself, puts a mark there, and a step nobody measured
passes as done, or an edit of the engine nobody approved goes through.

The same hole stands in the replay of the model hooks: the subagent that judges a recorded turn can
read the file of expected verdicts, and only a sentence in its prompt tells it not to.

A key the agent cannot read does not exist on this machine. So the work changes who may say a step
is done and what is measured once more before the work leaves the machine: only the engine marks a
step done, every done step is measured again once before the PR opens, and the approval is confirmed
in the session record, not in the mark.

The rules below merge into `docs/specs/agent-kit/turn-guards/flow-script/` and its subdomains: the
rules of the engine, of exit 5 and of the final rerun into the engine itself, the rules of the edits
the guard refuses into `guard/`, the rules of the judge into `replay/`. All carry the prefix `SC-AK`,
so the scenarios share one numbering.

## Terminology

- **The final rerun** — the command `step --done` of the engine run once over every done step before
  the PR of the task opens.
- **The record directories** — the directories where the harness keeps the session records of this
  repository, one per working copy; the copies are the ones `git worktree list` names.
- **The place of the answer** — a session record in one of the record directories and the `uuid` of
  the entry in it where the owner chose the approving option in a menu. The approval mark names it.
- **The judge** — the model that reads the text of a model hook (`turn-judge`, `ask-judge`) and one
  recorded turn and answers `allow` or `block`.

### What it is called in the interface

There is no interface: the guards answer the agent with a refusal or stay silent, and the replay
prints a line per fixture.

## Rules

### The step

- **On a match the engine marks the step done in the progress itself, next to writing its mark.** The
  next step that is not done becomes the current one in the same write.
- **An edit that newly marks done a step of a plan with checks is refused, whatever mark lies on disk.**
  The engine is the only writer of a done mark; a mark file written past it gives nothing to an edit.
- **Whether a plan has checks, and which, is read from the commit that added the plan, never from the working copy.**
  A plan stripped of its check lines in the working copy does not lift the refusal.
- **A replacement quote is searched in the record directories of every working copy.**
- **The marks are kept by branch, and the latest measurement of a step in any working copy is the one that holds.**

### The final rerun

- **The PR of a task does not open until every done step matches on the final rerun.**
- **The refusal of the PR names every step that did not match, with its expected result and what it got.**
- **The final rerun reads the plan and the progress from the history when the task folder is already taken apart.**
- **A check that changes a tracked file does not match.** A check measures; one that edits the tree
  could make itself green.
- **A check that fails on the network does not match, and the refusal names the network as the cause.**
- **A step past its limit of 540 seconds, or whose command does not run, does not match on the final rerun.**

### The approval

- **An edit of the description and the engine needs the owner's approving answer found at the place the approval mark names.**
- **An approval mark whose place holds no approving answer counts as no approval.** The answer must
  be a menu option the owner chose after the calls of both roles, beginning with «Одобряю» and
  naming the plan or the task — the same test `plan-red` applies when it writes the mark.
- **An approval given in any working copy of the repository holds in every other.**
- **A record outside the record directories gives no approval, the one `RT_FLOW_TRANSCRIPT` names included.**
  The variable is set by whoever calls the engine, and the agent can set it.
- **An approval holds only for the plan commit it names.** A mark naming another commit counts as
  none, and a plan added again after the approval loses it.
- **An approval mark that names no place counts as no approval outside `words.legacyBranches`.** A
  mark written before this work is one such; a branch in progress asks the owner again.
- **An answer that can no longer be found at its place is refused, and the refusal names the move: ask the owner again and run `plan-red`.**
  A record removed by the retention cleanup of the harness and an entry gone from a record are both
  such cases.
- **Exit 5 confirms the approval at its place as the guard does, and does not read the answer from the mark.**
- **The session records in the record directories are written by no tool call and no shell command the guard reads.**
  The guard reads them as it reads the directory of the marks: a write named in the command text is
  refused. A session record is a file ending in .jsonl; the memory and the other files of the same
  directory are written as before.

### The replay of the model hooks

- **The judge's prompt holds the text of the hook and only the `turns` and `next` of the fixture.** No
  file name, `case` or `kind` reaches it: each of them can tell the verdict.
- **The judge runs outside the tree with no tools, settings, hooks, MCP servers or memory, on the model the hook uses in production.**
  That model is the one the settings entry of the hook names, or the harness default when it names
  none.
- **The script compares the judge's verdict with the expected verdicts after the judge answered.**
- **A judge answer that is not one verdict, `allow` or `block`, is a mismatch.**
- **The verdicts are taken only from the judge's answers in the same run.** The verdict files an agent
  wrote for the earlier replay are removed and never read.
- **The replay runs by hand and as a plan step, not in the set before a push.** It calls a model once
  per fixture.

Scenarios of the live specs that change their promise when this work lands are edited there by the
commit that changes the code and the test titles: `SC-AK-1414` (a done mark is written by the engine,
and an edit that writes one is refused), `SC-AK-1411` (the approval mark carries the place of the
answer and the plan commit). `SC-AK-1726` rests on the rule of the engine already in force — a step is
refused while a file of the task folder differs from the commit of the plan — and adds only that such
a step stays not done in the progress. The sentence of `replay/` that hands the hook text and the fixtures to a
subagent is replaced by the rules above.

## What is out of scope

- **No key signs the marks.** The hooks run as the same user as the agent: whatever a hook reads to
  check a signature, the agent reads too.
- **No service under a separate OS user holds the marks.** It needs the owner's `sudo`, and the owner
  told the executor to decide without them.
- **No keychain entry with a confirmation guards the marks.** It opens a window for the owner on every
  step.
- **The file of expected verdicts is not moved.** The same user reads it in any place.
- **A record forged by a script that computes the path itself is not detected.** The guard reads the
  command text, and the same user writes where the harness writes.
- **Exit 7 keeps reading the marks.** A done mark and a mark forged past the guard pass it; the final
  rerun catches them before the PR.

## Contract

The hook of the course of work stays as the subdomain `guard/` describes it. Its new refusals are an
edit that marks a step done, and a write into the session records; the first maps to the action
`mark_step_done` of the decision table with the move `node tools/task-flow-script.mjs step <N.M>`,
the second to the action `write_marks`. A refusal of the approval maps to `edit_flow_description` with
the move: ask the owner again and run `plan-red`.

The command `step <N.M>` keeps its output and codes; on a match it also writes the progress.

The final rerun runs at the opening of the PR of a task, under the limit of the hook before a tool
call, 1800 seconds. It runs `step --done`, and a line that did not match refuses the opening with
the lines of every such step.

The replay of the model hooks is one command that takes the hook name (`turn-judge` or `ask-judge`),
runs the judge on every fixture the expected verdicts name, and prints a line per fixture — the
fixture, the expected verdict, the verdict got — and then `cases <n>, mismatches <m>` with code 0
when `m` is 0 and code 1 otherwise.

### Refusal codes

Not applicable: a refusal comes as text naming the step or the path, what is wrong and the command
that fixes it.

## Data

- **The step mark** stays as the engine writes it today; exit 7 keeps reading it.
- **The progress** gets its done marks from the engine; the agent edits the current mark and the rest.
- **The approval mark** adds the place of the answer — the path of the record in one of the record
  directories and the `uuid` of the entry — next to the plan commit it already carries. The answer
  text stays in the mark for a reader; neither the guard nor exit 5 takes it from there.
- **The expected verdicts** stay in `projects/agent-kit/tests/turn-replay.expected.json`; the judge
  never receives them.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The refusals are written in English, as every check refusal in this tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The final rerun measures every done step of the task at once, and one refusal names every step that
did not match. An approval is looked for in the record directories of every working copy.

## Decisions

- **The mark is a cache, not a proof.** Rejected: signing it — no secret on this machine is out of
  the agent's reach.
- **The step is measured again once per PR, not on every done mark and every end of a turn.** Exit 7
  is measured at every end of a turn under a limit of 75 seconds; the check of the guard suite alone
  takes 36 seconds, `task-flow-script-steps` 8 seconds and `task-flow-script` 9 seconds, and a rerun
  in the guard would run every check twice. Rejected: a rerun in the guard and at exit 7.
- **The engine writes the done mark, so the guard does not need to measure.** An edit that marks a
  step done is refused outright; a write past the guard is caught by the final rerun.
- **The approval is searched in the record directories of every working copy.** An approval found in
  one copy's directory alone would hold the work of another copy with no way out.
- **The judge gets no tools instead of a prompt that forbids reading.** A sentence in the prompt is a
  request; a call without tools has nothing to read the file with.

## Open questions

None.

## History of changes

- 2026-11-18 — the agreement was written: the engine alone marks a step done, every done step is
  measured again before the PR opens, the approval mark is confirmed in the session records of every
  working copy, and the judge of the replay runs with no tools outside the tree.
