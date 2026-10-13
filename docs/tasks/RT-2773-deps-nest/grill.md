# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already has

- The root manifest holds NestJS 11.2.3 (`@nestjs/common`, `core`, `platform-express`,
  `testing`) and `@nestjs/schematics` 11.1.0. The last published versions are 12.1.3 and 12.0.7.
- The users are the message bus receiver and its API library, the auth server package and the
  auth example API. The auth server package already declares `^11.0.0 || ^12.0.0` as its peer.
- `@nx/nest` 23.3.0 sits in the root manifest, but no project and no config names it: the
  plugin is not used. Its peer range ends below NestJS 12.
- NestJS 12 needs Node 20 or later; the tree already runs on a newer one.

## Decisions

- **12.1.3 and 12.0.7, the last published:** both are older than the release-age wait of one day.
- **`@nx/nest` leaves the manifest:** nothing uses it, and it would hold a peer warning against
  NestJS 12. Rejected: keeping it and silencing the warning — the package does no work here.
