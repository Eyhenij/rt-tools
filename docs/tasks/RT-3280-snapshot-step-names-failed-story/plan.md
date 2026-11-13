# Plan

**Task:** RT-3280 · **Branch:** RT-3280-snapshot-step-names-failed-story
**Behaviour:** unchanged — «делай правки этого говна сейчас»: the edit touches the tooling of the snapshot step, not application code

## Points

- **A:** a story that failed before its frame is reported as a reference without a story, and its
  own failure is not in the output of the set.
- **This task reaches:** a red snapshot step names the stories it did not reach; the words about an
  orphaned reference stay for a green run only.
- **Sign:** the scenarios of `tools/tests/showcase-probe.test.sh`, read by the executor.
- **Milestone G of the epic:** an epic of several tasks reaches `main` with no false refusals.
- **Metric:** нет: шаг снимков называл упавшую историю эталоном без истории.

## Task footprint

| What  | Where                                                                                  |
| ----- | -------------------------------------------------------------------------------------- |
| Specs | none: the snapshot tooling has no domain spec                                          |
| Rules | `.claude/skills/ui-component-tests/`                                                   |
| Code  | `tools/showcase-probe.mjs`, `tools/visual-snapshots-v2.mjs`, `tools/visual-gate.mjs`   |
| Code  | `projects/ui-kit-v2/.storybook/test-runner.ts`, `tools/tests/showcase-probe.test.sh`   |

## What counts as done

- A story of the second kit is written into the registry before its frame, with its width frames.
- On a red run the wrapper and the gate print the stories the run did not reach and do not call
  their references orphaned.
- On a green run an orphaned reference is refused as before.

## Stages

### 1. The verdict about unopened references

- **Steps:**
    1. Add the pure function of the verdict to the showcase probe
    2. Add its scenarios
    3. Call it from the wrapper of the second kit and from the gate
- **Readiness sign:** the scenario file ends with no failed line.
- **Verified by:** `bash tools/tests/showcase-probe.test.sh` — the last line names zero failures.

### 2. The registry is written before the frame

- **Steps:**
    1. Write the story and its width frames in the visit preparation of the second kit
    2. Bring the texts of the rule up to date
- **Readiness sign:** the harness compiles and the lint of the second kit is green.
- **Verified by:** `pnpm exec nx run @rt-tools/ui-kit-v2:lint` — exit 0.

## What this work does not do

- A retry of a story that did not fit its time: the wrapper refuses it on purpose.
- The length of the output the set keeps for a red step: the set belongs to the package, task
  RT-3273.
