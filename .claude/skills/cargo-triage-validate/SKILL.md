---
name: cargo-triage-validate
kind: pattern
rule: cargo-triage
description: A pattern of the rule cargo-triage. Take it before any record of the cargo is taken into work. The order of validating a record, the signs of an executor's miss dressed as a package defect, the mission check and the line of the verdict.
---

# Validating a record before work

A pattern of the rule `cargo-triage`. What must be true meanwhile is the law
`docs/constitution/work-conduct.md`.

## When to use

- The cargo is read, and a record is about to be taken into work, sent to quarantine or closed.
- A task of an epic of the cargo begins, and its records are listed in the grill.

## The order

1. **Read the record whole.** The beginning a list row prints is not the record: its mechanism and its
   proposed fix stand further down.
2. **Name the edition the record came from and the current one.** The arrival date of the record against
   `git tag --contains <commit>` of the resource; a record older than the edition that replaced its resource
   is checked first for «no longer reproduced».
3. **Find what covered the case at that edition.** The rule, the pattern, the guard by its refusal text:
   `git show <tag>:<path>`. A covering text that stood there and that the record does not quote, or quotes in
   part, points to the executor's miss.
4. **Read what the executor did against that text.** The record names the turn, the call and the refusal. A
   refusal that named a lawful move, and a next call that took another one, is the executor's miss.
5. **Reproduce on the current edition.** The guard with the record's input, the rule text at the place it is
   said to be silent. Nothing reproduced — no package verdict, whatever the record argues.
6. **Compare with the mission.** The mission of the package stands in the tree's missions document. Which part
   of it the edit moves: a working result by the person's words, no watching over the agent, a mistake that does
   not come back. None — quarantine with that reason.
7. **Weigh the drift.** The edit loosens a check, adds an exception for one workaround, or adds text nobody
   acts on: refused, whatever the other answers.
8. **Write the verdict line** before any edit or mark.

## Signs of an executor's miss dressed as a package defect

- The record says «no lawful move», and the refusal it quotes names one.
- The proposed fix lets through what the rule forbids: a skip, a softer check, a list of exceptions.
- The rule the record calls silent covers the case one section further than the record quotes.
- The record was written in the session right after the miss, and its text describes the guard, not the call.
- The same mechanism stands in several records of one tree and in none of the others.

A sign is not a verdict: it sends the reading back to steps 3 and 4.

## The verdict line

```
- **Запись <key>** — <промах исполнителя | промах документации | промах кода пакета | не воспроизводится> · миссия: <служит | не служит> · `<file>:<line>` — <evidence>
```

The key is the full one, as the read prints it. The file and line point to the text or code that decided:
the covering rule for the executor's miss, the silent or wrong place for a package verdict, the code that
replaced the resource for «no longer reproduced».

## What happens next by the verdict

| Verdict | Next |
| --- | --- |
| промах исполнителя | closed with no edit of the package; a repeat across trees goes to an incident analysis |
| промах документации, промах кода пакета | the comparison with the spec of the resource, then the task |
| не воспроизводится | closed by the publisher with the edition that replaced the resource |
| миссия: не служит | quarantine with the reason, whatever the verdict |

## Common misses

- **The record taken into work by its title.** Twelve records were taken into a task on 28.11 without a
  verdict, and seven of them described hooks the current edition no longer had.
- **A record argued with the spec and the spec held on purpose.** The scenario that held the turn after the
  owner's «ну что там?» was the decision, not a defect.
