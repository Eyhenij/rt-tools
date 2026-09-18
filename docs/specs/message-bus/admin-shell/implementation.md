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
- **A person chooses the language of the labels, and one choice serves both dictionaries.** — `libs/message-bus-admin/common/core/util/src/lib/admin-locale.ts:AdminLocaleService` — one signal of the choice. The labels of the admin application read it through `libs/message-bus-admin/common/core/util/src/lib/admin-text.service.ts:AdminTextService`. The labels of the kit — through `translator` of the same service. The switch itself — `libs/message-bus-admin/common/core/ui/src/lib/locale-switch/admin-locale-switch.component.ts:AdminLocaleSwitchComponent`.
- **The dates in the lists are shown in one shape at any choice.** — `libs/message-bus-admin/common/core/ui/src/lib/moment/admin-moment.pipe.ts:AdminMomentPipe`
- **A label of a screen comes from the dictionary by a key, not as a string in the markup.** — `libs/message-bus-admin/common/core/util/src/lib/admin-text.service.ts:AdminTextService` — the screen asks by a key. The Russian set — `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts:ADMIN_LABELS`. The English one — `libs/message-bus-admin/common/core/util/src/lib/admin-labels-en.ts:ADMIN_LABELS_EN`.
- **The key is one for both languages.** — `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts:TAdminLabelKey` — the type of the key is derived from the Russian set. The English set is declared by it: a key of its own does not compile.
- **A key that is not in the set is visible.** — `libs/message-bus-admin/common/core/util/src/lib/admin-text.service.ts:missing` — the name of the key in quotes instead of the label.
- **The labels of the shell change without a reload.** — `libs/message-bus-admin/common/container/ui/src/lib/header/admin-header.component.ts:AdminHeaderComponent` — every label of the header is derived from the choice. The top row does the same: `libs/message-bus-admin/common/container/feature/src/lib/admin-container.component.ts:AdminContainerComponent`. The text of an item is taken by the key of `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:IAdminMenuItem`.
- **The choice of the language stands on the screen of the entry and in the popup of the profile.** — `libs/message-bus-admin/auth/feature/sign-in/src/lib/admin-sign-in.component.ts:AdminSignInComponent`
- **The choice of the language lives on the device and outlives a reload.** — `libs/message-bus-admin/common/core/util/src/lib/admin-locale.ts:AdminLocaleService`
- **The form of the entry stays reactive and a component of its own.** — `libs/message-bus-admin/auth/ui/src/lib/sign-in-form/admin-sign-in-form.component.ts:AdminSignInFormComponent`
- **The fields of the entry carry an icon and a placeholder.** — `apps/message-bus-admin-e2e/src/sign-in-chrome.spec.ts:SC-MB-151`
- **A refusal of the entry stays a message in the form.** — `libs/message-bus-admin/auth/ui/src/lib/sign-in-form/admin-sign-in-form.component.ts:FAULT_TEXT`
- **The stack of the toasts is one, and it is drawn by the framework.** — `libs/message-bus-admin/common/container/feature/src/lib/admin-container.component.ts:AdminContainerComponent`
- **The heading of the tab names the application, not the project of the build.** — `libs/message-bus-admin/common/core/util/src/lib/admin-title.strategy.ts:AdminTitleStrategy`
- **The page declares the language of the document as the one it is written in.** — `libs/message-bus-admin/common/core/util/src/lib/admin-locale.ts:AdminLocaleService` — the sign of the document goes after the choice. The initial value stands in `apps/message-bus-admin/src/index.html`, and the end-to-end spec SC-MB-404 holds the rest.
- **A header pinned at the top is opaque over the whole width.** — `apps/message-bus-admin/src/styles/_header.scss:admin-header`
- **What stands above the page paints its own ground itself.** — `apps/message-bus-admin/src/styles/_profile-menu.scss:admin-profile-menu`
- **The screen has an address of its own, and it stands next to the addresses of the sections.** — `libs/message-bus-admin/auth/util/src/lib/auth-paths.ts:NO_SECTIONS_PATH`
- **The screen lives inside the shell, not beside it.** — `apps/message-bus-admin/src/app/app.routes.ts:appRoutes`
- **The root of the admin panel leads to the screen when no section is open.** — `libs/message-bus-admin/auth/shell/src/lib/section-access.ts:landingPath`
- **A direct link to a closed section leads to the screen, not to a cancelled move.** — `libs/message-bus-admin/auth/shell/src/lib/section-access.ts:sectionRightGuard`
- **The screen is open to whoever has no section open, and leads away everyone else.** — `libs/message-bus-admin/auth/shell/src/lib/section-access.ts:noSectionsGuard`
- **The screen names the reason and whom to ask, not the rights that are missing.** — `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts:ADMIN_LABELS`
- **The way out from the screen is the same way out as everywhere.** — `libs/message-bus-admin/common/container/ui/src/lib/header/admin-header.component.ts:AdminHeaderComponent`
- **A right that arrives without a reload takes the person off the screen.** — `libs/message-bus-admin/common/container/feature/src/lib/admin-no-sections.component.ts:AdminNoSectionsComponent`
- **The screen is not shown while the answer about the signed-in person has not arrived.** — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts:rightsKnown`
