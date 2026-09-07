---
name: shared-code-new
kind: pattern
rule: shared-code
description: Pattern of rule shared-code. Load when a new setting number, shared function or shared type is added that the site, the admin and the backend must understand the same way. Where to put it, how to declare it, how to check a string against the set and how to make sure no copy stayed in the old place.
---

# This is how new shared code is declared

Pattern of the rule `shared-code`. What must be true — the law
`docs/constitution/shared-code.md`.

## When to use

- A setting number appeared: a limit, a size, a duration.
- A function without a framework appeared that both sides need.
- A value arrives as a string and must be checked against a finite set.

## Where to put it

| What                                        | Where                                              |
| ------------------------------------------- | -------------------------------------------------- |
| a number or a function without a framework  | `libs/common/util`, a file by subject              |
| a ready-made type or value set              | taken from `@rt-tools/utils`, not rewritten        |
| a DI token shared by the two frontend families | `libs/common/platform`                          |

The file is chosen by subject: `const/list.const.ts`, `functions/list-selection.util.ts`. Then —
a line in the barrel `libs/common/util/src/index.ts`.

## A number is declared once and without an argument

```typescript
export const DEFAULT_PAGE_SIZE: number = 20;
```

```typescript
✗ export function listPageOf(query: ListQuery | undefined, defaultPageSize: number): IListPage
✓ export function listPageOf(query: ListQuery | undefined): IListPage
```

While the default is passed as an argument, a domain may name its own number — that is how promo
codes got `25` against `20` for the rest of the lists.

## A string is checked against the set, not cast to a type

A cast accepts any string. The check is done by the shared pair of functions, and what to do with
a miss is decided by the caller.

```typescript
const operator: TFilterOperatorType | null = listFilterOperatorOf(filter.operatorType);
if (!operator) {
    throw new ConnectError(`filter operator is required: ${filter.propertyName}`, Code.InvalidArgument);
}
```

```typescript
const direction: TListSortOrderType = listSortOrderOf(rawDirection) ?? EListSortOrder.ASC;
```

The server refuses the request, the screen takes the default. The shared mapper is no good here:
it would hand out the miss as the default, and the client would get a filter it never asked for.

`typeCast.getAsType` is no good for this either — a value outside the set it writes to the
console and returns as the string `'unknown'`.

## Check that no copy stayed

```bash
npm run check:dupes
```

The check fails on four signs: one name from two libs, two enumerations with the same set of
members, a setting number under one name in two libs, an enumeration repeating a set from
`@rt-tools/utils`.

What accumulated lies in `tools/dupes-allowlist.json` under the key `debt` and does not count as
a refusal. The list only shrinks: a new line in it means the repeat was created after the check.

## Common misses

- An own enumeration with the same members that `@rt-tools/utils` already has — a copy, even
  when the names diverge.
- A default passed as an argument — the domain will name its own number, and the drift will be
  silent.
- The same logic written anew under another name is not caught by the check and will not be —
  such a repeat is found only by whoever reads the edit.
- A string setting and a mapping table are not counted at all — debt `Q-S-2`.
