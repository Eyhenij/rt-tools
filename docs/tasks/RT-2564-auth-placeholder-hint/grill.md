# Grill

## The owner request

> ты написал плэйслхолдер таким же как и тайтл

## What the tree already has

- The theme puts the Keycloak label of a field into its placeholder: the sign-in page (the login
  and the password), the reset page (the login) and the new password page (both password fields).
- The rule stands in `docs/specs/auth/theme/spec.md`, scenario SC-AUTH-59 in
  `docs/specs/auth/theme/scenarios.md`, its test in
  `projects/auth-keycloak-theme/src/login/pages/login/rt-kc-login.component.spec.ts`.
- The label already stands above every field, so the placeholder repeats it word for word.

## What the rules already say

- `doc-style`: the words a person sees come from the language of the domain.

## Questions and answers

**What does an empty field show instead of the repeated label?**
No answer in words. Question closed by assumption: the recommended option — an example value
`name@example.com` in the login fields, no placeholder in the password fields.

## Decisions

- **The login field shows the example value `name@example.com`.** — it says what to type, the label
  says what the field is. Rejected: no placeholder at all — the owner asked about the repeat, not
  about removing the hint.
- **The password fields have no placeholder.** — an example password tells nothing and teaches a
  weak one.
- **The example value is not translated.** — an address reads the same in every language.
- Question closed by assumption: the behaviour changes — the rule of the theme spec is rewritten.
- Question closed by assumption: one task, no law or rule edit.

## What is left unclear

- Nothing blocks the work.
