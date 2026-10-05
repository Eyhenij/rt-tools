# Grill

## The owner request

> изучи как утроен логин на [приложении А] и [приложении Б] проектах - нужно вынести логин в отдельный модуль который можно подключать в приложения

The whole grill of the epic lies in the archive record of its first task, RT-2529. Here only what
this task adds.

## What the tree already has

- The epic plan `docs/plans/auth-module.md` names four packages and the decisions of the owner:
  rights are client roles `resource:action` in Keycloak, a client per admin.
- `@rt-tools/utils` is the sample of a package without a framework: ESM and CJS outputs, a
  manifest assembled by a script, Jest on Node.

## Questions and answers

**Как назвать пакеты модуля входа?**
auth-* (Recommended) — `@rt-tools/auth-contract`, `@rt-tools/auth-angular`, `@rt-tools/auth-server`,
`@rt-tools/auth-keycloak-theme`.

## Decisions

- **The contract has no framework and ships ESM and CJS.** The Angular client imports ESM, a NestJS
  server is usually built to CJS. Rejected: ESM only — a CJS server could not require it.
- **A right is a string `resource:action` checked by its shape.** Keycloak keeps client roles as
  strings, and a role of another shape is not a right of the module. Rejected: an object — the
  token carries strings anyway, and every reader would convert.
- **The caller is built from the claims of a token by one pure function.** The client and the
  server read rights from the same claims the same way. Rejected: each side its own reading — two
  readings drift apart silently.

## What is left unclear

- Nothing blocks the task.
