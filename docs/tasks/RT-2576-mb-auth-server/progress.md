# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — The bus server checks the Keycloak token
- **Done:** the server checks the Keycloak token; the admin panel signs in through Keycloak; the
  operator chat stream reads the token; the end-to-end stand seeds its people in the stand realm
- **Next step:** the push gate, then the folder is taken apart and the PR opens into the epic branch
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The specs of access rights, sign-in and first run are rewritten for the token
- [x] 1.2 The rights catalog is declared with the contract and the server module is connected
- [x] 1.3 The bus access marks declare the module access, and the bus guard keeps the tree branch
- [x] 1.4 The operations of sign-in, sign-out, session and first run are removed
- [x] 1.5 The signed-in person of a request is read from the token
- [x] 1.6 The tests are rewritten

## Decisions along the way

- **RT-2577 is merged into this task.** The server and the admin panel change one contract of the
  entry: the session cookie goes on both sides at once. Merged one by one, the epic branch would
  hold an admin panel that cannot sign in. The admin part adds steps after 1.6: the admin panel
  signs in with `@rt-tools/auth-angular`, the sign-in and first-run screens go, the operator chat
  stream reads the token. The plan is not edited, so these parts stay outside the step list. The
  push gate runs the end-to-end suite, so the branch is pushed only with them done. Affected stage
  of the plan: 1.

- **The cargo commands are a task of their own, RT-2582.** `tools/cargo-pull.mjs` and
  `tools/cargo-close.mjs` sign in with the pair of a service account and carry the session cookie.
  The module accepts tokens of the admin client only, so the commands need a service client of
  Keycloak. Against production they keep working until the rollout. Affected stage of the plan: 1.

- **The options of the entry module are read from the environment by the package.** The bus and
  the example server held two copies of the same reading, and the duplicate check named them.
  `authOptionsFromEnv` went into `@rt-tools/auth-server`. The published 0.1.0 lacks it, so the
  package is published again before the rollout, together with the edit of RT-2582. Affected
  stage of the plan: 1.

- **The stand realm declares the bus client with its rights as client roles.** No role presets:
  the people and the roles go with RT-2578 and RT-2579. Affected stage of the plan: 1.

- **The end-to-end stand moves to Keycloak in this task.** Without it the stand seeds the account
  by the first-run operation that left the server, and the suite of the epic branch stays red.
  RT-2580 keeps the scenarios of the suite that need Keycloak users. Affected stage of the plan: 1.

- **The records of the people section open no sign-in.** The people and roles screens stay until
  RT-2578, and their scenarios lost the parts that signed in with a record: `SC-MB-364`,
  `SC-MB-365` and `SC-MB-378`. The stand gives each row the Keycloak key and the Keycloak name of
  its person, so the screen and the receiver still find the own row. Affected stage of the plan: 1.

- **The entry module gives its options to the application.** The settings operation of the admin
  panel read them, and the module did not export them: the receiver did not start at all. The
  spec of the module now starts an application operation that reads them. Affected stage of the
  plan: 1.

- **The sign-in domain of the admin panel is gone, and its rest lives in the shell domain.** With
  the screens drawn by Keycloak the domain had no screen layer, and the layout check refused it.
  The sign-in state and the section guards went to the shell's data layer, the person model and
  the addresses to its utilities. The guards stay out of the shell's screen layer: it loads on
  demand. Affected stage of the plan: 1.

## Sessions

### 2026-10-06

- The task folder is written.
- The server part: tests, types and lint are green over 44 projects. The server started against
  the stand Keycloak, sent 12 rights, answered 401 without a token and 200 to the liveness probe.
- The end-to-end stand moved to Keycloak: the admin suite passed 167 of 167 twice, the example suite
  10 of 10. Twenty-one frames were taken anew: the header names the stand account by its Keycloak name.
