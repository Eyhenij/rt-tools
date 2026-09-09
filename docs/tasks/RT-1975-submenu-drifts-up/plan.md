# Plan

**Task:** RT-1975 · **Branch:** RT-1975-submenu-drifts-up
**Spec:** `docs/specs/ui-kit/`
**Behaviour:** changes

## Task footprint

| What  | Where                                            |
| ----- | ------------------------------------------------ |
| Specs | `docs/specs/ui-kit/`                             |
| Rules | `.claude/skills/styling-bem/`                    |
| Code  | `projects/ui-kit/src/lib/ui-kit/side-menu/menu/` |

## What counts as done

- Контейнер `mat-drawer-container.rtui-sub-side-menu` не прокручиваем: `scrollHeight` равен `clientHeight`.
- Обход курсором всех пунктов первого уровня оставляет верх подменю на нуле.
- Ширина, положение и перетаскивание ширины подменю не изменились, в закреплённом режиме тоже.
- Активный пункт подменю по-прежнему подводится в видимую часть своего списка.

## Stages

### 1. Снять перебивку раскладки

- **What is done:** из `.rtui-sub-side-menu-content` убрано `position: relative`, Material расставляет шторку своим `absolute`.
- **Readiness sign:** правило `position` в блоке отсутствует, причина записана рядом.
- **Verified by:** `pnpm exec nx build @rt-tools/ui-kit` — сборка зелёная.

### 2. Прогон и проверка в браузере

- **What is done:** юниты пакета зелёные, витрина показывает обе раскладки подменю — выдвижную и закреплённую.
- **Readiness sign:** прокрутка контейнера нулевая при обходе пунктов; перетаскивание ширины работает.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit --testFile=projects/ui-kit/src/lib/ui-kit/side-menu/menu/rtui-side-menu.component.spec.ts` — зелёный.

## What this work does not do

- Не трогает `RtScrollToElementDirective`: она делает то, для чего написана.
- Не меняет `mode` шторки: в закреплённом режиме `side` остаётся верным.
