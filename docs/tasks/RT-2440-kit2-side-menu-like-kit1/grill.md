# Grill

## The owner request

Said on 30 September 2026 while reviewing the side menu port (#2421) against the first kit:

> где фейвориты и мобильный вид?

> почему сторис во втором ките наполнена моками по другому мне сложно оценить

> цветовые темы применяются к меню, смотри как сделан дата лист из первого кита

> сторис во втором ките должен показаьт все состояния чтобы я мог сравнить с первым китом, ты сначала сам сравни как это выглядит в первом и втором китах, в первом ките меню кликабельное!!!

## What the tree already has

- **First kit, stories `Components/SideMenu` and `Components/SideMenu/Favorites`.** A live menu
  the full height of the frame: a header icon, eleven rail sections with icons (Content,
  Settings, Users, Media, Links, Redirects, Add user, Tags, Collections, Test long name with
  nested levels), a profile icon and a «Logout» link at the bottom. Hovering a section slides its
  submenu out over the page with a shadow; search, pin, folders and long titles are all clickable.
  Seventeen menu stories and eleven favorites stories, among them `Mobile`, `Mobile active menu`
  and `Sub menu favorites mobile`. The data lives in
  `projects/ui-kit/src/lib/ui-kit/side-menu/stories/component/test-side-menu-wrapper.component.ts`.
- **First kit, favorites.** Folder `side-menu/favorites`, five files, 749 lines.
- **First kit, colour scheme.** `[data-rt-scheme]` on the root overrides the accent ramps
  `--rt-color-{role}-{N}`, and the menu follows them; the menu story checks it in
  `side-menu.hint-asserts.ts`.
- **Second kit, `rt-side-menu`.** The stories are a matrix of small boxes, about 580 by 385, with
  three Russian placeholder sections, «Лого» and «Профиль» as text. The narrow screen is two
  static halves side by side, not a menu one can open. No favorites: the overview promises them
  «отдельной задачей эпика», and no such task exists.
- **Second kit, colour.** The menu takes its accent from `--rt-color-action-primary-*`. The kit
  has light and dark themes and the material preset, and no colour schemes at all.

## What the rules already say

- `rt-tools-storybook`: every input axis at every value at once; a state invisible in a frame gets
  a story of its own.
- `browser-verification`: work that carries a look over from a sample is accepted by a frame of
  one's own screen next to the sample's frame, looked at before it is shown.
- Memory of the owner's words: every port is shown before a push and a PR; the second kit's ready
  component gets the first kit's look under the material preset; no Material in ported code.

## Questions and answers

**«Цветовые темы применяются к меню, смотри как сделан дата лист» — что именно нужно?**
Меню красится цветовой схемой.

## Decisions

- **Favorites are ported under this task.** The owner asked «где фейвориты» about this very
  port, and the overview already promised them. Rejected: a separate task — the owner reviews the
  menu as one thing.

## What is left unclear

- How far the colour scheme goes: the second kit has no schemes, so the menu alone cannot follow
  one. Asked right after this file is written.
