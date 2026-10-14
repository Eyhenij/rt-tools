# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Delivery
- **Done:** the spec, the registration page, the logo, the provider marks, the placeholders and the viewport gaps; tests 39 of 39, lint clean, the JAR builds
- **Next step:** push and the PR
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Rules of the registration page, the logo and the provider mark in the spec
- [x] 1.2 Scenarios of the registration page in the scenario list
- [x] 2.1 The page component with its form and its field errors
- [x] 2.2 The page in the theme map and its texts
- [x] 2.3 Tests of the page
- [x] 3.1 The logo from the HTML display name
- [x] 3.2 The provider mark as a picture of the theme
- [x] 3.3 The password placeholders and the viewport gaps
- [>] 4.1 Lint, the push gate and the PR
- [ ] 4.2 The theme package release after the merge

## Decisions along the way

- **A Keycloak refusal on a field is a check, not a set error.** The form directive runs the checks
  again on start and drops an error set by hand: the test of the refusal under the address was red
  with it. Affected stage of the plan: 2.
- **The scenarios of the login placeholders changed their promise.** The owner asked for a
  placeholder in the password field, so SC-AUTH-59 and SC-AUTH-60 keep their numbers with a new
  "Then". Affected stage of the plan: 1.

## Sessions

### 2026-10-14

- The task created, the branch taken from `origin/main` in a working copy of its own.
- `nx test @rt-tools/auth-keycloak-theme`: 9 suites, 39 tests green. `nx lint` and `stylelint`
  clean. `nx run @rt-tools/auth-keycloak-theme:build` built the JAR: `messages_ru.properties` holds
  `invalidPasswordNotEmailMessage` and `rtPasswordPlaceholder`, `dist/media/google.svg` is in it.
- The look was not measured in a browser: the pinned profile is not connected.
