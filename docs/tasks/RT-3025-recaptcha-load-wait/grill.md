# Grill

## The owner request

> делай код ревью на то говно что ты написал и запускай проверки локально

The review of the RT-3013 edit named this as its first finding; the owner's next word was «какого
хуя ты стоишь?», and the work goes on from the finding.

## What the tree already has

- `whenRecaptchaReady` in `projects/auth-keycloak-theme/src/login/kc-recaptcha.ts`: on the `load`
  of the Google script it calls the wait again. If `grecaptcha` is not on the window by then, the
  wait finds the same script and listens for `load` once more — an event that never comes again.
- Scenarios SC-AUTH-91…95 in `docs/specs/auth/theme/scenarios.md`; the specs in
  `kc-recaptcha.spec.ts`.

## What the rules already say

- The verifiability law: a behaviour no end-to-end suite can walk says so in words and says what
  closes it. The stand serves the real Google script, which defines `grecaptcha` on its load, so
  the case cannot be raised there.

## Questions and answers

None asked: the finding names the work in full.

## Decisions

- **A load without `grecaptcha` ends the wait, as a failed load does.** Rejected: polling the
  window for `grecaptcha` — a timer with no end on a page that will never get the widget.
- **The case is closed by a unit test and by the `E2E-skip` line.** The stand cannot serve a
  Google script without `grecaptcha`.

## What is left unclear

- No.
