# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — Delivery
- **Done:** required peer, version 0.2.0; the bus image loads Connect (connect ok)
- **Next step:** run the gate set once #2613 is merged, then open the PR into main
- **Uncommitted:** none
- **Waiting for the owner:** no; the gate set is red on two checks of main that #2613 fixes
- **PR:** not open yet

## Steps

- [x] 1.1 Drop `peerDependenciesMeta` from the auth-server manifest and set the version to 0.2.0
- [x] 1.2 Build the bus and read whether the generated manifest carries `@connectrpc/connect`
- [x] 1.3 Drop the Dockerfile workaround if it does, keep it otherwise
- [x] 1.4 Build the bus image and start it
- [>] 2.1 Run the gate set and open the PR into the RT-2612 branch

## Decisions along the way

- **The Dockerfile workaround stays** — the bus build does not write peers of tree packages into the image manifest even when required: the generated manifest has no Connect line after the edit. The comment next to it now says why. Affected stage of the plan: 1.
- **Publishing 0.2.0 is permitted after the merge** — the owner: «публикацию 0.2.0 разрешаю после слияния». After the chain reaches main, the publish workflow of auth-server is started by hand. Affected stage of the plan: 2.
- **The branch stands on main, not on RT-2612** — the owner closed RT-2612 as a duplicate of #2613: «Отдать образ #2613». The branch carries only the manifest and the folder; the image workaround and its comment live in #2613, whose line is still true after the edit. Affected stage of the plan: 1, 2.

## Sessions

### 2026-10-07

- task RT-2615 created from the owner's answer, branch taken from RT-2612 (chain)
- light gate set run: red only check-specs and check-package-imports, both from main; agent-kit:check green
- manifest edited; local bus build and image checked: connect ok, Nest starts
- RT-2612 closed as a duplicate; branch rebuilt on main from the manifest and the folder
