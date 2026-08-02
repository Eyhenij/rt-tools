# `@rt-tools/utils` functions

Every exported function owns a directory named after it:

```
is-nil/
  index.ts        # export * from './is-nil.js' — the only path the barrel knows
  is-nil.ts       # the function
  is-nil.spec.ts  # its spec
  CONTEXT.md      # contract, edge cases, when to use something else
```

Rules that hold across the folder:

- **One function per directory.** A file that used to group several (`date-format.ts`,
  `is-equal.ts`, `safe-comparator.ts`) is now several directories, one per export. A type or
  constant that belongs to exactly one function lives with it — `ComparatorType` with `safeCompare`,
  `EMAIL_REGEXP` with `isEmail`, `HAS_OWN_SCOPE_ENUM` with `hasPropertyInChain`.
- **Cross-function imports go through the sibling's `index.ts`**, never at its inner file:
  `import { isNil } from '../is-nil/index.js';`. Extensions are `.js` — the package emits both
  CommonJS and ESM from plain `tsc`, and ESM needs the extension at runtime.
- **Coverage is 100% and gated.** `projects/utils/jest.config.ts` sets a `coverageThreshold` over
  this folder, and coverage is collected from the sources, so a new function without a spec fails
  the run rather than going unnoticed.
- **`internal/` is not a function.** It holds helpers shared by two functions (currently the month
  and weekday tables behind `formatDate` and `parseDate`) and is not exported from the barrel.
- **`is-object/` is not in the barrel** on purpose — see its CONTEXT.md.
- No `@angular/*` and no `rxjs`. The package is framework-agnostic and ESLint enforces it.

## Where to look

| task                 | function                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| absence vs. presence | `is-nil`, `is-empty`, `is-empty-array`, `is-empty-object`, `is-empty-string`                                         |
| type guards          | `is-string`, `is-number`, `is-record`, `is-date`, `is-date-valid`                                                    |
| equality             | `are-objects-equal`, `are-arrays-equal`, `are-arrays-equal-unordered`, `is-equal`                                    |
| sorting              | `safe-compare`, `safe-str-compare`, `safe-num-compare`, `safe-comparator-pipe`, `sort-by-alphabet`, `sort-by-date`   |
| dates                | `format-date`, `parse-date`, `parse-iso`, `date-string-to-date`, `init-today`, `is-today`                            |
| component inputs     | `transform-array-input`, `transform-string-input`                                                                    |
| objects              | `remove-field-from-object`, `has-property-in-chain`, `check-is-entity-in-array-by-key`, `stringify-http-like-params` |
| display              | `empty-to-dash`                                                                                                      |
| validation           | `is-email`                                                                                                           |
| timing               | `debounce`                                                                                                           |
