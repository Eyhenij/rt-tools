# What it is carried out by — the more of a sheet behind «⋮»

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **A sheet given a more template puts a round «⋮» button on the right of its header.** — `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.html:bottom-sheet-more`, the gap of 8 by `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.scss:&__action`
- **«⋮» opens the second screen of the same sheet.** — `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.html:bottom-sheet-more-screen`, the title and the dialog name by `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts:bottomSheetMore` and `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-sheet-more.directive.ts:rtSheetMoreTitle`
- **The chevron, a swipe, Escape and the back request of the template return to the first screen.** — `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-sheet-more-screen.ts:RtSheetMoreScreen` (`opened`, `context`), closed again with each change of the sheet's openness and of the template
- **A sheet with its own header gets the sign that it has a second screen and the request to open it, and draws «⋮» itself.** — `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.model.ts:hasMore` and `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.model.ts:openMore`
- **The more template belongs to the sheet it is written in and stands as its direct child.** — `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.ts:ownMore`, the template `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-sheet-more.directive.ts:RtSheetMoreDirective`
- **A component that draws the sheet in its own template passes the more template by an input.** — `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.ts:moreTemplate`, chosen over the content by `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-sheet-more-screen.ts:directive`
- **What must stay in sight an application still puts in the header, the footer or the body.** — the places `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.html:sheetAction` and `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.html:sheetFooter`
- **After the answer «stay» to the question before closing the closed second screen stays out of reach.** — `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.ts:onConfirmCancel`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
