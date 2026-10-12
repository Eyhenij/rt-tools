# What it is carried out by — the breadcrumbs

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **The chain comes as an input; the ancestors are links and the current crumb is text.** — `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.ts:crumbs`; scenario `SC-UKV-819`
- **The host is a navigation landmark named by the kit's label.** — `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.ts:landmarkLabel`; scenario `SC-UKV-819`
- **The back button is drawn only on request and only when the chain has an ancestor.** — `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.ts:backCrumb`; scenario `SC-UKV-820`
- **In the heading look the current crumb is the page heading on a row of its own.** — `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.html:heading`; scenario `SC-UKV-821`
- **On a narrow screen a chain of three ancestors and more folds its middle into a menu.** — `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.logic.ts:rtBreadcrumbsFold`; scenario `SC-UKV-822`
- **The separator is an input, and its default is the slash.** — `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.ts:separator`; scenario `SC-UKV-823`
- **A long chain does not push the page sideways.** — `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.scss:scrollbar-width`, `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.ts:list` — the row scrolls to its end after every render and every size change of the crumbs; scenario `SC-UKV-824`
- **A long current crumb gives way to its ancestors while they fit next to its threshold.** — `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.logic.ts:rtBreadcrumbsFits`, `projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.ts:fitted` — the same measurement that scrolls the row decides the fit; scenario `SC-UKV-830`
