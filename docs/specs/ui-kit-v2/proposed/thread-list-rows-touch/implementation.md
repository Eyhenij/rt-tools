# Binding — the conversation list rows on a narrow touch screen

There is no code yet, so there is no `file:symbol` binding here: the agreement is written before the
code. Only the expected places are named, so that the merge into the domain spec shows where to look.

## Where it is expected to be carried out

| Rule                                                   | Where it is expected                                          |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| on a narrow place the row shadow blurs by 10           | the messenger look styles, the narrow place threshold         |
| wider the row shadow is the sign's own                 | the shadow step of the sign of size `sm`                      |
| the hover tint exists only where a pointer hovers      | the hover media query of the conversation list styles         |
| the selected row keeps its own background              | the selected row modifier of the conversation list styles     |
