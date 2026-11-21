## How a screen talks to the shared list page

A section of this tree. The package has no such intermediary: there the toolbar and the page
switcher are declared by the screen itself, while here a shared page view, one for all sections,
stands between the screen and the kit. The articles below are about that boundary, and they stand
as a separate section so that an edit of the package articles travels here by itself.

- **The filter and its own buttons the screen puts into the slots of the shared page, not passes
  to it as inputs.** A filter nailed into the page is the same for every section by compulsion: a
  section that needs a different one has nowhere to put it, and the page grows an input for every
  new kind of filter that may ever be needed.
- **The page has three slots: the left part of the toolbar, the right one and the place above the
  table.** On the left is what changes the selection; on the right, actions over the list as a
  whole; above the table, what concerns the whole list at once. What is said about the whole list,
  put as a row into the list itself, reads as one of the records.
- **An unoccupied slot does not appear on the screen at all.** An empty half of the toolbar and an
  empty strip above the table read as broken markup, not as free space.
- **Refreshing the list and the column settings are drawn by the page, and the section buttons
  stand to their left.** They exist on every section and are the same; handed out to sections,
  they drift in label, icon and place, and a person hunts for them at the toolbar edge on every
  section.
- **The read, the page, its size and the column settings the page asks of the host, rather than
  giving them outward as events.** An event per action grows in number with every new action,
  while a forgotten wiring shows only on the assembled screen.
- **A section declares itself the host by one provider line, and the shared mechanics base answers
  for it.** Injection looks for what the screen itself declared — the base has no selector and
  cannot declare itself in its stead; yet the screen writes not one answer of its own.
- **The check anchors on the shared page are assembled from a prefix named by the screen.**
  Identical anchors on different sections do not answer whose element the check found: a spec that
  opened the wrong section finds the same anchor and passes green. The prefix is the same word as
  the section table uses.
- **The anchors of the table itself and of its rows are assembled where the page anchors are.**
  Written as a string in the template of each screen, they drift from the prefix silently: the
  name is fixed in one place, and the spec of a neighbouring section stays green because it finds
  the former one.
- **The heading accepts a hint, and a section without a hint shows a single name.** Space left for
  a hint shifts the heading on the sections that have none.
- **The screen declares the table by the kit tag, not by an attribute on a native `<table>`.**
  Both forms build and both show rows, so the miss stays silent: the attribute form loses the
  reading overlay and the narrow-screen cards entirely — the kit draws them as nodes that are
  never children of `<table>`, and on foreign markup it does not draw them at all. The price of
  the tag is the table role: an own element has none, the row and cell roles are set by CDK, which
  has no table role, and the kit sets it itself.
- **An empty list shows an emptiness view, not a phrase in place of the rows.** A phrase inside
  the table reads as one of the records, and an empty section is indistinguishable from one that
  did not finish loading. The view is given by the kit and only once the read is over: while it
  goes, skeletons stand in place of the rows.
- **The emptiness view names where the records come from, as a separate line.** «No records»
  answers the question whether it is broken, but not the question what to do; the second line the
  section names for itself, because different sections have their records brought by different
  things. It is not written as one phrase through a colon: the kit draws the heading and the
  description as different nodes and in different type.
- **The list page scrolls together with the whole page, not by a zone of its own.** The frame is
  not nailed to the window height: in the nailed mode the kit clips the content zone and expects
  scrolling from every zone inside, and the list page starts none — the rows and the page switcher
  go past the bottom edge with nothing to reach them by.
