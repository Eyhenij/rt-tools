# Grill

## The owner request

> обнови все пакеты до самых последних

The task came out of that order: the raise of NestJS 12 (RT-2773) showed that the specs of three
packages carry type errors nothing reports.

## What the tree already had

- The spec type check found 3 errors in the auth server, 35 in the CMS server and 1 in the rules
  package. No target ran it: Jest compiles a spec file by itself, and the project targets
  typecheck only the library sources.
- 33 of the 35 errors in the CMS server had one cause: the helper `refusalOf` took a promise,
  while the handlers answer with a value or with a promise of one.
- The plugin that infers a `typecheck` target looks for Vitest configs only, so the Jest packages
  got none.

## Decisions

- **The specs are fixed to the types, not the types to the specs:** the sources keep their shapes.
- **A `typecheck` target joins the three projects:** the plan had left it out, but without it the
  errors come back unseen. It sits in each project file, which wins over the plugin.
- **The `used: false` in the media spec was a dead field:** the double reads `double.used` through
  a closure, so the copy's field changed nothing.
- **The utils package is left to RT-2811:** its spec type check finds 10 errors of its own.
