# Plan

**Task:** RT-2976 · **Branch:** RT-2976-ai-chat-scenario-ids
**Behaviour:** unchanged — only scenario numbers and the titles of their tests move. Владелец:
«RT-2972 сейчас, потом RT-2965 (Recommended)».

## Task footprint

| What  | Where                                |
| ----- | ------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/ai-chat/`      |
| Laws  | `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/spec-driven/`        |
| Code  | `projects/ui-kit-v2/src/`            |

## What counts as done

- The specs audit shows no divergence, and the second kit tests are green.

## Stages

### 1. The ai-chat scenarios get free numbers

- **Steps:**
    1. Move the seven scenario headings and their bindings to SC-UKV-1051…1057
    2. Rename the test titles by the same map
    3. Run the specs audit and the second kit tests
- **Readiness sign:** the audit exits zero, the tests pass.
- **Verified by:** `node tools/check-specs.mjs` — no «divergences» line; `pnpm exec nx test
@rt-tools/ui-kit-v2 --skip-nx-cache` — exit code 0.

## What this work does not do

- The numbers of aside-options and form-dictionary.
