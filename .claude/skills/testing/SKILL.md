---
name: testing
kind: rule
law: verifiability
description: Rule under the verifiability law. Load when editing any test file or end-to-end suite. Patterns testing-unit, testing-e2e.
---
<!-- rt-kit v0.37.1 · rules/testing.md · 9ea5e32306c2 · правится надстройкой, не здесь -->

# Verifiability — how it works here

Rule under the law `docs/constitution/verifiability.md`. Cold part: `pitfalls.md`, `pitfalls-2.md`.

## How the law applies here

- **A test title starts with its scenario id and a dash.** No test: a reasoned mark, dropped when
  the test comes, re-read with its subject; off-path: partial; absent id: red.
- **A "Then" naming a person and what they see is closed end to end.** A variable switch is no
  coverage; skip by stand state only what it never has.
- **A decision moves into a pure function, checked by a call.** The moment is a parameter; fixture
  and call moments are both fixed or both clock-read.
- **A Connect procedure is called with a hand-written database double, and by the end-to-end
  suite.**
- **The seed creates what a screen needs, nothing a guest takes for real.** No owner settings.
- **A build or pipeline edit is checked from scratch; its PR waits for its run.**
- **A new check goes into the push gate or the pipeline; a laid-out one arrives with its place.**
- **A test that irreversibly changes stand data is off by default.**
- **Tests needing nginx run only with `BASE_URL` set.**
- **A linter rule against an accepted technique is off in the config, not bypassed per test.**
- **A broken guard lets the action through; one that did not recognise the call is silent too.**
  `FAIL-OPEN` in its header names them; the call sign errs toward firing.
- **A test file is edited by the edit tool.**
- **A known list is named and explains itself.** Entry: reason, task; debt has opened work;
  leaves with its caller; a dead-entry check comes along; no later line or inline disable, even by
  the owner.
- **Red has an assigned action; a second rerun is not it.**
- **An exchange counts as read on both sides.** Name its reader at creation; a shared value comes
  from the declarer; a shared field is checked where assembled.
- **An absence test is green even on the wrong target.** Pair it with a positive; use an
  impossible value.
- **A count over run output means nothing until the run reached that step.**
- **A test title promises more than its body checks, unseen by the audit.** Read both.
- **A command's success is re-read by a separate request; a service is up when a request passed.**
- **Snapshot references lie by the test, update by a separate call, are read by eye.** Raster
  named; mask hides content, not width; time-derived is fixed; seeding self-checks.

## This tree

- **Packages test on Jest; an e2e suite raises its own stand.** A PR adds a test of the suite its paths demand, or `E2E-skip: <reason>` in a code commit; root or harness edits demand none. Image suites never run from a temp-dir copy.
