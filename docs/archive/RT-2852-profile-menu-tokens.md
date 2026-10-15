# Grill

## The owner request

> чини

Сказано о меню профиля в шапке админки, которое открывалось без панели. Меню профиля перенесено в
кит задачей RT-2842 (#2851). Её PR влит, когда шаг «Style layer» его прогона 38684495426 был
красным.

## What the tree already has

- `node tools/check-tokens-styles.mjs` на `main` находит 5 расхождений в
  `projects/ui-kit-v2/src/lib/components/profile-menu/rt-profile-menu.component.scss`: рамка и
  скругление панели, аватара и значка темы берут общие токены напрямую.
- Соседи — `rt-page-header`, панель навигации — задают рамку и скругление токенами своего
  компонента.

## Decisions

- **Заведены токены компонента с прежними значениями**: `--rt-profile-menu-border-width`,
  `--rt-profile-menu-radius`, `--rt-profile-avatar-border-width`, `--rt-profile-avatar-radius`,
  `--rt-profile-theme-icon-radius`. Вид меню не меняется. Отвергнуто: внести расхождения в список
  принятых — список только сокращается.
