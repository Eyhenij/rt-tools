# Grill

## The owner request

> это запрос из апки по миграции с первого кита на второй, там используется материальный вид

> проанализируй, важно правки не должны сломать второй кит

> делай не так как просят а так как лучше

The consumer's items 36–39: padding and background properties of the scroll area's header, body
and footer; colour, padding, gap, font-size and weight properties of the action bar and the
colours of its menu.

## What the tree already has

- The scroll area writes its paddings as steps in place and has no background of its own.
- The action bar reads its background and text colour from the inverse surface directly; its
  paddings, gaps, font size and weights are steps in place.
- The menu of an action with a list opens in an overlay. It reads `--rt-action-bar-menu-radius`
  and `--rt-action-bar-menu-shadow`, declared on the bar: the overlay lives outside the bar, so
  the menu draws without its rounding and shadow today. No story shows the open menu.
- The first kit declares `--rt-action-bar-action-padding` and `--rt-action-bar-action-font-weight`
  on its own bar.

## Decisions

- **The new properties are declared on the block with today's values.** Without them every frame
  stays as it is.
- **The menu reads its properties with a fallback in place.** A declaration on the bar does not
  reach the overlay; the fallback is today's intended value, so the menu gets back its rounding
  and shadow. An application sets the menu properties on the page root.
- **The action properties are `--rt-action-bar-action-padding-block`, `-padding-inline` and
  `--rt-action-bar-action-weight`.** The requested names are taken by the first kit, and the
  tokens graph check refuses a shared name.
- **A story shows the open menu.** Without it the restored rounding and shadow are seen by no
  frame.

## Decisions along the way

- The bar's own hover tint and close icon colour now follow `--rt-action-bar-color`, so a recoloured bar keeps a readable close icon and hover; the default is the same inverse text.
- The menu properties are consumer handles read with a fallback; their kit defaults for rounding and shadow live in private `-default` properties on the menu, because the token check refuses a direct step as a fallback on those families.
- The host background of the scroll area stands under `:where()`: the side menu uses scroll areas as its own elements with a surface background, and an equal-strength host rule took it away — the first snapshot run showed every side menu frame diverged. With zero specificity any class rule wins.
- Snapshots: three written (scroll area Properties, action bar Properties and Menu); the 744 former frames matched after the fix.
- The radius contract stripped only flat `var()` references, and the menu's nested reference read as an off-scale literal. It now strips references from the inside out, and its negative half names the nested case.
