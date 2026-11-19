# Plan

**Task:** RT-3432 · **Branch:** RT-3432-card-border-header-end
**Spec:** `docs/specs/ui-kit-v2/card-media/spec.md`
**Behaviour:** changes

## Points

- **A:** `rt-card` has a shadow only and no place for a state tag beside the service mark.
- **This task reaches:** a card with an opt-in 1px outline and a tag at the right edge of the mark row; a Slack mark in Figma.
- **Sign:** the story `Molecules/Card → Catalog` and the Figma frame 8348:1051 match by numbers; the owner approves both.
- **Milestone G of the epic:** none, work outside an epic.
- **Metric:** нет: new capability, not a repair of a check.

## Task footprint

| What  | Where                                         |
| ----- | --------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/card-media/`            |
| Laws  | `docs/constitution/mockups.md`                |
| Rules | `.claude/skills/kit-approval/`                |
| Code  | `projects/ui-kit-v2/src/lib/components/card/` |

## What counts as done

- The card spec passes and the kit tests and linters are green.
- The showcase numbers match the Figma frame to the whole pixel.
- The owner quoted approval of the mockup and of the showcase.

## Stages

### 1. Mockup in Figma

- **Steps:**
    1. Add the variant `Border` and the slots to the Card set
    2. Add `Service Logo/slack` and a demo frame
- **Readiness sign:** the demo frame shows the card with outline, tag and mark.
- **Verified by:** `git status --short` — the mockup lives in Figma, so the tree shows no mockup file.

### 2. Code and showcase

- **Steps:**
    1. Input `bordered` and slot `[rtCardHeaderEnd]`
    2. Story `Catalog`, specs and documents
- **Readiness sign:** specs, lint and styles are green.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=projects/ui-kit-v2/src/lib/components/card/rt-card.component.spec.ts` — all tests pass.

## What this work does not do

- Company logos in the package, equal card height in a row, a package release.
