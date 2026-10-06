# Grill

## The owner request

> изучи как утроен логин на [приложении А] и [приложении Б] проектах - нужно вынести логин в отдельный модуль который можно подключать в приложения

The whole grill of the epic lies in the archive record of its first task, RT-2529. Here only what
this task adds.

## What the tree already has

- The receiver's access check: one guard, closed by default, an access label on every operation,
  two refusals — «not signed in» and «not allowed» — that do not name the missing right.
- No Connect server in this tree: the receiver serves NestJS controllers.
- `@rt-tools/auth-contract` reads the caller and the rights from token claims.

## Questions and answers

No new questions: the owner's answers in the epic grill cover the server side — rights in Keycloak
as client roles, a client per admin, NestJS + Connect.

## Decisions

- **One token check for both servers.** The NestJS guard and the Connect interceptor call the same
  verification. Rejected: a check per adapter — two checks drift apart.
- **An access declaration on every operation, checked at start.** A missing or a double one stops
  the application before the first request. Rejected: a refusal at the request — a forgotten
  declaration then shows only to the person who called it.
- **The catalog adds missing roles to Keycloak and never removes one.** Removing a role takes it
  away from every person who holds it. Extra roles are named in the log.
- **The token must be issued to the admin's own client.** Otherwise a token from another admin of
  the same realm opens this one.

## What is left unclear

- Nothing blocks the task.
