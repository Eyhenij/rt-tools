# Grill

## The owner request

> для поля с паролем необходимо показать все треобвания к сложности пароля

## What the tree already has

- The theme draws `login-update-password.ftl` with two password fields and no hint about the
  realm policy.
- The stand realm `deploy/auth/realm/rt.json` declares no password policy: Keycloak takes any
  password.
- Keycloak puts the realm policy into the context of every login page as `passwordPolicies`, keyed
  by the policy name: `length`, `upperCase`, `lowerCase`, `digits`, `specialChars`, `notUsername`,
  `notEmail` and the rest. Read on the stand from the served page.
- The theme spec takes the page texts from the Keycloak messages and rejects a dictionary of the
  theme.

## What the rules already say

- The page texts follow the page locale, and the kit labels follow it too.
- A refusal of the policy is shown by Keycloak as a page message after the submit.

## Questions and answers

**Which policy does the stand realm get?** The question was not put: the menu guard refused a new
menu. Taken by the recommended option: length from 8, an upper case letter, a lower case letter, a
digit, a special character, not equal to the login and not equal to the address.

## Decisions

- **The list is built from `passwordPolicies` of the context, not from a copy in the theme.** The
  realm policy changes without a theme release. Rejected: a list written in the theme, because it
  parts with the realm on the first edit of the policy.
- **The list stands under the new password field and marks each met requirement as the person
  types.** Rejected: a list shown only after a refusal, because the person learns the rules by
  failing.

## What is left unclear

- The wording of each requirement is read by the owner in the PR.
