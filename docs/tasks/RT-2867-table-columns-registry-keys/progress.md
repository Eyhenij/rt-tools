# Progress

## Where we stand

- **State:** `этап-идёт`
- Stage 1 is done: the service spec 12 of 12, the kit typecheck green. Stage 2 goes on: the kit
  tests and lint run in the background; the archive record is written. The showcase on 6007 is
  down, so the snapshots are compared by the push set.

### Stage 1 — the key and the copy

- [x] 1. The prefix in the registry
- [x] 2. The service reads, copies, writes and resets by the kit key
- [x] 3. Tests of the four scenarios, former tests brought to the new key

### Stage 2 — closing

- [x] 1. The agreement merged into `table-full-port`
- [ ] 2. The kit tests, lint and the visual gate ← now
- [ ] 3. The folder taken apart, the PR into the RT-2866 branch

## Decisions along the way

- The two stores differ in the key and in the shape of the value; shared code between them is a few
  lines. Each keeps its own prefix under `rt.`.
- The plan header named the agreement by the word «Agreement»; the guard reads only «Draft», so the
  word was changed before the first stage. Nothing else in the plan moved.

## Sessions

- 2026-10-30: task taken after RT-2866 was handed over (#3019); question 4 asked and answered; the
  agreement and the plan written.
