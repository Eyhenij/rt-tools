# Grill

Task RT-2576 · the PR into the epic branch RT-2575 · RT-2577 is merged into it

## The owner request

> я вмержил https://github.com/Eyhenij/rt-tools/pull/2559, подтягивай свежий main и чисти вмерженные ветки как локально так и в ремоуте, выпускай итоговые пакеты auth и затем мигрируй логин из message bus на новый auth

## What the tree already has

- The entry module is merged into main and published: `@rt-tools/auth-contract`,
  `@rt-tools/auth-server`, `@rt-tools/auth-angular` and `@rt-tools/auth-import` at 0.1.0 on npm,
  the Keycloak theme as the release `rt-auth-keycloak-theme@0.1.0`.
- The guide for a consumer application is `docs/auth-integration.md`.
- Only the message bus admin signs people in. Agent trees use a tree token header, the chat widget
  a public site key, the embedded talks a signature from the consumer server. None of these touch
  the account and session tables.
- The admin keeps an httpOnly session cookie with an opaque token; the server checks it on every
  request and reads the rights from the database: role rights plus per-person grants and
  revocations. The rights already have the shape `resource:action`.
- Passwords are scrypt in a format of the bus itself. The import moves argon2 and pbkdf2 with the
  password; scrypt goes without it, and the person sets a new one.
- An account has a name and no address. The import takes the address as the login.
- The first account is created by the setup screen while there are no accounts. There is no
  sign-up and no password reset by mail.
- The operator chat opens an event stream that rides on the cookie and cannot send a header.
- There is no Keycloak in production. The production host has 961 MB of memory.
- Specs: `docs/specs/message-bus/` subdomains `admin-auth`, `access-rights`, `first-run`,
  `people-list`, `people-editing`, `roles-page`.

## What the rules already say

- `docs/specs/auth/import/spec.md` rejects a Keycloak extension for scrypt: it would be built anew
  for every Keycloak version. A person with a scrypt hash moves without the password and sets a new
  one at the first entry.
- `docs/specs/auth/spec.md`: one Keycloak, a client per admin, the rights of an admin are its client
  roles. The roles and the per-person rights of the bus move to Keycloak.
- `docs/specs/auth/import/spec.md`: a person is created with the username and the address equal to
  the address of the file. The people of the bus therefore need addresses before the import.
- `docs/specs/auth/spec.md` puts Keycloak in the production environment out of the module scope:
  where it lives is not decided anywhere.

## Questions and answers

**Where does the production Keycloak live?** The question did not leave: the menu guard refused it
three times. Taken by the recommended option: a separate host of its own. The owner creates the
host; the work prepares its compose and the rollout, and the rollout waits for the host.

## Decisions

- **The scrypt passwords move without the password.** By the import spec; a person sets a new
  password at the first entry.
- **The rights become client roles of the bus client in Keycloak.** By the module spec. The people
  and roles screens of the bus admin give way to the Keycloak console.
- **The login is the address.** By the import spec. The owner gives the addresses of the people
  before the import.
- **Machine entries stay as they are.** Tree tokens, the widget site key and the embedded talks
  signature touch neither accounts nor sessions.

## What is left unclear

- The questions to the owner follow the exploration.

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
