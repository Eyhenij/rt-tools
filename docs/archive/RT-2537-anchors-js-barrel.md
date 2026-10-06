# Grill

## The owner request

> изучи как утроен логин на [приложении А] и [приложении Б] проектах - нужно вынести логин в отдельный модуль который можно подключать в приложения

This task is a finding of the epic: the contract package of the entry module hit it.

## What the tree already has

- The anchor audit counts a symbol as published when an `index.ts` or `public-api.ts` re-exports
  its file by a relative path. The path is matched literally with `.ts` and `/index.ts` appended.
- An ES module package writes `export * from './lib/caller.js'`. The audit looks for
  `caller.js.ts`, finds nothing, and reads the published functions as called by tests alone.
- The contract companion holds four rules marked not checked by a machine for this reason.

## Decisions

- **The `.js` ending of a relative import is read as the `.ts` source of the same name.** It is
  how the compiler itself resolves it. Rejected: dropping the ending in the barrels — the built
  package then does not load under Node as an ES module.

## What is left unclear

- Nothing blocks the task.
