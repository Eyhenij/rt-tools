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
- **An empty login field that takes an address shows the example `name@example.com`.** The label
  above already names the field, and a placeholder repeating it adds nothing.
- **A login field that takes only a name has no placeholder.** An example name tells the person
  nothing.
- **A password field asks for the password inside it, and a confirmation field asks to repeat it.**
  The owner asked for it on the mockup: an empty password field reads as a field without a task.
- **The language is chosen from a drop-down list, and a choice opens the page in that language.**
- **The card of a page has an outline and a shadow.** The kit paints it the colour of the page.
- **Behind the card the kit's dot field drifts over a soft radial gradient.** The page around the
  card is no longer an empty plane.
- **The card is glass: a semi-transparent background with a blur of what lies behind it.** The dots
  show through its edge softly and do not cross the text.
- **The language list and the theme switch stand in the first row of the card, on its right edge.**
  They do not hang in the corner of the window over the dots.
- **A link back to the sign-in or to the application is plain text without a chevron.** Keycloak
  starts these two messages with «, and the theme drops it.
- **A link forward to the next step is plain text without a chevron.** Keycloak starts it with »,
  and the theme drops it the same way.
- **A page the theme does not draw starts the standard layout in a root of its own.** The page markup
  holds only the theme root, and without its own root the standard layout leaves the page empty.
- **Under the new password and its confirmation the page lists every requirement of the realm password policy.**
  The list is read from the policy Keycloak puts on the page, so a new policy needs no theme release.
- **A requirement the typed password meets is marked as met while the person types.** The person
  learns the rules before the submit, not from a refusal after it.
- **A message Keycloak puts on a page is shown above the form in the colour of its kind.**
- **Every provider of the realm gets a button, and Google and Apple get their own marks.** A
  provider without a known mark gets a button with its name only.
- **A provider mark is a picture of the theme, not a kit icon.** The Google mark is in four
  colours. Given as a kit icon name, it was drawn as a font ligature, and the theme loads no such
  font.
- **The card head shows the realm logo when the HTML display name of the realm holds one.** Without
  markup there, the head shows the realm name as text. The theme serves several realms, and the
  logo belongs to the realm.
- **The viewport keeps a 20 pixel gap above and below the card.** A card taller than the screen
  does not touch its edges.
- **The registration page asks for the address, the password and its confirmation.** The requirement
  list stands under the confirmation, and the provider buttons and the link back to the sign-in
  follow the form. With the address used as the login, the requirement "unlike the login" is the
  requirement "unlike the address" and is listed once.
- **An error Keycloak puts on a field stands under that field.** The form shows it on arrival, and
  the field drops it once the person changes the value.
- **The registration form checks the address and the match of the two passwords before the submit.**
  The person learns about a typo before the page reloads.
- **The frame of a theme page loads every script Keycloak lists for the page, after the first draw.**
  The standard layout loads them, and the theme pages bypass it. The reCAPTCHA script renders only
  the widgets it finds in the page on load.
- **The registration form draws the reCAPTCHA widget above the submit button when the realm requires a visible one.**
  The widget carries the site key of the realm and posts its answer with the form as
  `g-recaptcha-response`. Without the answer Keycloak refuses the registration. The invisible
  reCAPTCHA is not drawn. The widget stands on the axis of the form, and a form narrower than the
  widget scales it down to fit.
- **The reCAPTCHA widget takes the scheme of the page theme and is drawn anew when the theme switches.**
  A light widget on the dark card reads as a foreign patch.
- **The dark theme follows the system until the person switches it on the page.**
- **The stand realm uses the theme, and the raising command builds it first.** Without the JAR the
  realm falls back to the standard look.
- **Every built file of the theme carries a hash of its content in its name.** Keycloak serves the
  theme files under one path across rollouts, and the browser keeps them for 30 days. Under an
  unchanged name a returning person got the former entry file, it asked for a piece the server no
  longer had, and the page stayed blank.

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
| `register.ftl`              | creates an account by address or a provider   |
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

One theme for every admin of the realm. The realm logo from its HTML display name heads the card,
or the realm display name without one.

## Decisions

- **Form values are copied into hidden named fields.** The kit input passes no name to its native
  field. Rejected: a `name` input in the kit — a kit release for one consumer.
- **The page texts come from the Keycloak messages.** Rejected: a dictionary of the theme — it
  would part with the mails of the realm.
- **The password requirements are the theme's own texts in English and Russian.** Keycloak has only
  refusal texts for the policy, and they read as errors before anything is typed. Rejected: the
  refusal texts with their prefix cut — the Russian set lacks the address requirement.
- **The registration page draws no attribute of the user profile beyond the address.** The realm
  of the consumer requires none. Rejected: a field per profile attribute — no mockup draws it.
- **The theme adds the Russian refusal for a password equal to the address.** Keycloak has the
  English one only. The theme messages reach the server through the Keycloakify build.

## Open questions

None.

## History of changes

- 2026-10-05 — the theme, task RT-2530.
- 2026-10-06 — the password requirements under the two password fields, task RT-2570.
- 2026-10-14 — the registration page, the realm logo and the provider marks, task RT-2837.
- 2026-10-30 — the page scripts and the reCAPTCHA widget on the registration page, task RT-3003.
