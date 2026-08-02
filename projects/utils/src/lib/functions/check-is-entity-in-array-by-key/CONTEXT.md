# checkIsEntityInArrayByKey

```ts
checkIsEntityInArrayByKey<ENTITY extends Record<string, unknown>, KEY extends Extract<keyof ENTITY, string>>(
    selectedEntities: ENTITY[],
    entity: ENTITY,
    keyExp: KEY
): boolean
```

Reports whether an entity is already in a list, comparing by one identifying field rather than by
reference.

## Use it when

- Driving a selection state: "is this row already selected?", where the selected copy and the
  rendered row are different objects carrying the same `id`.

## Edge cases

- Both sides must **own** the key — an inherited one does not count, and a missing key on either
  side yields `false` rather than matching `undefined` against `undefined`.
- Comparison is `===`. Object-valued keys therefore match only by reference; use a scalar
  identifier.
- Linear scan. For a large selection held in a hot path, a `Set` of keys is the better structure.

## Reach for something else when

- The whole objects should be compared — use
  [`areObjectsEqual`](../are-objects-equal/CONTEXT.md).
