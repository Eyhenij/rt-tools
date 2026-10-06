# The first record — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The four commands of accounts are not in the tree.** — `apps/message-bus/src/main.ts:run` — the launch line hands every command to the tree commands alone. SC-MB-393 asks a tree command for the account verbs and gets the list of the tree ones
- **The intake serves no operation of the first run.** — `apps/message-bus/src/app/app.module.ts:AppModule` — the accounts module serves the people and the roles only, and the entry module answers every sign-in question
- **The sign-in screen asks whether the first record is still to be created, and sends to the first-run screen while it is.** — `libs/message-bus-admin/auth/feature/sign-in/src/lib/admin-sign-in.component.ts:AdminSignInComponent` — the constructor asks `AuthStore.setupState` and navigates to `SETUP_PATH`. A failed answer is swallowed, and the sign-in stays a sign-in
- **The first-run screen sends to the sign-in when the first record is already created.** — `libs/message-bus-admin/auth/feature/setup/src/lib/admin-setup.component.ts:#opened` — a closed answer navigates to `SIGN_IN_PATH`, an open one draws the form
- **The first-run screen asks the name and the password once and says the person will sign in with them.** — `libs/message-bus-admin/auth/feature/setup/src/lib/admin-setup.component.ts:#setUp` — the fault text by `spokenFaultText` above the fields — by the code of the refusal, out of the dictionary, the input untouched on a refusal; the hint is the dictionary word `setupHint` in the template
- **After the creation the person lands in the admin panel signed in.** — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts:setUp` — the session goes into the store and `signed-in` is dispatched. The screen navigates to `HOME_PATH`
- **The first-run screen is not a section: no item in the top row, no right over it.** — `libs/message-bus-admin/auth/shell/src/lib/auth.routes.ts:authRoutes` — the route `SETUP_PATH` stands next to the sign-in, outside the guarded shell. The menu declaration does not know it
- **The end-to-end stand seeds the account by the first-run operation and the people by the operations of the people section.** — `apps/message-bus-admin-e2e/stand/seed-account.mjs:seedAccount` — `POST /api/setup` after the owner role. `seedPeople` goes by `POST /api/accounts` under the cookie
- **The texts naming the commands name the screen instead.** — `tools/cargo-pull.mjs:REFUSED` — the refusal names the people section. The surface table and the decisions of `docs/specs/message-bus/spec.md` and `docs/specs/message-bus/admin-auth/spec.md` name the screens
