# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — functions
- **Done:** both functions in utils, 300 package tests, the package builds
- **Next step:** take the folder apart and open the PR
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The spec of the subdomain, its scenarios and bindings
- [x] 1.2 The two functions, their specs and CONTEXT
- [x] 1.3 The barrel, the package README and the tag overview row

## Decisions along the way

- Each function got its own folder, `get-color-based-on-background/` and `darken-hex-color/`, and the
  hex parser shared by both went to `internal/`: the package keeps one function per folder. The spec
  bindings point there.
- The utils package got a domain spec of its own, with one package-wide rule bound to the coverage
  gate: the spec check refuses a subdomain whose domain has no spec. The plan names only the
  subdomain.
- The «Contract» section says not applicable: the spec check reads a table there as server
  procedures.

## Sessions

### 2026-10-05

- The task is taken by the owner's word «Перенести в utils (Recommended)».
