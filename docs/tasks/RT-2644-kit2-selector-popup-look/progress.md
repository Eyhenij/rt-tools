# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — Showcase and delivery
- **Done:** rows 122–128 are in the menu: the folder pair, the row icon fill and size, the folder
  header properties, the empty padding, the row press handed to the consumer, the close delay and the
  panel scroll hint. 137 side menu specs and 2624 kit specs are green; 806 frames of 806 match after
  six deliberate re-takes.
- **Next step:** after the owner's word — the branch goes to the host, and a new PR into main carries
  rows 113–128. The archive `rt-tools-ui-kit-v2-0.19.1-rows-122-128.tgz` is on the desktop, and the
  application is told what arrived.
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
- [x] 3.4 Build the package archive and tell the application

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
- **Rows 129–130 went into this task by the owner's word about new application rows.** The scroll
  area re-measures its hint at the end of a transition or animation in its body: an opened folder
  grows from zero height, and the size watcher missed the end of that growth. The backdrop of a
  panel held by search starts after the rail, so hovering another rail item switches the panel as
  in the first kit. Affected stage: 2.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2644-kit2-selector-popup-look

### Where we stand at the minute of the compaction

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — Showcase and delivery
- **Next step:** after the owner's word — the branch goes to the host, and a new PR into main carries
- **PR:** 2647 merged into main with rows up to 112; the next one is not open yet

The progress in full — `docs/tasks/RT-2644-kit2-selector-popup-look/progress.md`; the plan lies next to it.

### Uncommitted

```
 M scroll-area/rt-scroll-area.component.spec.ts
 M scroll-area/rt-scroll-area.component.ts
 M side-menu/rt-side-menu.component.scss
```

### Commits over the main branch

```
a92c2d464 chore(rt:ui-kit-v2): main влита в ветку RT-2644
298e4dc7b docs(rt:ui-kit-v2): ход RT-2644 — строки 122–128 сделаны, архив пакета у приложения, ждём слова владельца
33ce4622f feat(rt:ui-kit-v2): боковое меню — строки 122–128 приложения: папка Material, значки строк, нажатие строки, задержка закрытия
7941fc8d5 docs(rt:ui-kit-v2): папка задачи RT-2644 для строк 122–128 и их правила в описании бокового меню
604feb097 Merge remote-tracking branch 'origin/main' into RT-2644-kit2-selector-popup-look
be09487bc feat(rt:ui-kit-v2): боковое меню получает вид первого кита входами и свойствами
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
