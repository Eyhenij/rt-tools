<!-- rt-kit v0.27.0 · laws/navigation.md · 03e5deb4df4a · правится надстройкой, не здесь -->
# Law on section navigation

How a user finds a section and gets into it. The rules are common to all sections at once: a
section that behaves unlike the rest looks broken.

## Articles

- **A menu item leads to a separate screen with its own address,** not to a tab inside another
  screen and not to something that pops up over it. Such an address opens by a direct link, works
  after a reload, and can be handed to another person.
- **A section none of whose items the user can see is not shown in the menu.**
- **An address opens only for someone who sees the item leading to it.**
- **Item visibility and access to its address are computed from one and the same declaration.**
  Two declarations side by side drift apart sooner or later, and the item ends up hidden while
  the page still opens.
- **Any one of the rights listed for a section is enough for it to be visible.** Parts of the
  screen are closed off separately: a screen is useful both to someone who sees one half of it
  and to someone who sees the other.
- **An item whose screen does not exist yet is visible to everyone.** No rights are issued for
  it: a right opens a screen, and there is no screen.
- **An item of a section that does not exist yet stays visible.** A vanished item cannot be told
  from one that never existed. An item closed by a right is a different matter: the section
  exists, and the right decides, so such an item is not shown at all.
- **Only an item that cannot be clicked has a tooltip, and it explains why.** On the rest it
  repeats the label next to it word for word and adds nothing.
- **Such an item can be hovered and reached from the keyboard.** Otherwise its tooltip cannot be
  read.
- **A screen's address begins with the address of the section its item belongs to.**
- **The active section is marked even when its nested screen is open.**
- **Section labels come from the dictionary and change with the language without a reload.**
- **Nested items unfold both on hover and on click.** A touch screen has no hover, and without
  the second way such a section cannot be opened.
- **Nested items are split into named groups.** Fifteen items in a row as one list cannot be
  read.
- **Unfolded items fit on the screen whole.** Otherwise the far edge goes past the screen border,
  and the user never learns there is something there.
- **An item shows whether it will unfold.** Otherwise the user hovers at random.
- **On a narrow screen the menu is hidden, but it unfolds with the same items and the same
  groups.** The split into groups is needed there no less than on a wide one.
- **A menu that does not fit in height scrolls.**
