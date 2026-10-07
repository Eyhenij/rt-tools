# Grill

Task RT-2582 · the PR into the epic branch RT-2575

## The owner request

> я вмержил https://github.com/Eyhenij/rt-tools/pull/2559, подтягивай свежий main и чисти вмерженные ветки как локально так и в ремоуте, выпускай итоговые пакеты auth и затем мигрируй логин из message bus на новый auth

## What the tree already has

- The cargo commands sign in to the bus by the name and password of the service account
  `cargo-triage`. The owner on 7 October 2026: «cargo-triage - это аккаунт для rt-tools для разбора
  происшествий».
- Since RT-2576 the bus has no sign-in by a password: it accepts only Keycloak tokens.
- The transfer of RT-2579 leaves `cargo-triage` behind on purpose: it is not a person.
- `@rt-tools/auth-server` 0.1.0 on npm lacks what the bus already uses: the options read from the
  environment, the keys address of the realm and the options given to the application. The epic
  plan names its new edition together with this task.

## What the rules already say

- The epic plan: the cargo commands get a service client of Keycloak, and the auth server accepts
  its tokens with the roles of the bus client.
- The server spec of the entry module: a token is accepted only from the realm, within its term and
  for the client of this admin. The verifier compares `azp` with that one client, and the rights are
  the roles of that client in `resource_access`.
- The old role of `cargo-triage` in the bus gave reading and closing of the postmortems and the
  proposals and the reading of the summaries.

## Questions and answers

None asked: the epic plan answers the question of the way, and the old role answers the question
of the rights.

## Decisions

- **The server accepts the tokens of the service clients it names.** A token issued to such a
  client passes the same checks of the realm and the term. Rejected: the cargo commands signing in
  as the bus client itself, because that client is public and has no secret.
- **The rights of a service client are the roles of the bus client on its service account.** The
  server reads one place for both kinds of callers. Rejected: roles of its own client, because the
  catalog and the guards know one client.
- **The service client gets exactly the rights of the old role of `cargo-triage`.** Rejected: every
  right, because the commands never manage invites or read usage.
- **The secret of the service client comes from the environment of the machine that runs the
  commands.** It never lies in the tree; the stand keeps a test value in its realm file.
- **The auth server is published anew with this task.** The bus needs the options from the
  environment and the service clients from the same edition.

## What is left unclear

- The secret of the production client is created in the Keycloak of production, task RT-2581.

## Decisions along the way

- **The sign-in code lives in one module the three cargo commands import.** Reading, closing and
  picking the fixed records signed in by copies of one cookie sign-in; one copy left is one place
  to change next time.
- **The production client is not created by this task.** The realm of production gets it with
  task RT-2581, together with `AUTH_SERVICE_CLIENTS` in the production environment.
