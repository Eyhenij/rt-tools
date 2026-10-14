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
- **An empty login field that takes an address shows the example `name@example.com`.** — `projects/auth-keycloak-theme/src/login/kc-form.ts:loginPlaceholder`
- **A login field that takes only a name has no placeholder.** — `projects/auth-keycloak-theme/src/login/kc-form.ts:loginPlaceholder`
- **A password field asks for the password inside it, and a confirmation field asks to repeat it.** — `projects/auth-keycloak-theme/src/login/kc-i18n.ts:rtPasswordPlaceholder`. The confirmation reads `projects/auth-keycloak-theme/src/login/kc-i18n.ts:rtPasswordConfirmPlaceholder`
- **The language is chosen from a drop-down list, and a choice opens the page in that language.** — `projects/auth-keycloak-theme/src/login/shell/rt-kc-root.component.ts:switchLocale`
- **The card of a page has an outline and a shadow.** — `projects/auth-keycloak-theme/src/styles.scss:login__card`
- **Behind the card the kit's dot field drifts over a soft radial gradient.** — `projects/auth-keycloak-theme/src/login/shell/rt-kc-root.component.html:rt-dot-field`. The gradient stands at `projects/auth-keycloak-theme/src/styles.scss:radial-gradient`
- **The card is glass: a semi-transparent background with a blur of what lies behind it.** — `projects/auth-keycloak-theme/src/styles.scss:backdrop-filter`
- **The language list and the theme switch stand in the first row of the card, on its right edge.** — `projects/auth-keycloak-theme/src/login/shell/rt-kc-root.component.html:kc-chrome`. The pinning of the kit is cancelled at `projects/auth-keycloak-theme/src/styles.scss:login__chrome`
- **A link back to the sign-in or to the application is plain text without a chevron.** — `projects/auth-keycloak-theme/src/login/kc-i18n.ts:backLinkText`
- **A link forward to the next step is plain text without a chevron.** — `projects/auth-keycloak-theme/src/login/kc-i18n.ts:backLinkText`. The link stands at `projects/auth-keycloak-theme/src/login/pages/info/rt-kc-info.component.ts:proceedWithAction`
- **A page the theme does not draw starts the standard layout in a root of its own.** — `projects/auth-keycloak-theme/src/login/kc-standard-root.ts:placeStandardRoot`
- **Under the new password and its confirmation the page lists every requirement of the realm password policy.** — `projects/auth-keycloak-theme/src/login/kc-password-rules.ts:passwordRulesOf`. The list stands at `projects/auth-keycloak-theme/src/login/pages/update-password/rt-kc-update-password.component.html:kc-password-rules`
- **A requirement the typed password meets is marked as met while the person types.** — `projects/auth-keycloak-theme/src/login/kc-password-rules.ts:passwordRuleMet`
- **A message Keycloak puts on a page is shown above the form in the colour of its kind.** — `projects/auth-keycloak-theme/src/login/message/rt-kc-message.component.ts:SEVERITY`
- **Every provider of the realm gets a button, and Google and Apple get their own marks.** — `projects/auth-keycloak-theme/src/login/kc-providers.ts:providerButtonsOf`
- **A provider mark is a picture of the theme, not a kit icon.** — `projects/auth-keycloak-theme/src/styles.scss:login__provider--google`. The pictures lie at `projects/auth-keycloak-theme/src/login/brand/google.svg`
- **The card head shows the realm logo when the HTML display name of the realm holds one.** — `projects/auth-keycloak-theme/src/login/kc-realm-logo.ts:realmLogoOf`
- **The viewport keeps a 20 pixel gap above and below the card.** — `projects/auth-keycloak-theme/src/styles.scss:padding-block`
- **The registration page asks for the address, the password and its confirmation.** — `projects/auth-keycloak-theme/src/login/pages/register/rt-kc-register.component.ts:RtKcRegisterComponent`. The list reads `projects/auth-keycloak-theme/src/login/kc-password-rules.ts:registrationRulesOf`
- **An error Keycloak puts on a field stands under that field.** — `projects/auth-keycloak-theme/src/login/kc-form.ts:refusedValue`
- **The registration form checks the address and the match of the two passwords before the submit.** — `projects/auth-keycloak-theme/src/login/kc-form.ts:sameValueAs`
- **The dark theme follows the system until the person switches it on the page.** — `projects/auth-keycloak-theme/src/login/kc-app.config.ts:themeAppConfig`
- **The stand realm uses the theme, and the raising command builds it first.** — `deploy/auth/realm/rt.json:loginTheme`
