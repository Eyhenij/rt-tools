# The shell of the admin application — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The sections are shown by the top row of the page, not by the left column.** — `libs/message-bus-admin/common/container/ui/src/lib/header/admin-header.component.ts:AdminHeaderComponent`
- **The top row is drawn by a ready component of the kit.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:RtPageHeaderComponent`
- **An item is declared by the declaration of the menu and carries the address of the section.** — `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:ADMIN_MENU`
- **The highlighting of the current section is given by the router, not by the shell.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:RtPageHeaderComponent`
- **There is no panel of the second level while there are no nested sections.** — `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:IAdminMenuItem`
- **The name of the application stands in the same row, to the left of the sections.** — `libs/message-bus-admin/common/container/ui/src/lib/header/admin-header.component.ts:AdminHeaderComponent`
- **The application calls itself by a word, not by a sign.** — `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts:ADMIN_LABELS`
- **On a narrow screen the same sections open by a burger button.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts:RtPageHeaderComponent`
- **A press on the profile opens the popup, it does not exit.** — `libs/message-bus-admin/common/container/ui/src/lib/header/admin-header.component.ts:AdminHeaderComponent`
- **The popup of the profile shows the name of whoever entered, the theme, the language and the exit.** — `libs/message-bus-admin/common/container/ui/src/lib/header/admin-header.component.ts:AdminHeaderComponent`
- **There is no changing of the password in the popup.** — **Not checked by a machine.** The absence of an item is invisible to a machine — it is held by reading the template of the popup of the header.
- **There is no bell of the unread.** — **Not checked by a machine.** The absence of an item is invisible to a machine — it is held by reading the template of the popup of the header.
- **The exit breaks off the entry that was come by and leads away to the screen of the entry.** — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts:signOut`
- **There are two themes, and a person chooses between them.** — `projects/ui-kit-v2/src/lib/components/theme-toggle/rt-theme-toggle.component.ts:RtThemeToggleComponent`
- **The choice of the theme lives on the device and outlives a reload.** — `projects/ui-kit-v2/src/lib/platform/theme.service.ts:ThemeService`
- **The switch of the theme stands both in the popup of the profile and on the screen of the entry.** — `libs/message-bus-admin/common/container/ui/src/lib/header/admin-header.component.ts:AdminHeaderComponent`
- **Both themes are checked by a measurement, not by a look.** — `apps/message-bus-admin-e2e/src/shell.spec.ts:SC-MB-147`
- **A person chooses the language of the labels the kit draws.** — `libs/message-bus-admin/common/core/ui/src/lib/locale-switch/admin-locale-switch.component.ts:AdminLocaleSwitchComponent`
- **The dates in the lists are shown in one shape at any choice.** — `libs/message-bus-admin/common/core/ui/src/lib/moment/admin-moment.pipe.ts:AdminMomentPipe`
- **The labels of the admin application stay Russian at any choice.** — `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts:ADMIN_LABELS`
- **The choice of the language stands on the screen of the entry and in the popup of the profile.** — `libs/message-bus-admin/auth/feature/sign-in/src/lib/admin-sign-in.component.ts:AdminSignInComponent`
- **The choice of the language lives on the device and outlives a reload.** — `libs/message-bus-admin/common/core/util/src/lib/admin-locale.ts:AdminLocaleService`
- **The form of the entry stays reactive and a component of its own.** — `libs/message-bus-admin/auth/ui/src/lib/sign-in-form/admin-sign-in-form.component.ts:AdminSignInFormComponent`
- **The fields of the entry carry an icon and a placeholder.** — `apps/message-bus-admin-e2e/src/sign-in-chrome.spec.ts:SC-MB-151`
- **A refusal of the entry stays a message in the form.** — `libs/message-bus-admin/auth/ui/src/lib/sign-in-form/admin-sign-in-form.component.ts:FAULT_TEXT`
- **The stack of the toasts is one, and it is drawn by the framework.** — `libs/message-bus-admin/common/container/feature/src/lib/admin-container.component.ts:AdminContainerComponent`
- **The heading of the tab names the application, not the project of the build.** — `libs/message-bus-admin/common/core/util/src/lib/admin-title.strategy.ts:AdminTitleStrategy`
- **The page declares the language of the document as the one it is written in.** — **Not checked by a machine.** The sign stands as an attribute of the markup, and there is no symbol in it; it is held by the end-to-end spec SC-MB-152 and by reading `apps/message-bus-admin/src/index.html`.
- **A header pinned at the top is opaque over the whole width.** — `apps/message-bus-admin/src/styles/_header.scss:admin-header`
- **What stands above the page paints its own ground itself.** — `apps/message-bus-admin/src/styles/_profile-menu.scss:admin-profile-menu`
