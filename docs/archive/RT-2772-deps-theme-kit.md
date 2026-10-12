# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already has

- The sign-in theme and the CMS front take the second kit from the registry as `^0.17.0`, and the
  lock holds 0.17.0. The last published version is 0.23.3.
- Six minor versions before 1.0 lie between them; each may change the kit's surface, so the build
  and the specs of both packages answer for it.
- Neither package uses `rt-toolbar`, so the field width defect of 0.23.3 (fixed in the epic by
  RT-2789, not published yet) does not reach them.
- The sign-in theme has no frames of its own. Its look is seen on the stand `pnpm run serve:auth`,
  which builds the JAR and mounts it into Keycloak.

## Decisions

- **0.23.3, the last published:** the kit is this tree's own package, its versions are excluded
  from the release-age wait.
- **The sign-in page is compared by frames before and after:** the kit carries the theme's look,
  and nothing else in the tree shows it.
