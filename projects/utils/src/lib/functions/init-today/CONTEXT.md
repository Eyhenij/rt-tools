# initToday

```ts
initToday(): Date
```

Today's date with the time zeroed to local midnight.

## Use it when

- Setting the lower bound of a "from today" range, or building a day-level reference point for
  comparisons where clock time would interfere.

## Edge cases

- Midnight is **local**, not UTC. Serialising the result to ISO shifts it by the zone offset.
- A fresh, mutable `Date` is returned on each call — safe to hand out, and cheap to call repeatedly.
- The value is read from the system clock, so anything built on it is time-dependent; use fake
  timers in tests.

## Related

[`isToday`](../is-today/CONTEXT.md) is built on this.
