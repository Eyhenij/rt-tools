# What it is carried out by — the tabs of the conversation list and the line under the chat title

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The tabs strip stands under the list header and above the rows.** — `projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.component.html:thread-list-tabs`, the slot — `projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.directives.ts:RtThreadListTabsDirective`, the inset — `projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.component.scss:__tabs`; scenario `SC-UKV-1060`
- **A list without the tabs template is drawn as before.** — `projects/ui-kit-v2/src/lib/components/thread-list/rt-thread-list.component.ts:tabsTemplate` — the strip stands behind its own condition; scenario `SC-UKV-1061`
- **The subtitle stands under the title in one column.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.ts:subtitle`, the column and the truncation — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.scss:__subtitle`; scenario `SC-UKV-1062`
- **A header without the subtitle is drawn as before.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.html:chat-subtitle` — an empty line is hidden by the `hidden` attribute; scenario `SC-UKV-1063`
