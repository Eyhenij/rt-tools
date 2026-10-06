# The entry screens of the module

**Status:** in force · **Revision:** 2026-10-05 · **Scenario prefix:** `SC-AUTH`
**Depends on:** none
**Laws:** `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the entry module: the Keycloak theme `rt`. It draws the entry screens with the
components of the second kit, so a person entering an admin sees the look of the admin itself.
The package `@rt-tools/auth-keycloak-theme` builds it into a theme JAR for Keycloak.

## Why

The standard Keycloak screens look foreign next to the admins. A person who meets a new look at
the entry is not sure the page belongs to the admin.

## Terminology

| Term               | What it is                                                                   |
| ------------------ | ---------------------------------------------------------------------------- |
| The theme          | The Keycloak login theme `rt`, built by Keycloakify from Angular code        |
| A page             | One Keycloak template of the login theme, for example `login.ftl`            |
| The context        | The data Keycloak puts on a page: addresses, messages, the realm, the locale |
| The action address | The address a page form is sent to                                           |
| A provider         | An external identity provider of the realm, for example Google               |

### What it is called in the interface

| Concept           | On the screen                            |
| ----------------- | ---------------------------------------- |
| The login page    | the Keycloak message `loginAccountTitle` |
| A provider button | the display name of the provider         |

## Rules

- **The theme draws its own pages with the second kit, and every other page with the standard Keycloakify layout.**
  Otherwise a page Keycloak adds in a new version shows empty.
- **A page form is sent to the action address by a plain submit, with the field names of the standard theme.**
  Keycloak reads the posted fields by name, and a renamed field reads as an empty one.
- **A form with an empty required field is not sent.** The field shows its error in place.
- **The texts of a page are the Keycloak messages in the page locale, and the kit labels follow it.**
  Otherwise a page mixes two languages, and the realm mails use other words than the screen.
- **A Keycloak message is shown as plain text, its HTML entities turned into characters.** The
  messages carry entities such as `&laquo;`; markup in a message is not inserted.
- **Every field of a form keeps the line for its error, so an error does not move the form.**
- **The fields and the buttons of the forms are of the large size.**
- **An empty field shows its name as a placeholder.** The name is the Keycloak label of the field.
- **The language is chosen from a drop-down list, and a choice opens the page in that language.**
- **The card of a page has an outline and a shadow.** The kit paints it the colour of the page.
- **A message Keycloak puts on a page is shown above the form in the colour of its kind.**
- **Every provider of the realm gets a button, and Google and Apple get their own icons.** A
  provider without a known icon gets a button with its name only.
- **The dark theme follows the system until the person switches it on the page.**
- **The stand realm uses the theme, and the raising command builds it first.** Without the JAR the
  realm falls back to the standard look.

## What is out of scope

- The account console and the admin console of Keycloak keep their standard themes.
- The providers of the stand realm and their secrets — the end-to-end task of the epic.
- Publishing the package — the end-to-end task of the epic.

## Contract

Not applicable: the theme serves no procedures. Keycloak calls its pages.

### Refusal codes

Not applicable.

## Data

Not applicable: the theme keeps nothing. The chosen colour theme lives in the browser storage of
the second kit.

## Screens and states

| Page                        | What the person does                          |
| --------------------------- | --------------------------------------------- |
| `login.ftl`                 | enters by address and password or a provider  |
| `login-reset-password.ftl`  | asks for a reset letter                       |
| `login-update-password.ftl` | sets a new password, also after an invitation |
| `login-verify-email.ftl`    | is asked to confirm the address               |
| `info.ftl`                  | reads a message and follows its link          |
| `error.ftl`                 | reads an error and goes back to the admin     |
| `logout-confirm.ftl`        | confirms leaving                              |
| `login-page-expired.ftl`    | restarts or continues the entry               |

Each page has a light and a dark state and draws a message when the context holds one.

## Cross-cutting requirements

### Locales

English and Russian, as the realm enables them. The locale switch of the page follows the locale
links of the context.

### SEO

Not applicable: the pages are not indexed.

### Mobile layout

The card takes the full width under 400 pixels and keeps a 20 pixel gutter.

### Several objects

One theme for every admin of the realm. The realm display name heads the card.

## Decisions

- **Form values are copied into hidden named fields.** The kit input passes no name to its native
  field. Rejected: a `name` input in the kit — a kit release for one consumer.
- **The page texts come from the Keycloak messages.** Rejected: a dictionary of the theme — it
  would part with the mails of the realm.

## Open questions

None.

## History of changes

- 2026-10-05 — the theme, task RT-2530.
