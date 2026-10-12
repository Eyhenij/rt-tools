# Grill

## The owner request

> Довести эпик CMS

## What the tree already has

The epic PR #2645 into main is red: `@rt-tools/cms-angular:typecheck` refuses on three specs —
`cms-dictionaries.store.spec.ts:164`, `site-pages-api.service.spec.ts:67`,
`text-style.function.spec.ts:35`. Reproduced locally with `--skip-nx-cache`.

## What the rules already say

`ui-component-tests`: Jest compiles without checking types, so the typecheck is the only check of
the specs' types. The fix is in the specs only; nothing is asked of the owner.
