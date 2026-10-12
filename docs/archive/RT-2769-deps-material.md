# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already has

- `pnpm outdated -r` on 2026-10-12 lists `@angular/cdk` and `@angular/material` at 22.1.6; the
  last released version of both is 22.2.2.
- Material 22.2.2 asks for CDK 22.2.2 exactly and accepts Angular `^22.0.0 || ^23.0.0`; the tree
  stands on Angular 22.2.2 since RT-2768.
- Both packages carry styling, so the change is judged by the showcase frames of both kits and by
  the admin suite frames, not by the build alone.

## Decisions

- **A frame that diverges is read by eye before any retake:** a retake is made only where the
  diff shows a change of Material's own drawing, and each such frame is named in the PR.
