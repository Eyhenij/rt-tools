# Grill

## The owner request

> изучи https://github.com/Eyhenij/rt-tools/security и исправь все проблемы

## What the tree already has

- The Security tab on 2026-10-28: 33 open Dependabot alerts; code scanning has no analysis; secret
  scanning has no alerts.
- 31 alerts are transitive packages with a fixed version: undici 7 and 8, vite 8.3.0, launch-editor,
  follow-redirects, fast-uri, multer, body-parser 2, qs, serialize-javascript.
- 2 alerts have no fixed version: quill 2.0.3 (HTML export XSS, two copies of one advisory) and
  deepmerge 4.3.1 (prototype poisoning in `mergeObject()`).
- `overrides` in `pnpm-workspace.yaml` already hold the security pins of the transitive graph;
  the sample is task RT-2823, commit `f57e9719d`.
- Who holds the old versions: undici 8 — jsdom 30.1.2; undici 7 — nx 23.3.0; vite 8.3.0 —
  @angular/build 22.2.2 (exact pin; 22.2.5 with vite 8.3.5 was published today and is younger
  than the waiting term); launch-editor — webpack-dev-server 6.0.0; follow-redirects — axios and
  http-proxy; fast-uri — ajv; multer — @nestjs/platform-express; body-parser 2 — express 5; qs —
  express, body-parser, @cypress/request; serialize-javascript — copy-webpack-plugin and
  css-minimizer-webpack-plugin; deepmerge — jest-config and fork-ts-checker-webpack-plugin.
- Every fixed version was published 2026-10-01 … 2026-10-22, older than the waiting term.
- quill: the tree never calls the HTML export (`getSemanticHTML`); the rich editor keeps a Delta,
  and `rt-delta-view` builds nodes by hand without `innerHTML`.

## What the rules already say

- Rule `dependencies`, pattern `dependencies-upgrade`: a transitive fix goes through `overrides`;
  `pnpm install` does not move a package held by an `overrides` line, so the line itself is raised.
- A dependency update has a task and a branch of its own.

## Questions and answers

Question closed by assumption: behaviour does not change — patch and minor versions of the build
and server graph only.

Question closed by assumption: no law or rule edit.

Question closed by assumption: one task — one edit of `overrides` and one lockfile.

Question closed by assumption: not part of the task — quill and deepmerge, which have no fixed
version; their alerts are left to the owner (dismiss with a reason or keep open).

Question closed by assumption: closed when the Dependabot alerts with a fixed version close after
the merge, and `pnpm audit` names none of the packages above.

Question closed by assumption: sample — RT-2823.

## Decisions

- **vite is pinned through `overrides`, not by raising @angular/build** — 22.2.5 is younger than
  the waiting term. Rejected: an exception in `minimumReleaseAgeExclude` for a whole framework
  release.

## What is left unclear

- Whether to dismiss the quill and deepmerge alerts on GitHub — a change of state outside the tree,
  asked of the owner at the end.
