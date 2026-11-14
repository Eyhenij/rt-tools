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

A built JAR is also attached to a GitHub release with the tag `rt-auth-keycloak-theme@<version>`.
The release is made by the workflow `publish-auth-keycloak-theme.yml`, started by hand.

The Google button appears when the realm holds the Google provider switched on. On the stand that
happens when the environment of `deploy/auth/compose.yml` gives `RT_GOOGLE_ENABLED=true`,
`RT_GOOGLE_CLIENT_ID` and `RT_GOOGLE_CLIENT_SECRET`. The keys stay outside the history, in the shell
or in the .env file next to the compose file.

## Counters

Every page of the theme loads GA4 and Yandex Metrika when the environment of the Keycloak
container gives their numbers. The theme reads them as theme properties:

| Variable             | What it holds                   |
| -------------------- | ------------------------------- |
| `GA_MEASUREMENT_ID`  | the GA4 measurement id, `G-…`   |
| `METRIKA_COUNTER_ID` | the Metrika counter number      |

An empty or malformed number loads no tag of that counter. The page view carries the page id
(`login`, `register`, `login-reset-password`…), and a form that leaves the page sends the event
`auth_form_submit` with the same id. No value typed into a field goes into an event. Every field
carries `ym-disable-keys`, so Webvisor records none of its keys, and a link address in the markup
loses the action token and the login hint.

Three settings live outside the theme:

- the numbers go into the environment file of the login node, and the rollout restarts Keycloak:
  without them Keycloak starts with empty numbers, and the pages load no counter;
- Metrika shows the submit in its reports only for a goal of the kind «JavaScript event» with the
  id `auth_form_submit`;
- GA4 tells the pages apart only by `page_id` registered as a custom dimension of the event scope:
  the entry addresses are the same for the sign-in, the registration and the reset.

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
- **The theme follows the system** until a person switches it. The choice lives in the browser
  storage of the kit.
- **Provider buttons** come from the realm list. Google and Apple get their own marks.
- **The language** is chosen from a drop-down list when the realm has two or more. Every language is
  named in itself with a capital letter, and the links between the entry pages keep the one chosen
  in the list.
- **The switches** of the language and the theme stand in the top right corner of the window on a
  glass pad of their own from 1080 pixels wide, and in the first row of the card below that.
- **A message page** at the end of a flow, such as an address confirmed from a letter, leads back
  to the application when its client has an address.
- **The forms** use the large fields and buttons of the kit, and every field keeps the line for its
  error, so an error does not move the form.

## Requirements

Keycloak 26. The theme carries no Java extensions.

## Connecting it to an application

The order of the whole connection is in the guide of the module.
It covers Keycloak, the server, the admin, the entry screens and the move of people:
[docs/auth-integration.md](https://github.com/Eyhenij/rt-tools/blob/main/docs/auth-integration.md).
