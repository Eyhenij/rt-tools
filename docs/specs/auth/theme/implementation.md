# The entry screens of the module — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence.

- **The theme draws its own pages with the second kit, and every other page with the standard Keycloakify layout.** — `projects/auth-keycloak-theme/src/login/kc-pages.ts:themePageOf`
- **A page form is sent to the action address by a plain submit, with the field names of the standard theme.** — `projects/auth-keycloak-theme/src/login/kc-form.ts:holdInvalidSubmit`
- **A form with an empty required field is not sent.** — `projects/auth-keycloak-theme/src/login/kc-form.ts:holdInvalidSubmit`
- **The texts of a page are the Keycloak messages in the page locale, and the kit labels follow it.** — `projects/auth-keycloak-theme/src/login/kc-kit-labels.ts:kitTranslatorFor`
- **A Keycloak message is shown as plain text, its HTML entities turned into characters.** — `projects/auth-keycloak-theme/src/login/kc-i18n.ts:plainMessage`
- **Every field of a form keeps the line for its error, so an error does not move the form.** — `projects/auth-keycloak-theme/src/login/pages/login/rt-kc-login.component.html:reserveHintSpace`
- **The fields and the buttons of the forms are of the large size.** — `projects/auth-keycloak-theme/src/login/pages/login/rt-kc-login.component.html:size`
- **The language is chosen from a drop-down list, and a choice opens the page in that language.** — `projects/auth-keycloak-theme/src/login/shell/rt-kc-root.component.ts:switchLocale`
- **The card of a page has an outline and a shadow.** — `projects/auth-keycloak-theme/src/styles.scss:login__card`
- **A message Keycloak puts on a page is shown above the form in the colour of its kind.** — `projects/auth-keycloak-theme/src/login/message/rt-kc-message.component.ts:SEVERITY`
- **Every provider of the realm gets a button, and Google and Apple get their own icons.** — `projects/auth-keycloak-theme/src/login/pages/login/rt-kc-login.component.ts:PROVIDER_ICONS`
- **The dark theme follows the system until the person switches it on the page.** — `projects/auth-keycloak-theme/src/login/kc-app.config.ts:themeAppConfig`
- **The stand realm uses the theme, and the raising command builds it first.** — `deploy/auth/realm/rt.json:loginTheme`
