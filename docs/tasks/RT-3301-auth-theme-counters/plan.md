# Plan

**Task:** RT-3301 · **Branch:** RT-3301-auth-theme-counters
**Spec:** `docs/specs/auth/theme/spec.md`
**Behaviour:** changes

## Points

- **A:** the entry pages load no counter; the path of a person is lost at the sign-in.
- **This task reaches:** every page of the theme loads GA4 and Metrika when their numbers are set,
  sends the page view and the form submit.
- **Sign:** the network of the theme stand with numbers set — `g/collect` with `page_view`, the hit
  `mc.yandex.ru/watch/<number>`, the event on a submit; seen by the executor and shown to the owner.
- **Milestone G of the epic:** outside an epic.
- **Metric:** нет: a new ability, not a repair.

## Task footprint

| What  | Where                                                          |
| ----- | -------------------------------------------------------------- |
| Specs | `docs/specs/auth/theme/`                                       |
| Laws  | `docs/constitution/observability.md`                           |
| Rules | `.claude/skills/testing/`, `.claude/skills/typescript-conventions/` |
| Code  | `projects/auth-keycloak-theme/`, `deploy/auth/`                |

## What counts as done

- A page with both numbers set sends `page_view` to GA4 and a hit to Metrika, and a submitted form
  sends `auth_form_submit` with the page id and no field value.
- A page with an empty or malformed number loads no tag of that counter.
- The Keycloak container of the login node and of the stand gets both variables.

## Stages

### 1. The counters in the theme

- **Steps:**
    1. Write the counters module with its unit tests
    2. Start the counters from the entry point for every page
    3. Declare the theme properties and pass the variables to the Keycloak containers
    4. Write the rules and the scenarios into the theme spec
- **Readiness sign:** the unit tests of the theme are green.
- **Verified by:** `pnpm exec nx test @rt-tools/auth-keycloak-theme` — every suite passes.

### 2. The stand

- **Steps:**
    1. Raise the theme stand with test numbers set
    2. Read the network of the sign-in page and of a submit
- **Readiness sign:** `g/collect` with `page_view`, `mc.yandex.ru/watch/<number>` and the submit
  event stand in the network; the console names any security policy refusal.
- **Verified by:** `pnpm run serve:auth` — the stand rises, and the browser network shows the three
  requests.
