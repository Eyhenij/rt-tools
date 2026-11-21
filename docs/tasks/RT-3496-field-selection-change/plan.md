# Plan

**Task:** RT-3496 · **Branch:** RT-3496-field-selection-change
**Spec:** `docs/specs/ui-kit-v2/select/spec.md`

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** `rt-date-range`, `rt-multiselect` and `rt-date-picker` declare no output of their own: the
  built declarations carry `outputs: {}`. A consumer on signal forms cannot tell a change made by a
  person from a change pushed in from its store.
- **This task reaches:** the three fields emit `selectionChange` on every change a person makes and
  never on `writeValue`, with the value the form gets; the built declarations name it.
- **Sign:** each field's own spec shows the event on a pick and its absence on `writeValue`; the
  built `types/*.d.ts` of the three fields carry `selectionChange`.
- **Milestone:** none — work outside an epic, by the owner's word of 21.11.2026.
- **Metric:** fields of the kit with a value and no `selectionChange`, three now, go to zero.

## Task footprint

| What  | Where                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------- |
| Rules | `.claude/skills/ui-component-tests/`, `.claude/skills/angular-patterns/`                                |
| Code  | `projects/ui-kit-v2/src/lib/components/date-range/`, `projects/ui-kit-v2/src/lib/components/multiselect/`, `projects/ui-kit-v2/src/lib/components/date-picker/` |
| Texts | the `Overview.mdx` and `CONTEXT.md` of the three fields, `docs/specs/ui-kit-v2/select/spec.md`          |

## What counts as done

- Each field declares `selectionChange` of the type the owner named and emits it next to every
  form change a person makes: a pick in the panel, the cross, a removed chip, typing.
- `writeValue` and a signal form model set from outside emit nothing; the event carries the value
  the form gets — on the cross too: `null` for the range, `''` for the date, `[]` for the
  multiselect, read from the field after `super.clear()`, not a constant `null` as in `rt-select`.
- A disabled field emits nothing on the cross.
- A spec per field covers a pick, typing or a removed chip, the cross, a disabled cross,
  `writeValue` and, for the two date fields, a signal form model set from outside; each compares
  the event with the form value.
- The «Выходы» tables of the three fields name the event, as `rt-select` does.
- The version is raised by the publish workflow with `minor`; the PR does not touch it.
- After the plan: the PR merges into `main` by the owner's word, then the publish workflow runs
  with `minor`, and `npm view @rt-tools/ui-kit-v2 version` answers 0.51.0. The plan ends at the PR:
  the merge is not the executor's step.

## Stages

### 1. The event on the three fields

- **Steps:**
    1. Emit `selectionChange` from the date range field on a pick, typing and the cross
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/date-range/rt-date-range.selection-change.spec.ts --passWithNoTests=false` → exit 0
    2. Emit `selectionChange` from the multiselect on a pick, a removed chip and the cross
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/multiselect/rt-multiselect.selection-change.spec.ts --passWithNoTests=false` → exit 0
    3. Emit `selectionChange` from the date picker on a pick, typing and the cross
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/date-picker/rt-date-picker.selection-change.spec.ts --passWithNoTests=false` → exit 0
- **Readiness sign:** the three specs pass, each with a case for `writeValue` that emits nothing.
- **Verified by:** the three check lines above; the existing specs of the three fields.

### 2. Texts and the built declarations

- **Steps:**
    1. Name the event in the «Выходы» tables of the three fields
       Check: `grep -l selectionChange projects/ui-kit-v2/src/lib/components/date-range/Overview.mdx projects/ui-kit-v2/src/lib/components/date-range/CONTEXT.md projects/ui-kit-v2/src/lib/components/multiselect/Overview.mdx projects/ui-kit-v2/src/lib/components/multiselect/CONTEXT.md projects/ui-kit-v2/src/lib/components/date-picker/Overview.mdx projects/ui-kit-v2/src/lib/components/date-picker/CONTEXT.md | wc -l` → /^\s*6$/
    2. Check the built declarations of the three fields
       Check: `grep -l selectionChange dist/ui-kit-v2/types/rt-tools-ui-kit-v2-date-range.d.ts dist/ui-kit-v2/types/rt-tools-ui-kit-v2-multiselect.d.ts dist/ui-kit-v2/types/rt-tools-ui-kit-v2-date-picker.d.ts | wc -l` → /^\s*3$/
- **Readiness sign:** the six texts name the event and the build carries it.
- **Verified by:** the two check lines above after `pnpm run build:ui-kit-v2`.
