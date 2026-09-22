# Plan

**Task:** RT-2307 · **Branch:** RT-2307-side-menu-favorite-icons
**Spec:** `docs/specs/ui-kit/side-menu-favorites/spec.md`
**Behaviour:** changes

## Task footprint

| What     | Where                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| Settings | `projects/ui-kit/src/lib/ui-kit/side-menu/settings/rtui-side-menu-settings.service.ts`, its spec                   |
| Markup   | `menu-sub-item/rtui-side-menu-sub-item.component.html`, `favorites/rtui-side-menu-favorites.component.{html,scss}` |
| Exports  | `projects/ui-kit/src/lib/ui-kit/side-menu/public-api.ts`                                                           |
| Showcase | `side-menu/stories/`, the favourites references                                                                    |
| Texts    | `docs/specs/ui-kit/side-menu-favorites/`                                                                           |

## What counts as done

- `provideRtuiSideMenuSettings({ icons })` sets the glyph and the turn of the remove button and the
  drag handle; one icon can be set without the other;
- without `icons` the remove button draws the trash can `delete`, the handle stays
  `arrows_outward` turned by 90°;
- the service gives the resolved icons out, as it gives the labels;
- the styles hold no fixed turn of the handle;
- the spec holds the rule, the scenarios and the bindings; the favourites references show the trash
  can.

## Stages

### 1. The settings resolve the icons

- **Steps:**
    1. The config gets `icons`, the defaults are the trash can and the turned `arrows_outward`
    2. The service gives out `icons`, merged per icon, a blank glyph counting as absent
    3. The types are exported from the side menu's public entry
- **Readiness sign:** the service spec covers defaults, one icon set, a blank glyph
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit --testFile=side-menu/settings` — all passed

### 2. The buttons draw the resolved icons

- **Steps:**
    1. The remove button draws `icons.remove` with its turn
    2. The handle draws `icons.drag` with its turn, and the styles lose the fixed turn
    3. The component specs cover the default and the set icons
- **Readiness sign:** specs for the three checks of the request pass
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit --testFile=side-menu` — all passed

### 3. The spec and the showcase follow

- **Steps:**
    1. The spec gets the rule, the scenarios and the bindings
    2. A story shows the set icons, and the frames are looked at locally
    3. The favourites references are taken from the runner's frame
- **Readiness sign:** `check:specs` green, the pipeline's visual step green
- **Verified by:** `node tools/check-specs.mjs` — exit 0; the run on the tip — green

## What this work does not do

- Icons of the star button: the request names only the remove button and the handle.
