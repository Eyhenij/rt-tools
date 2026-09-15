# What it is carried out by — a list of records with its own toolbar

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

- **The family assembles the kit's own families and draws nothing of its own.** — `projects/ui-kit-v2/src/lib/components/dynamic-list/rt-dynamic-list.component.ts:imports` — поле, кнопки, флажок, пустое место, вертушка и нумерация взяты готовыми; полосу панели семья раскладывает сама. Сценарий `SC-UKV-172`
- **A hidden action of the toolbar takes no place, and a switched-off one keeps it.** — `projects/ui-kit-v2/src/lib/components/dynamic-list/rt-dynamic-list.component.html:dynamic-list-refresh` — каждое действие стоит под своим условием. Сценарий `SC-UKV-165`
- **The button that clears the filters is switched off while there is nothing to clear.** — `projects/ui-kit-v2/src/lib/components/dynamic-list/rt-dynamic-list.component.html:dynamic-list-clear-filters` — выключенность берётся из входа `filtered`. Сценарий `SC-UKV-166`
- **The search does not reach out on every keystroke.** — `projects/ui-kit-v2/src/lib/components/dynamic-list/rt-dynamic-list.component.ts:searchControl` — готовый оператор ожидания кита. Сценарий `SC-UKV-167`
- **The empty place is told from an empty result under a filter, and they say different things.** — `projects/ui-kit-v2/src/lib/components/dynamic-list/rt-dynamic-list.component.ts:emptyReason` — причина считается по входу отбора. Сценарий `SC-UKV-168`, `SC-UKV-169`
- **The pages are drawn only where there is more than one.** — `projects/ui-kit-v2/src/lib/components/dynamic-list/rt-dynamic-list.component.ts:isPaginationShown` — число страниц считается по модели страницы. Сценарий `SC-UKV-170`
- **The consumer's own markup goes into the toolbar by two inputs, and neither of them is the search.** — `projects/ui-kit-v2/src/lib/components/dynamic-list/rt-dynamic-list.directives.ts:RtDynamicListSelectorsDirective` — два маркера, поле поиска рисует семья. Сценарий `SC-UKV-171`
- **The records are projected, not passed by an input.** — `projects/ui-kit-v2/src/lib/components/dynamic-list/rt-dynamic-list.component.html:ng-content` — содержимое проецируется в тело списка. Сценарий `SC-UKV-172`
