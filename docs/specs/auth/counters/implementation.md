# The counters of the entry screens — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence.

- **Every page of the theme loads GA4 and Metrika after it is drawn, when their numbers are set.** — `projects/auth-keycloak-theme/src/login/kc-counters.ts:countersOf`, called at `projects/auth-keycloak-theme/src/main.ts:startCounters`. The properties are declared at `projects/auth-keycloak-theme/package.json:environmentVariables`
- **The page view goes to both counters with the page id.** — `projects/auth-keycloak-theme/src/login/kc-counters.ts:startGa`. The hit is sent at `projects/auth-keycloak-theme/src/login/kc-counters.ts:startMetrika`
- **A form that leaves the page sends the event `auth_form_submit` with the page id.** — `projects/auth-keycloak-theme/src/login/kc-counters.ts:startCounters`
- **No value typed into a field reaches a counter.** — `projects/auth-keycloak-theme/src/login/kc-counters.ts:FORM_SUBMIT_EVENT`
- **A typed value lives in a field property and never in the page markup.** — `projects/auth-keycloak-theme/src/login/pages/login/rt-kc-login.component.html:hidden`. The same fields stand at `projects/auth-keycloak-theme/src/login/pages/register/rt-kc-register.component.html:hidden`, `projects/auth-keycloak-theme/src/login/pages/reset-password/rt-kc-reset-password.component.html:hidden` and `projects/auth-keycloak-theme/src/login/pages/update-password/rt-kc-update-password.component.html:hidden`
- **The page address loses the action token and the login hint before a counter starts.** — `projects/auth-keycloak-theme/src/login/kc-counters.ts:dropPrivateParams`
- **The text that shows a person is hidden from Webvisor.** — `projects/auth-keycloak-theme/src/login/kc-counters.ts:hidePrivateText`
