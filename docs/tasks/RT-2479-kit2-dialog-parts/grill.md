# Grill

## The owner request

> это запрос из апки по миграции с первого кита на второй, там используется материальный вид

> проанализируй, важно правки не должны сломать второй кит

> делай не так как просят а так как лучше

The consumer's items 25–29: focus handling in the dialog config (`trapFocus`, `restoreFocus`,
`autoFocus`, all off by default); a lead slot before the header title; an `align` input of the
footer; a content part with its own padding and scrolling; properties for the dialog's background,
border, header, title and footer.

## What the tree already has

- The dialog service opens the dialog in a CDK overlay. The overlay neither traps focus nor moves
  it; the component's comment claims the overlay traps focus, which it does not.
- The header holds a title and a close button; the footer pushes its content to the end.
- There is no content part: an application writes its own padded wrapper.
- The frame paints its background with the surface colour directly; the header and footer paint a
  1 pixel border and a large-step padding directly; the title is an `h2` with the browser's bold.
- The dialog's own properties (width, shadow, radius, backdrop) are declared on the page root.
- The first kit declares no `--rt-dialog-*` names.

## Decisions

- **The three focus options default to off.** That is how the dialog behaves today; turning them on
  by default belongs to a major version, as the epic plan already says.
- **Focus trapping is the CDK focus trap; `autoFocus: 'dialog'` focuses the frame.** The frame gets
  `tabindex="-1"` so it can take focus.
- **`restoreFocus` returns focus to the element that held it at opening, if it is still on the
  page.**
- **The lead slot is the attribute `rtDialogHeaderLead`; an empty slot takes no room.**
- **The footer's `align` is a modifier of the footer row; the default `end` is today's layout.**
- **The content part is a new component `rt-dialog-content`.** It is opt-in, so dialogs that keep
  their own wrapper do not change.
- **The properties are consumer handles read with a fallback.** The dialog lives in an overlay, and
  an application sets them on the page root. The borders keep their kit default in a private
  `-default` property, as the token check requires for the border-width family.
