## The highlight is given by the router, not computed from the address

A section of this tree. The menu here is drawn by the kit top row, and it hands the highlight of
the current item to the router: an item carries the section address, and the one lit is the one
whose address is open. Computing it oneself — as a derivation over router events, the way the
shell did before the menu moved into a row — means answering the question about the address a
second time and diverging from the first answer on the very first address with a parameter or an
open panel.

- **An item declares an address, not a «current» flag.** There is no `active` field in the
  declaration at all: putting one there means starting a second source of truth about the open
  section.
- **No exception list for the highlight is started.** A panel address lives in a separate outlet
  and does not change the section address, so an open panel does not knock the highlight off.
- **The narrow layout of the row is started by the kit.** On a narrow screen the inline row hides
  whole, and the same items open by a button — the application header writes no narrow layout of
  its own.
