# What it is carried out by — the profile menu

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **The menu draws its own panel: background, border, rounded corners and a shadow.** — `projects/ui-kit-v2/src/lib/components/profile-menu/rt-profile-menu.component.scss:rt-profile-menu`; scenario `SC-UKV-857`
- **The round mark carries the first letter of the name in upper case, and the name stands under it.** — `projects/ui-kit-v2/src/lib/components/profile-menu/rt-profile-menu.component.ts:avatar`; scenario `SC-UKV-857`
- **The organization line shows only with a non-empty organization name.** — `projects/ui-kit-v2/src/lib/components/profile-menu/rt-profile-menu.component.ts:organizationName`; scenario `SC-UKV-858`
- **The organization change is hidden, unavailable with an explanation, or available, as the application sets it; hidden by default.** — `projects/ui-kit-v2/src/lib/components/profile-menu/rt-profile-menu.component.ts:organizationChange`, `projects/ui-kit-v2/src/lib/components/profile-menu/rt-profile-menu.model.ts:IRtProfileMenu`; scenario `SC-UKV-859`
- **The password change shows only when the application turns it on.** — `projects/ui-kit-v2/src/lib/components/profile-menu/rt-profile-menu.component.ts:passwordChange`; scenario `SC-UKV-860`
- **The language select shows only with a non-empty list of languages,** — `projects/ui-kit-v2/src/lib/components/profile-menu/rt-profile-menu.component.ts:locales`; scenario `SC-UKV-860`
- **The theme switch changes the theme through the kit theme service, and its icon shows the theme it switches to.** — `projects/ui-kit-v2/src/lib/components/profile-menu/rt-profile-menu.component.ts:onToggleTheme`, `projects/ui-kit-v2/src/lib/components/profile-menu/rt-profile-menu.component.ts:themeIcon`; scenario `SC-UKV-861`
- **The sign-out goes out by a press and can be made unavailable by the application.** — `projects/ui-kit-v2/src/lib/components/profile-menu/rt-profile-menu.component.ts:signOutDisabled`; scenario `SC-UKV-862`
- **Every caption is a kit label with an English default and the consumer's translation.** — `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts:RT_KIT_LABELS_EN`, `projects/ui-kit-v2/.storybook/showcase-labels.ru.ts:RT_KIT_LABELS_RU`; scenario `SC-UKV-857`
