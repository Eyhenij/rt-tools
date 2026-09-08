# Scenarios — the store gives no emptiness

The numbers begin the numbering of the domain of the store and do not change after the merge.

### SC-ST-01 — a sign of the waiting without a field in the state answers "we are not waiting"

Given the state is put together without the fields of the signs of the waiting
When the screen reads the sign of the loading and the sign of the further loading
Then both answer with a falsehood, not with an emptiness

Covered: `projects/store/src/lib/base-async-store.service.spec.ts`.

### SC-ST-02 — a state of a request without a field answers with the initial one

Given the state is put together without the fields of the states of a request
When the screen reads the state of the request
Then it answers with the initial state

Covered: `projects/store/src/lib/base-async-store.service.spec.ts`.

### SC-ST-03 — a lawful initial state is not substituted by the spare answer

Given the state holds the initial state of a request
When the screen reads it
Then the same initial state arrives, not the spare answer

Covered: `projects/store/src/lib/base-async-store.service.spec.ts`.

### SC-ST-04 — a refusal equal to zero reaches the taking apart

Given the refusal is equal to zero
When the store takes it apart
Then the taking apart happens and the named action is carried out

Covered: `projects/store/src/lib/base-async-store.service.spec.ts`.

### SC-ST-05 — an empty refusal calls no taking apart

Given there is no refusal at all
When the store takes it apart
Then neither a write nor the named action happens

Covered: `projects/store/src/lib/base-async-store.service.spec.ts`.
