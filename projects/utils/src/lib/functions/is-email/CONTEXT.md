# isEmail / EMAIL_REGEXP

```ts
const EMAIL_REGEXP: RegExp;
isEmail(value: any): boolean
```

Checks that a value **looks like** an email address.

## Use it when

- Validating a form field, alongside a separate required-check.

## The one thing to know

**An empty value passes.** `isEmail('')`, `isEmail(null)`, `isEmail(undefined)` and `isEmail([])`
all return `true`.

This is deliberate and pinned by a spec: the function answers "is this malformed?", leaving "is
anything there?" to a required-check, so the two can be composed without one reporting the other's
error. Pair it with [`isNil`](../is-nil/CONTEXT.md) or [`isEmpty`](../is-empty/CONTEXT.md) wherever
a value is mandatory.

## Edge cases

- The pattern caps the whole address at 254 characters and the local part at 64, and requires every
  domain label to start and end with an alphanumeric. It does not accept quoted local parts, IP
  literals or internationalised domains.
- A non-string, non-empty value is coerced by `RegExp.test`, so `isEmail(123)` tests the string
  `'123'`.
- `EMAIL_REGEXP` is exported for reuse. It carries no `g` flag, so it holds no `lastIndex` state and
  is safe to share.
