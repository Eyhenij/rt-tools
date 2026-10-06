# @rt-tools/auth-keycloak-theme

The Keycloak login theme `rt` of the entry module. It draws the entry screens with the components
of `@rt-tools/ui-kit-v2`, so a person entering an admin sees the look of the admin itself.

The package builds a theme JAR. Keycloak takes a theme only as a file in its providers directory.

## Build

```bash
pnpm run build:auth-keycloak-theme
```

The command builds the Angular application into `dist/auth-keycloak-theme/app` and packs it with
Keycloakify into `dist/auth-keycloak-theme/rt-auth-keycloak-theme.jar`. Packing needs Maven and a
JDK on the machine.

## Use in Keycloak

1. Put the JAR into `/opt/keycloak/providers/` of the Keycloak container.
2. Name the theme in the realm: `"loginTheme": "rt"`.

The stand of this tree does both: `pnpm run serve:auth` builds the JAR first and mounts it.

## What the theme draws

| Page                        | What a person does there                      |
| --------------------------- | --------------------------------------------- |
| `login.ftl`                 | enters by address and password or a provider  |
| `login-reset-password.ftl`  | asks for a reset letter                       |
| `login-update-password.ftl` | sets a new password, also after an invitation |
| `login-verify-email.ftl`    | is asked to confirm the address               |
| `info.ftl`                  | reads a message and follows its link          |
| `error.ftl`                 | reads an error and goes back to the admin     |
| `logout-confirm.ftl`        | confirms leaving                              |
| `login-page-expired.ftl`    | restarts or continues the entry               |

Every other Keycloak page keeps the standard Keycloakify layout.

- **The texts are the Keycloak messages** in the locale of the page. The theme adds no words of its
  own, so the screens say what the realm mails say. The kit labels follow the same locale.
- **The forms post the fields of the standard theme** — `username`, `password`, `password-new` and
  the rest. The kit inputs hold the values, and named hidden fields carry them in a plain submit.
- **The theme follows the system** until a person switches it above the card. The choice lives in
  the browser storage of the kit.
- **Provider buttons** come from the realm list. Google and Apple get their own marks.

## Requirements

Keycloak 26. The theme carries no Java extensions.
