<!-- rt-kit v0.25.0 · laws/entity-models.md · f32da5d87e14 · правится надстройкой, не здесь -->
# Law on entity models

How much data the application requests and returns on every screen: a list row, an opened
record, a dropdown item. The same entity looks different on each of them, and that difference is
no decoration — it decides how long the user waits for a list.

How a list shows records and how an edit form behaves are the subject of other laws.

## Articles

- **An entity has two sides: what came from the contract, and what the screen uses.** The first
  repeats the contract word for word; the second is normalised and does not depend on a contract
  change.
- **The contract side is not written by hand.** It is declared as an alias of the generated type:
  rewritten by hand, it drifts from the contract silently.
- **Between the sides stands a mapper, and screens read only the second.**
- **An empty value is expressed by an empty string or zero, not by a missing field.** There are
  no optional scalars in the contract, and "not set" means something different for every field.
