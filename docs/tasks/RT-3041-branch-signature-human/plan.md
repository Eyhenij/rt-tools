# Plan

**Task:** RT-3041 · **Branch:** RT-3041-branch-signature-human
**Behaviour:** unchanged — the owner's word «Научить проверку»: the edit touches a guard of the rules package, not application code

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                 |
| ----- | ------------------------------------- |
| Specs | `docs/specs/agent-kit/delivery-gate/` |
| Laws  | `docs/constitution/delivery.md`       |
| Rules | `.claude/skills/git-workflow/`        |
| Code  | `projects/agent-kit/assets/hooks/`    |

## What counts as done

- A branch with a task number is created when the working copy signs with a mail from
  `RT_HUMAN_EMAILS`.
- A mail named nowhere is still refused.

## Stages

### 1. The guard accepts the mail of a named person

- **Steps:**
    1. Add the scenario SC-AK-1234 to the delivery-gate scenarios
    2. Accept the mails of RT_HUMAN_EMAILS in the branch creation condition
    3. Cover both cases in the readiness suite and lay out the package
- **Readiness sign:** the readiness suite passes whole, the laid-out guard matches the source.
- **Verified by:** `bash projects/agent-kit/tests/git-guards-readiness.test.sh` — the last line
  names zero failures.

## What this work does not do

- RT-2927 itself — it goes on its own branch after this one.
