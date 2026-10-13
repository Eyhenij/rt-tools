# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already has

- The root manifest held NestJS 11.2.3 (`@nestjs/common`, `core`, `platform-express`, `testing`)
  and `@nestjs/schematics` 11.1.0.
- The users are the message bus receiver and its API library, the auth server and CMS server
  packages and the auth example API. The auth server package already declared
  `^11.0.0 || ^12.0.0` as its peer.
- `@nx/nest` 23.3.0 sat in the root manifest, and no project or config named it. Its peer range
  ends below NestJS 12.

## Decisions

- **12.1.2 and 12.0.6:** on 2026-10-13 the later releases 12.1.3 and 12.0.7 were younger than a
  day, and nothing needed them before the release-age wait ends.
- **`@nx/nest` left the manifest:** nothing used it, and it would hold a peer warning against
  NestJS 12.
- **The auth server and CMS server specs run Jest in ES module mode:** NestJS 12 ships ES modules
  only and reads `import.meta`, so the CommonJS run could not load it even through a transform.
  The test target starts Jest with `--experimental-vm-modules`, and `@jest/globals` gives the
  `jest` object. Rejected: Vitest — the packages under `projects/` run Jest by the tree's signal.
