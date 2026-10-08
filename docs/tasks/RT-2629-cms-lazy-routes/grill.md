# Grill

## The owner request

> Publish now

The owner chose this answer to the question whether to fix the two defects of the CMS packages
0.1.0 and publish 0.1.1 at once. The task card offers two fixes for the admin screens: advise a
lazy mount in the README, or split the screens into entries of their own.

## What the tree already has

- `projects/cms-angular/admin/src/lib/screen/cms.routes.ts` — every screen is declared by
  `loadComponent` with a dynamic import of a file of the same entry; the packager inlines them.
- `projects/cms-angular/README.md` — advises `children: cmsRoutes`, the mount that puts the whole
  entry into the initial bundle of the application.
- The admin entry exports every screen component, so a split moves them out of its public API.

## Questions and answers

| Question                                | Closed by                                                         |
| --------------------------------------- | ----------------------------------------------------------------- |
| Does the work change behaviour          | no: the package code is the same, the README names the lazy mount |
| What shows the task is closed           | the README advises `loadChildren`, 0.1.1 is in the registry       |
| Is the owner's word on publishing given | yes: «Publish now»                                                |

## Decisions

- **0.1.1 carries the README fix, not the split.** A split moves the screen components out of the
  admin entry and changes its public API — that is 0.2.0, not a patch. The lazy mount puts the
  whole entry into a chunk of its own, and the application's initial bundle stops growing.
  Rejected for 0.1.1: entries per screen — they stay a separate task with the owner.
