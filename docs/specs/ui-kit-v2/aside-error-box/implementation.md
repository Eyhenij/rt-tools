# What it is carried out by — the request error of a side panel

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **The panel shows the box when the application handed it an error, and hides it without one.** — `projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.ts:hasRequestError`
- **The box stands between the header and the content and does not scroll with the content.** — `projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.html:rt-aside-error-box`
- **The copy holds the moment and the error in the first kit's shape.** — `projects/ui-kit-v2/src/lib/components/aside/error-box/rt-aside-error-box.logic.ts:rtAsideErrorCopyText`
- **An error that cannot be written as JSON is copied as text, and the press does not fail.** — `projects/ui-kit-v2/src/lib/components/aside/error-box/rt-aside-error-box.logic.ts:errorAsText`
- **After the copy the button confirms it for one second and then returns to its label.** — `projects/ui-kit-v2/src/lib/components/aside/error-box/rt-aside-error-box.component.ts:onCopy`
- **The box is also a component of its own, for an application that draws the error elsewhere.** — `projects/ui-kit-v2/src/lib/components/aside/error-box/rt-aside-error-box.component.ts:RtAsideErrorBoxComponent`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
