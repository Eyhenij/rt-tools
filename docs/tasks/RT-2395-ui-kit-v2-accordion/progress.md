# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — the subdomain spec
- **Done:** stage 1 — the agreement, the component with its logic, spec and `CONTEXT.md`, the export
- **Next step:** merge the agreement into the subdomain `docs/specs/ui-kit-v2/accordion/`
- **Uncommitted:** nothing of this task
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` 1.0 Write the agreement
- `[x]` 1.1 Write the open-state decision as pure functions with a unit test
- `[x]` 1.2 Write the component in three files
- `[x]` 1.3 Write the component spec and export the component
- `[>]` 2.1 Merge the agreement into the subdomain
- `[ ]` 2.2 Add the subdomain to the tables and the family to the map
- `[ ]` 2.3 Put the scenario numbers into the test titles
- `[ ]` 3.1 Write `CONTEXT.md` and `Overview.mdx`
- `[ ]` 3.2 Write the stories and their wrappers
- `[ ]` 3.3 Shoot the snapshot references and read them
- `[ ]` 4.1 Run the push check set
- `[ ]` 4.2 Take the folder apart and open the PR

## Decisions along the way

- **29 September 2026. The plan header names the draft, not the spec.** The first version of the
  header named the subdomain spec directly; before the first commit it was changed to the draft in
  `proposed/`, as the rule of work conduct asks for work that changes behaviour.

## Session entries

### 29 September 2026

- The task RT-2395 was created outside an epic by the owner's word; the branch was taken from the
  fresh `origin/main`.
- The next scenario number was asked by `pnpm run spec:next-id UKV`: «the next free is SC-UKV-394».
- Stage 1: `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=accordion` — «Tests: 16 passed, 16 total»;
  eslint and stylelint over the family report nothing.
