# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — The check on a local Keycloak
- **Done:** the spec, the code, the unit tests (42 of 42) and the check on the local Keycloak
- **Next step:** after the owner's word — take the folder apart, push, open the PR, release the theme
- **Uncommitted:** nothing beyond the current stage
- **Waiting for the owner:** the push, the PR and the release of the package — «Пуш, PR и выпуск версии пакета — только после одобрения владельца»
- **PR:** not open yet

## Steps

- [x] 1.1 Write the two rules and their scenarios into the theme spec
- [x] 1.2 Bind the rules in the companion of the spec
- [x] 2.1 Load the page scripts from the frame after the first draw
- [x] 2.2 Draw the reCAPTCHA block in the registration form
- [x] 2.3 Write the unit tests of the frame and of the registration page
- [x] 3.1 Raise the auth stand with the built theme
- [x] 3.2 Turn on registration and reCAPTCHA with the Google test key on the stand realm
- [x] 3.3 Register through the page in the browser

## Decisions along the way

- **The scenarios are SC-AUTH-87 to SC-AUTH-89, not 84 to 86.** The number command named 84 to 86
  as held by neighbouring branches. Affected stage of the plan: 1.
- **The block gets the `g-recaptcha` class through the class list pipe, next to its BEM element.**
  The Google script finds the widget by that class, and the template linter forbids a bare class
  attribute. Affected stage of the plan: 2.
- **A form narrower than 304 pixels scales the widget down by a quarter.** Measured at 360 pixels,
  the widget stood 26 pixels past the form. A container query on the block fixes it. Affected
  stage of the plan: 3.
- **The registration with a ticked widget was not reached, and the readiness sign of stage 3 is
  met in part.** Google answers «Invalid site key» to its own test key: a bare render of that key
  by the Google script gives the same answer, so the theme is not the cause. What was confirmed:
  the widget is drawn, its answer field is in the form, and Keycloak answers «Invalid Recaptcha»
  to the empty answer. Affected stage of the plan: 3.

## Sessions

### 2026-10-30

- The task RT-3003, the branch from the main branch, the plan. The theme suite before the work: 9 suites, 39 tests, all green.
- The spec, the code and three tests; the theme suite is 9 suites, 42 tests, all green.
- The local stand in a realm of its own, removed after the check: the page context carries the
  site key and the Google script; the widget is drawn above the button, 304 by 78 pixels on a
  wide screen and 228 by 58.5 at 360 and 320 pixels, inside the form, 20 pixels above the button;
  the posted form holds `g-recaptcha-response`. The realm of the stand was not touched.
