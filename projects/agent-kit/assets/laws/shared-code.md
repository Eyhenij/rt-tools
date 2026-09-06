# Law on shared code

What the site, the admin panel and the backend understand the same way: page size, the set of
condition operators, sort direction, field length. Written twice, it drifts one value at a time,
and each copy is sound by itself — neither lint, nor the build, nor the tests see the second.

The law speaks of what must be shared. Where such a symbol lies and who sees it is not its
subject.

## Articles

- **A setting number is declared once for all applications.** Page size lived as six
  declarations, and one of them had become `25` against `20` in the rest.
- **A set of values already declared in the shared package is not declared again.** The condition
  operator and the sort direction lay on the backend as a handwritten copy of the same set.
- **The same value written in two places counts as one notion, whatever it is called.** Matching
  names deceive both ways: one name is worn by different things, and one notion drifts apart by
  name — and the second hides a copy more reliably than the first.
- **A value from a finite set is checked against the set, not cast to the type.** A cast accepts
  any string, and the order silently becomes unreadable.
- **A page number below one reads as the first.** A negative number reached the page switcher as
  is.
- **A value that has a shared default is not accepted as an argument.** As long as it can be
  passed, every case may name its own number — that is how page size at one list came to differ
  from the rest.
- **Client and server describe the same thing with the same models.** Separate notions of the
  same thing drift silently: the server's had drifted from the client's on a negative page
  number.
- **A miss in a query value takes the default on the client and becomes a failure on the
  server.** Shared parsing does not cover this: a server that silently accepted an unknown value
  returns not what was asked, and nobody learns of it.
