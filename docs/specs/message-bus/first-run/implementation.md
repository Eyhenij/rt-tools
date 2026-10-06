# The first record — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The four commands of accounts are not in the tree.** — `apps/message-bus/src/main.ts:run` — the launch line hands every command to the tree commands alone. SC-MB-393 asks a tree command for the account verbs and gets the list of the tree ones
- **The intake serves no operation of the first run.** — `apps/message-bus/src/app/app.module.ts:AppModule` — the accounts module serves the people and the roles only, and the entry module answers every sign-in question
- **The admin panel has no screen of the first run.** — `apps/message-bus-admin/src/app/app.routes.ts:appRoutes` — the root branch is closed by the guard of the entry module, and no route stands outside it
