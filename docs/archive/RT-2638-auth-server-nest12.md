# Grill

## The owner request

> делай свою часть работу

Said after the guide of moving an application's sign-in onto Keycloak was written. That
application runs NestJS 12.1.2, and `@rt-tools/auth-server` declares `@nestjs/common` and
`@nestjs/core` `^11` as peers.

## What the tree already has

- `projects/auth-server/package.json` — version 0.2.2 on the epic branch `RT-2591-cms-packages`
  (the ESM import fixes of 0.2.1 and 0.2.2 live only there); main still carries 0.2.0.
- The package takes from NestJS: decorators and exceptions of `@nestjs/common`, `APP_GUARD` and the
  discovery service of `@nestjs/core`, and two deep imports — `@nestjs/common/constants.js` and
  `@nestjs/core/injector/instance-wrapper.js`.
- The tree itself runs NestJS 11.2.3.

## Questions and answers

No question: the owner ordered the work, and the gap is the peer range of one package.

## Decisions

- **The task branch takes main and the epic branch together** — the epic branch lags main, and the
  guard refuses a base without the tip of main; the epic is led by another working copy. The PR goes
  into the epic branch and brings main into it as well. Rejected: cherry-picking the two ESM fixes
  onto main — the same lines would then be edited twice, and the epic would conflict on merge.
- **NestJS 12 is checked by a live run of the built package in a scratch install** — the tree runs 11,
  and its own specs say nothing about 12. Rejected: widening the range on trust.
