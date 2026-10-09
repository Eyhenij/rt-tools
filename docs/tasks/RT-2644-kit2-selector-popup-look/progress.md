# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Showcase and delivery
- **Done:** rows 122–128 are in the menu: the folder pair, the row icon fill and size, the folder
  header properties, the empty padding, the row press handed to the consumer, the close delay and the
  panel scroll hint. 137 side menu specs and 2624 kit specs are green; 806 frames of 806 match after
  six deliberate re-takes.
- **Next step:** the package archive on the desktop and the message to the application.
- **Uncommitted:** no
- **Waiting for the owner:** «пры не открывай откроеш после моего апрува» — the push and the PR wait
  for the owner's approval.
- **PR:** 2647 merged into main with rows up to 112; the next one is not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write the rules and scenarios of rows 122–128 into the side menu options spec
- [x] 2.1 Add the Material pair of the folder icon
- [x] 2.2 Add the row icon size, the fill, the folder padding, the gap, the chevron colour and the empty padding
- [x] 2.3 Add the panel scroll hint input
- [x] 2.4 Hand the row press to the consumer before the navigation
- [x] 2.5 Add the submenu close delay
- [x] 2.6 Write the specs of the new scenarios
- [x] 3.1 Give the first kit look story the new inputs and properties
- [x] 3.2 Measure the rows, the folder and the delay on :6007
- [x] 3.3 Take the first kit look reference and run the whole set
- [>] 3.4 Build the package archive and tell the application

## Decisions along the way

- **The hint and the delay default to the current look.** The application asked for the first kit's
  values as defaults; the owner's word about the default look of the second kit comes first, and the
  application sets them by the inputs. Affected stage: 2.
- **The Material set got only the folder pair.** The fetch script redrew every existing Material icon
  from the newer drawings upstream; those files were put back, so the material look of the kit moves
  only where `folder` is drawn. Affected stage: 2.
- **Six frames were re-taken on purpose.** Four icon stories list the new pair, the material half of
  the empty state draws the Material folder, and the first kit look story got a fourth case with
  folders and the scroll hint. Affected stage: 3.
- **The look inputs moved to a base class next to the menu.** The menu class stood at 477 lines of
  500; the docs check now reads a base next to a component as part of its inputs. Affected stage: 2.
- **The close delay was measured live with page events.** The browser window was hidden, its timers
  tick once a second, and the driver took five seconds per move; the exact timing is held by the
  spec with fake timers. Affected stage: 3.
