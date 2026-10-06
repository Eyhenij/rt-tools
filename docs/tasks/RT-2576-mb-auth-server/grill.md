# Grill

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
