# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Closing
- **Done:** the cause is found and fixed in the entry package; the markup suite passes 140 of 140
- **Next step:** take the task folder apart into the archive record
- **Uncommitted:** nothing after the commit of the fix
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Run the markup suite repeated on the stand until it falls
- [x] 1.2 Read the trace of the fall and name the cause
- [x] 2.1 Fix the cause
- [x] 2.2 Run the markup suite repeated on the stand
- [>] 3.1 Take the task folder apart into the archive record

## Decisions along the way

- **The cause lies in the entry package, not in the suite.** On the return from the Keycloak form
  the start still raised the cookie probe of Keycloak and cut everything by the five-second limit.
  A probe that answered late left the person signed out, and the admin sent them to the form again.
  A probe spec held the cookie frame back for six seconds twice. Before the fix the table came after
  10 464 ms and four frame calls, after it — after 232 ms and one call. So the fix went into the
  package, and the markup suite itself is unchanged.
- **The return address starts without the silent check and without the limit.** The fragment
  carries the code and the state, and then the adapter only exchanges the code. A new entry-suite
  test holds the probe back after the form: it falls on the code before the fix and passes after it.
