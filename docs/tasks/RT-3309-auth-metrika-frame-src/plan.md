# Plan

**Task:** RT-3309 · **Branch:** RT-3309-auth-metrika-frame-src
**Spec:** `docs/specs/auth/counters/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** the login pages of a realm with a Metrika number refuse the Metrika frame; hits pass, the
  Webvisor recording may be empty.
- **This task reaches:** the realm `rt` lets Metrika open its frame, and the guide tells a product
  realm to do the same.
- **Sign:** the `Content-Security-Policy` header of the stand login page holds
  `frame-src 'self' https://mc.yandex.ru` — the end-to-end test SC-AUTH-117.
- **Milestone G of the epic:** none — work outside an epic by the owner's word.
- **Metric:** нет: the realm policy refused the frame the counter asks for.

## Task footprint

| What  | Where                                          |
| ----- | ---------------------------------------------- |
| Specs | `docs/specs/auth/counters/`                    |
| Laws  | `docs/constitution/verifiability.md`           |
| Rules | `.claude/skills/testing/`, `.claude/skills/spec-driven/` |
| Code  | `deploy/auth/realm/rt.json`, `apps/auth-example-e2e/src/` |
| Texts | `docs/auth-integration.md`, `projects/auth-keycloak-theme/README.md` |

## What counts as done

- The stand login page of the realm `rt` answers with `frame-src 'self' https://mc.yandex.ru`, and
  the other security headers keep their former values.
- The guide names the line a product realm adds.
- Q-2 is closed in the spec, the decision about the frame rewritten, SC-AUTH-117 written and
  covered.

## Stages

### 1. The realm policy and its test

- **Steps:**
    1. Declare the security headers of the realm `rt` with `https://mc.yandex.ru` in `frame-src`
    2. Write SC-AUTH-117 and the rule with its binding in the counters spec
    3. Add the end-to-end test SC-AUTH-117 to the entry suite
- **Readiness sign:** the entry suite passes with the new test on a stand raised from this branch.
- **Verified by:** `pnpm exec nx run auth-example-e2e:e2e` — `1 succeeded`, and the test
  SC-AUTH-117 named passed in the report.

### 2. The texts

- **Steps:**
    1. Close Q-2 and rewrite the frame decision in the counters spec
    2. Name the policy line in the connection guide and the theme README
- **Readiness sign:** the spec and document checks are green.
- **Verified by:** `pnpm run check:specs` — exit 0; `pnpm run check:docs` — «no divergences».

## What this work does not do

- The realm files of the products — they live in the products' own trees; the guide reaches them.
- A rollout of the login node — the owner's step after the merge.
