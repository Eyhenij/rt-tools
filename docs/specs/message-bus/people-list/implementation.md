# The list of people — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The section shows the name, the role, the state and the last sign-in.** — `libs/message-bus-admin/accounts/util/src/lib/person.columns.ts:PEOPLE_COLUMNS` — the four columns of the section; the values themselves come from `libs/message-bus-common/src/lib/person-view.ts:IPersonView` and are turned into the words of the screen by `libs/message-bus-admin/accounts/util/src/lib/person.mapper.ts:PersonShortMapper`
- **The section is closed by the right `accounts:read`.** — `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:ADMIN_MENU` — the item of the section carries the right, and the address is closed by the same declaration: `libs/message-bus-admin/auth/shell/src/lib/section-access.ts:sectionRightGuard`
- **The receiver's read operation is closed by the same right.** — `libs/message-bus-api/accounts/feature/src/lib/accounts-read.controller.ts:page`
- **A person without a role is shown as without a role, not as an empty cell.** — `libs/message-bus-admin/accounts/util/src/lib/person.logic.ts:PERSON_ROLE_NONE_KEY` — the key of the word, and the word by it the screen takes: `libs/message-bus-admin/accounts/feature/list/src/lib/admin-people-list.component.ts:rows`
