# @rt-tools/utils

[![npm](https://img.shields.io/npm/v/@rt-tools/utils?color=c00)](https://www.npmjs.com/package/@rt-tools/utils)
[![No framework](https://img.shields.io/badge/dependencies-tslib%20only-3178c6)](https://www.npmjs.com/package/@rt-tools/utils?activeTab=dependencies)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE)

Pure functions, list models and type helpers — **no framework**. Part of the
[rt-tools](https://github.com/Eyhenij/rt-tools) workspace.

The package depends on `tslib` and nothing else, and ships both CommonJS and ESM, so it works in a
Node script, a build step or code shared between a server and a browser just as well as inside an
Angular application. A CI check asserts this against the built output: no framework import, no
partial-compilation marker, both entry points loadable.

> Everything that needs Angular — the directives, pipes, validators and services this package used
> to hold — lives in [`@rt-tools/core`](https://www.npmjs.com/package/@rt-tools/core). The two never
> re-export each other, so a symbol has exactly one home.

## Installation

```bash
pnpm add @rt-tools/utils
# or
npm install @rt-tools/utils
```

No peer dependencies to satisfy.

## What is in it

Every function carries JSDoc with its contract, edge cases and an example, and that JSDoc travels
into the shipped `.d.ts` — hover in the editor and you have the documentation. Inside the
repository, each function additionally owns a `CONTEXT.md` explaining when to reach for something
else.

### Absence and emptiness

```typescript
import { isNil, isEmpty, isEmptyArray, isEmptyString, isEmptyObject, emptyToDash } from '@rt-tools/utils';

isNil(0); // false — only null and undefined are nil
isEmpty(''); // true — also for null, [], {}
isEmpty(new Date()); // false — a Date is never empty
isEmptyArray(null); // true — all three tolerate nullish
emptyToDash(''); // '—'  (0 and false pass through)
```

### Type guards

```typescript
import { isString, isNumber, isRecord, isDate, isDateValid } from '@rt-tools/utils';

isNumber(NaN); // true — it is a number; use Number.isFinite for "usable"
isRecord(new Map()); // false — object literals only
isDate(new Date('nonsense')); // false — rejects an Invalid Date
```

### Equality

```typescript
import { areObjectsEqual, areArraysEqual, areArraysEqualUnordered, isEqual } from '@rt-tools/utils';

areObjectsEqual({ a: { b: 1 } }, { a: { b: 1 } }); // true  — deep, key order irrelevant
areArraysEqual([1, [2]], [1, [2]]); // true  — deep, order matters
areArraysEqualUnordered([1, 2], [2, 1]); // true  — multiset, duplicates counted
isEqual({ a: 1 }, { a: 1 }); // true  — cheap JSON check, see its caveats
```

### Sorting

```typescript
import { safeStrCompare, safeNumCompare, safeComparatorPipe, sortByAlphabet, sortByDate } from '@rt-tools/utils';

names.sort(safeStrCompare); // locale-aware, nullish sorts last
rows.sort((a, b) =>
    safeComparatorPipe(
        () => safeStrCompare(a.lastName, b.lastName),
        () => safeNumCompare(a.age, b.age)
    )
);
rows.sort((a, b) => sortByAlphabet(a, b, 'name'));
```

### Dates

```typescript
import { formatDate, parseDate, parseISO, dateStringToDate, isToday, initToday } from '@rt-tools/utils';

formatDate(new Date(2024, 0, 15), 'dd.MM.yyyy'); // '15.01.2024'
formatDate(new Date(2024, 0, 15), "'Issued on' dd.MM.yyyy"); // quote literal text
parseDate('15.01.2024', 'dd.MM.yyyy'); // reads back what formatDate wrote
parseISO('2024-01-15T14:30:00.000Z');
```

Parsing never throws: failure is an Invalid Date, so check the result with `isDate`.

### Objects and inputs

```typescript
import {
    removeFieldFromObject,
    hasPropertyInChain,
    checkIsEntityInArrayByKey,
    stringifyHttpLikeParams,
    transformArrayInput,
    transformStringInput,
} from '@rt-tools/utils';

removeFieldFromObject(dto, 'password'); // shallow copy without the key
hasPropertyInChain(obj, 'id'); // own by default; ANY / INHERITED on request
checkIsEntityInArrayByKey(selected, row, 'id'); // "is this row already selected?"
stringifyHttpLikeParams({ page: 1 }); // { page: '1' }
transformArrayInput(maybeArray); // always an array — for component inputs
```

### Validation and timing

```typescript
import { isEmail, EMAIL_REGEXP, debounce } from '@rt-tools/utils';

isEmail('a@b.co'); // true
isEmail(''); // true — see below

class SearchComponent {
    @debounce(200)
    public onQueryChange(query: string): void {}
}
```

`isEmail` answers "is this malformed?", not "is anything there?" — an empty value passes, so pair it
with a required-check. `debounce` is a **method decorator** taking a timeout, trailing-edge only.

### Models and type helpers

```typescript
import { ListState, SortModel, PageModel, FilterModel, FILTER_OPERATORS, LIST_SORT_ORDER_ENUM } from '@rt-tools/utils';
import { Nullable, Optional, PartialOmit, IntersectionType, ValuesType } from '@rt-tools/utils';
import { BaseMapper, TypeCastHelper } from '@rt-tools/utils';
```

`ListState` and friends describe a paged, sorted, filtered list — the shape `@rt-tools/ui-kit`'s
table speaks and a server can reuse. `BaseMapper` is the DTO↔model mapping base; `TypeCastHelper`
coerces loosely typed values.

## Requirements

Node `>=22` or any bundler. Nothing else.

## License

[Apache-2.0](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE) © Yauheni Krumin
