<!-- rt-kit v0.28.0 · laws/code-structure.md · 9b3b6d2587ed · правится надстройкой, не здесь -->
# Law on code structure

What must be true about the code itself regardless of what it does. The law is needed because
code is read more often than written: a name that does not show the kind of the declaration, and
a type declared as fitting instead of checked, cost the reader a separate trip to a neighbouring
file.

## Articles

- **The name of a declaration says what kind it is.** Without that, the kind of a declaration is
  found out by going to it, and anew at every reading.
- **A file name that promises a kind of declaration finds that declaration inside.** Listings,
  directory trees and error messages show the name instead of the content, and a promise the file
  does not keep costs more than no promise at all.
- **The source of a watched value is visible from its name.** Otherwise a subscription to it
  looks like an ordinary read, and people forget to remove it.
- **A type is taken from the package where it is declared.** A copy of someone else's type drifts
  from the original silently, and only one of them gets compiled.
- **A value is not declared as fitting around the type check.** A cast through an intermediate
  "unknown" switches the check off on purpose and accepts anything; where there is no other way,
  the reason is named next to it.
- **A deprecation mark is a reason to remove, not a reason to keep.** A deprecated declaration
  that silently keeps working outlives whoever marked it.
- **A file is read whole.** The length at which it is read in parts is declared as one number for
  all kinds of files, and what accumulated before the declaration is listed one by one: the list
  marks a debt, it does not grant permission.

## Open questions

- **Q-CS-3 — a file name without a promise of kind is judged by nothing.** The check asks a file
  whose name names a kind; a name made of words about content alone says nothing, and a kind can
  be made mandatory only by a product decision.
- **Q-CS-4 — a one-step cast stays unchecked.** Going around the check through an intermediate
  "unknown" is banned, and an ordinary cast is accepted: part of it is mandatory, and the ban
  would reject it along with the rest. The decision will change whether every remaining one
  needs a reason.
