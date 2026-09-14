# Scenarios — text that does not fit its place

None of the five is closed by a test with an identifier, and the reason is one for all. What they
promise is a computed value of a drawn node, and a component test does not see it: the styles of
the component do not reach the test environment at all. There the markup holds the whole text, and
the clipping belongs to the browser. They are checked by the run of the snapshots and by a
measurement of the drawn node; the measured numbers stand under each.

### SC-UKV-137 — the name of a file keeps one line and ends with an ellipsis

Given a card of a file whose name is longer than the place the card is given
When the card is drawn
Then the name occupies one line, and its tail is replaced by an ellipsis

Not covered: it cannot be closed by a test with an identifier — the wrapping and the clipping of a
node are computed values, and the styles of the component do not reach the test environment.
Checked on the spot: the name measured 34 points at two lines and became 17 at one on all three
showings; the wrapping reads `nowrap` and the clipping `hidden` with an ellipsis.

### SC-UKV-138 — the card does not grow past the place it is given

Given a place narrower than the card's content
When the card is drawn in it
Then the width of the card is not greater than the width of the place

Not covered: it cannot be closed by a test with an identifier — the width of a drawn node is not
in the markup. Checked on the spot: of the 32 cards of three showings none is wider than its cell;
before the edit nine of eighteen went past it, up to 341 points on the showing of the name.

### SC-UKV-139 — the hint over the area of dropping stays inside the area

Given an area of dropping lower than the hint laid out at its full size
When a file is dragged over the area
Then the hint lies inside the area's own box and is not cut midword

Not covered: it cannot be closed by a test with an identifier — the position of a drawn node is
not in the markup. Checked on the spot: the hint measured 126 by 84 in a box of 208 by 66 and
stuck out by a point above and below; after the edit it measures 198 by 30 with 26 points of room
on each side.

### SC-UKV-140 — the hint is drawn in a compact form on a low area

Given an area of dropping whose height leaves no room for the hint at its full size
When a file is dragged over the area
Then the hint is drawn in the compact form rather than at the full one

Not covered: it cannot be closed by a test with an identifier — the form is chosen by a query
about the size of the box, and the test environment computes no queries. Checked on the spot: at a
box of 66 points the compact form takes hold, at 130 — the one with zones — it does not, and the
sublabel of a zone keeps its room.

### SC-UKV-141 — a showing named by the hint shows the hint

Given the showing of the area of dropping named by the hint
When the frame of that showing is taken
Then both halves of the pair hold the hint over the content

Not covered: it cannot be closed by a test with an identifier — it is checked by the run of the
snapshots, and its tests are created by the stories of the showcase and carry no identifier.
Checked on the spot: the showing held no hint at all, and after the drag step was added to it the
overlay is measured in both halves.
