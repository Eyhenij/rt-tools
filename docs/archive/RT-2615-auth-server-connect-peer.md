# Grill

## The owner request

> Сделать обязательной зависимостью

The answer to the question: the published `@rt-tools/auth-server` loads `@connectrpc/connect`
on start but declares it optional — what to do with the package.

## What the tree already has

- `projects/auth-server/package.json` — `@connectrpc/connect` is a peer with
  `peerDependenciesMeta.optional: true`; npm 0.1.0 carries the same.
- `projects/auth-server/src/index.ts` exports `connect-access`, which imports values
  (`ConnectError`, `createContextKey`, `Code`) from `@connectrpc/connect`.
- `deploy/message-bus.Dockerfile` adds the package to the bus image manifest by hand (RT-2612),
  because the build skips an optional peer.
- The specs under `docs/specs/auth/` do not mention the peer list.
- The version is read by the publish workflow from the package manifest; the package has no
  changelog.

## Questions and answers

**What to do with the package itself?**
Сделать обязательной зависимостью

## Decisions

- **Required peer, version 0.2.0** — the package requirements grow, so the minor part moves.
  Rejected: a separate entry point for Connect — the owner chose the required peer.
- **The Dockerfile workaround goes if the build then writes the package itself** — one place for
  the version. Rejected: keeping both — two ways to the same line.

## Decisions along the way

- **The Dockerfile workaround stays** — the bus build does not write peers of tree packages into the image manifest even when required: the generated manifest has no Connect line after the edit. The comment next to it now says why. Affected stage of the plan: 1.
- **Publishing 0.2.0 is permitted after the merge** — the owner: «публикацию 0.2.0 разрешаю после слияния». After the chain reaches main, the publish workflow of auth-server is started by hand. Affected stage of the plan: 2.
- **The branch stands on main, not on RT-2612** — the owner closed RT-2612 as a duplicate of #2613: «Отдать образ #2613». The branch carries only the manifest and the folder; the image workaround and its comment live in #2613, whose line is still true after the edit. Affected stage of the plan: 1, 2.
