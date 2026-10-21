# What it is carried out by — the page header's «More» item

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **Sections that do not fit the header's width go into the «More» item at the end of the row.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.logic.ts:fitRow`, `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:#measureRow`; scenario `SC-UKV-871`
- **The «More» item shows only when at least one section does not fit.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.html:rt-page-header-more`, `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:moreActive`; scenario `SC-UKV-870`
- **The least important sections leave first, and the order of the rest does not change.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.logic.ts:fitRow`, `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.model.ts:priority`; scenario `SC-UKV-872`
- **The «More» panel draws the moved sections as the narrow-screen menu draws them.** — `projects/ui-kit-v2/src/lib/components/page-header/more/rt-page-header-more.component.html:rt-page-header-mobile`; scenario `SC-UKV-873`
- **The selected section inside «More» highlights the «More» item, and the panel marks the selected line.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.logic.ts:hasActiveSection`; scenario `SC-UKV-874`
- **The header does not widen a container that sizes itself by the header.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.scss:__list`; scenario `SC-UKV-875`
- **The «More» caption is a kit label with an English default and the consumer's translation.** — `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts:uiNavMore`, `projects/ui-kit-v2/.storybook/showcase-labels.ru.ts:uiNavMore`; scenario `SC-UKV-873`
