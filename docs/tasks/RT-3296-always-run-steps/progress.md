# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 4 — children the tracer followed count as traced
- **Done:** the task, the branch and the folder; the measurement of the ten steps; the owner
  approved the plan: «Одобряю, делай»
- **Next step:** step 1.1
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [>] 1.1 The tracer writes the parent pid next to its record
- [ ] 1.2 A spawn whose child left a record is read through the child, not named untraced
- [ ] 1.3 A native binary started by a traced node child counts as reading the files its parent passed
- [ ] 2.1 `git log` and `git diff` with `-- <path>` read that path as a walk
- [ ] 2.2 `git diff --name-only` of the change reads the files of the change the step then opens
- [ ] 3.1 `bash <file>` and `bash -c` with `. <file>` read those files and the files they source
- [ ] 3.2 `npm view` and `npm pack` read the registry, not the tree
- [ ] 4.1 The spec of the push gate names the three new readings, with scenarios and tests
- [ ] 4.2 The table is recorded anew on a green tree
- [ ] 4.3 The push set runs green on this branch

## Decisions along the way
