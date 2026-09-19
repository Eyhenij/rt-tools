<!-- rt-kit v0.29.0 · laws/lib-imports.md · 9e2e1f20acd1 · правится надстройкой, не здесь -->
# Law on imports between libs

Who sees whom. The application is cut into libs, and each has a declared list of those it may
depend on: that way a domain that has no reason to know about another's transport or screens
does not get access to them. That list works only as long as a symbol comes from where it is
declared.

The law answers where an import comes from. The layout of the libs and layers themselves is not
its subject.

## Articles

- **A lib exposes only what it declared itself.** A foreign symbol does not pass through it: the
  consumer imports it from the lib where the symbol is declared.
- **The right to see a lib is granted by its tag list, not by a neighbour.** If a right is
  missing, it is added as a line with an explanation of why it was needed.
- **A lib shared by all three applications has an empty dependency list.** The backend sees it
  too, and any dependency of its would become shared by all at once.
- **The place of a shared symbol is chosen by who needs it, not by what it is about.** Laid out
  by subject, symbols of one subject still drift apart: some of them pull in what is not
  available to every consumer.
- **A lib of its own is created when no existing one is visible to the consumers.** Created
  earlier, it stands empty: mechanics with no screens, no state and no requests have nothing to
  fill the layers with.
- **A domain has more than one layer filled, and if only one, that is decided and explained.** A
  domain with a single filled layer cannot be told from a stub for future work, and a stub that
  stood for half a year reads as a domain.
- **A repeat whose name did not match is found by the reader of the edit, not by a check.** A
  copy with the same name or the same set of values is seen by an audit, but the same logic
  written anew under another name is not. A marker that would catch it would also reject the
  lawful: two checks alike in form from different domains do not count as a copy.
