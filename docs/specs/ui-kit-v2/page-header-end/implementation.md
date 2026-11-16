# What it is carried out by — the right group of the page header

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **The slot buttons and the profile stand in one group at the right edge, 8 apart, in the order of the markup.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.html:header-end`, `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.scss:__end`; scenario `SC-UKV-1304`
- **The bell draws any kit icon given by its `icon` input, `bell` by default.** — `projects/ui-kit-v2/src/lib/components/notifications-bell/rt-notifications-bell.component.ts:icon`; scenario `SC-UKV-1306`
- **Up to 768 inclusive the profile button shows only the `user` icon.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.scss:__user-icon`, `projects/ui-kit-v2/src/lib/components/page-header/user/rt-page-header-user.component.html:user-icon`; scenario `SC-UKV-1305`
- **The profile button is named by the user's name.** — `projects/ui-kit-v2/src/lib/components/page-header/user/rt-page-header-user.component.html:aria-label`; scenario `SC-UKV-1305`
- **A chat with `fill` shrinks under the strip above it in a flex column.** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.scss:min-block-size`; scenario `SC-UKV-1307`
