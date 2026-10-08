# Grill

Task RT-2627 · the request — the PR into the epic branch RT-2591

## The owner request

> Publish now

The owner chose this answer to the question whether to fix the two defects of the CMS packages
0.1.0 and publish 0.1.1 at once, or after the consumer finishes its epic. The task card names what
to do: `.js` in the relative imports of `cms-server` and `auth-server`, a check that keeps the
error from coming back, and the 0.1.1 release of both packages.

## What the tree already has

- `projects/cms-contract`, `projects/auth-contract` — relative imports already end with `.js`, and
  their module build loads under Node.
- `projects/cms-server`, `projects/auth-server` — 101 relative imports without an extension; the
  module build is compiled with `moduleResolution: bundler` and keeps the paths as written.
- `.github/workflows/publish-cms-server.yml`, `publish-auth-server.yml` — build and publish without
  loading the entry.

## Questions and answers

| Question                                | Closed by                                                                                             |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Does the work change behaviour          | the module build becomes loadable; the API of the packages is unchanged                               |
| What shows the task is closed           | the module build of both packages has no relative path without an extension; 0.1.1 is in the registry |
| Is the owner's word on publishing given | yes: «Publish now»                                                                                    |

## Decisions

- **The regression check reads the sources, not the built entry.** Loading the built entry inside
  the workspace resolves the sibling package to its TypeScript sources through the workspace link,
  and the import fails for a reason that is not the defect. Rejected: a load step in the publish
  workflow — it would refuse every publish for that reason.

## Decisions along the way

- **`auth-server` leaves as 0.2.1, not 0.1.1, and `cms-server` 0.1.1 depends on `^0.2.1`.** The
  registry already has `auth-server` 0.2.0: it differs from 0.1.0 only by the required peer
  `@connectrpc/connect`, which `cms-server` declares too. A 0.1.1 would branch off an old line, and
  the consumer would stay on the version without that peer. Order: `auth-server` 0.2.1 is published
  first, then `cms-server` takes it in the lockfile and leaves as 0.1.1. Affected stage of the plan: 2.

- **`auth-server` leaves once more, as 0.2.2.** A clean install of 0.2.1 loaded the relative paths
  but stopped on the deep path `@nestjs/common/constants`: that package has no export map, and Node
  needs the file name there too. The test now holds deep paths into packages without an export
  map, and `cms-server` 0.1.1 takes 0.2.2 by its `^0.2.1` range. Affected stage of the plan: 2.
