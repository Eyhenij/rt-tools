# Grill

## The owner request

> убирай шеврон и белый экран, после логина тоже белый экран

## What the tree already has

- `projects/auth-keycloak-theme/src/main.ts:startStandard` bootstraps the Keycloakify
  `TemplateComponent` for a page the theme does not draw; its selector is `kc-root`.
- `projects/auth-keycloak-theme/src/index.html` holds only `<rt-kc-root>`: the standard path
  fails with NG05104 and leaves the page empty. Reproduced on the local stand with a person without
  names, sent by Keycloak to `login-update-profile.ftl`.
- `projects/auth-keycloak-theme/src/login/kc-i18n.ts:backLinkText` drops a leading «, ‹ or <;
  the proceed link of `info.ftl` passes «» Click here to proceed» as it is.

## Questions and answers

No question: the owner named both misses, and the cause of each is visible in the code.

## Decisions

- **The standard path puts `kc-root` in place of `rt-kc-root` before it starts** — the page then
  has the root the template looks for. Rejected: both roots in `index.html` — the theme page would
  then start next to an empty standard root.
- **The chevron is dropped on both sides of a link text** — Keycloak puts « before a link back and »
  before a link forward. Rejected: a separate function for the proceed link — the same rule twice.
