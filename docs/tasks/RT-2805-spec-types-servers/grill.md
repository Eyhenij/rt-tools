# Grill

## The owner request

> обнови все пакеты до самых последних

The task came out of that order: the raise of NestJS 12 (RT-2773) showed that the specs of three
packages carry type errors nothing reports.

## What the tree already has

- `pnpm exec tsc -p <package>/tsconfig.spec.json --noEmit` finds 3 errors in the auth server, 35
  in the CMS server and 1 in the rules package. No target runs it: Jest compiles each spec file
  by itself, one file at a time, and the project targets typecheck only the library sources.
- 33 of the 35 errors in the CMS server have one cause: the helper `refusalOf` takes a promise,
  while the handlers answer with a value or with a promise of one.
- One more error: a spec spreads the media double into an object literal and names the field
  `used`, which the port `IMediaSources` does not have.
- The auth server errors: two types used in decorated signatures are imported as values (already
  fixed in RT-2773 for one file), a controller with a constructor is passed where `new () => object`
  is expected, and a value is narrowed to `never` in the access spec.
- The rules package cannot find `@jest/globals`; the root manifest now holds it.

## Decisions

- **The specs are fixed to the types, not the types to the specs:** the sources keep their shapes.
- **A target `typecheck-spec` is not added in this task:** it needs its own decision on the push
  gate set. The task only brings the three packages to zero errors and names the command.
