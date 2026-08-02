# debounce

```ts
debounce(timeout?: number): MethodDecorator
```

Method decorator that collapses a burst of calls into a single trailing call, `timeout`
milliseconds after the last one. Defaults to 300 ms.

```ts
class SearchComponent {
    @debounce(200)
    public onQueryChange(query: string): void { … }
}
```

## Use it when

- Throttling a handler bound to typing, scrolling or resizing.

## Edge cases

- **Trailing edge only.** The first call is delayed too; nothing fires immediately.
- **The return value is lost.** The wrapper is typed `void` and the real call happens later — a
  decorated method must not be expected to return anything.
- Timers are held in a `WeakMap` keyed by the **instance**, so two instances debounce independently
  and neither keeps the other alive.
- **There is no cancel.** A pending call still fires after the component is destroyed; if the
  callback touches destroyed state, guard inside it.
- Arguments come from the **last** call in the burst; earlier ones are dropped.
- The decorator replaces `descriptor.value`, so it must be applied to a method, not to an arrow
  function assigned to a field (that is a property, and the descriptor has no `value` to wrap at
  decoration time).

## Reach for something else when

- You are inside an RxJS pipeline — `debounceTime` composes and unsubscribes properly.
