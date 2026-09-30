# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — Frames
- **Done:** the frames of the mockup read, the look rules and SC-CH-99…102 in the spec, the widget
  redrawn, its tests and the end-to-end checks of the new look written
- **Next step:** run the widget end-to-end specs, measure against the mockup, re-take the frames
- **Uncommitted:** nothing
- **Waiting for the owner:** the proposals of the rules reviews of RT-2373 and RT-2366
- **PR:** not open yet

## Steps

- [x] 1.1 Read the frames of the mockup for the wide screen and the phone
- [x] 1.2 Write the look rules and the scenarios into the widget spec
- [x] 2.1 Redraw the bubble, the head, the thread and the field in the widget styles and markup
- [x] 2.2 Draw the focus ring of the field
- [x] 2.3 Cover the new markup by the widget tests
- [>] 3.1 Compare the widget with the mockup frames in the browser by measurement
- [ ] 3.2 Re-take the frames `widget-page` and `widget-narrow`
- [ ] 4.1 Run the full set of checks

## Decisions along the way

- The frames are on the page «Переписка с поддержкой» of the kit file, section «Виджет посетителя»;
  the page list of the file does not name it, the frames are opened by their ids.
- The icons of the widget are the kit's SVG paths copied into the widget: the kit does not travel
  with it.
- The send button stays pressable on an empty field and is only pale: SC-CH-55 sends whitespace and
  expects the widget's own check to refuse it.
- No status icons at the bubbles and no operator name: the operator's name is RT-2367.

## Sessions

### 2026-09-30

- The widget code and its spec read; the current frame `widget-page` looked at.
- The frames of the mockup found and read; the spec, the widget and its tests written.
