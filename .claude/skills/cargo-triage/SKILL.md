---
name: cargo-triage
kind: rule
law: work-conduct
description: A rule under the "Law on work conduct". Take it when the cargo that arrived in the intake is sorted out — incident analyses and proposals from trees. It names what the cargo is read by and when a record gets the marks of a fix and of a release. The pattern is cargo-triage-mark.
---

# Sorting out the arrived cargo — how it is arranged here

A rule under the law `docs/constitution/work-conduct.md`. Cold part: `pitfalls.md` — the whole text,
every article with its reasons, the pitfalls of the marks.

**Requires:** `.claude/hooks/cargo-mark-guard.sh`

## How the law applies here

- **The cargo is taken from the intake by a command, not by eye in the admin panel.**
- **Cargo is not created in the work queue; old cargo there is not judged as a task.**
- **Sorting out starts with what is not sorted out, asked of the intake.**
- **A disputable record goes to quarantine with a reason, and only the owner takes it into work.**
- **Taking a report into work creates a task, with the mark in the same turn; one edit, one task.**
- **"Done" is set at the merge into main, by the state `влито`, with the fix.**
- **"Released" is set by the edition's publisher at publication, a neighbour's record too.**
- **Both sides of the sorting out go by commands, and they are closed differently.**
- **The service account's pair lies outside the repository.**
- **A key is written in full, goes to the archive with the grill, and the mark takes it from the
  read.**
- **The records of a whole sorting out travel in one batch, and the answer is read.**
- **The release version is one number, without the package name.**
- **Sorting out the cargo and gathering the proposals are two different steps.**
- **A proposal is compared with its resource's spec before work, by three named outcomes, and the
  move names the spec.**

## An incident analysis: what is in it and where it lives

- **The analysis lives in the intake, on the tree's disk only until the send.**
- **The record is made in the same session the incident happened in.**
- **The analysis names the mechanism step by step, not an appraisal of the executor.** It names
  what was available before, what caught it and what went into the rules layer.
- **The record's name names the miss, not the task.**
- **A defect in the code is not closed by an incident analysis.**
- **An analysis has no edits after the fact.**

## Names and techniques

- The fix names what by (article, guard, check, code edit); a task link is no fix.
- Spec right → no work; spec wrong → fix spec, then code; silent → ask the owner.
- The record's name is `<year>-<month>-<day>-<short name>`, also its key.
- A refused line is sorted out by its reason, not by repeating the call; 0 moved is a miss.
- A dry run is not a mark.

## Patterns

- `cargo-triage-mark` — the ready-made read and mark calls.
