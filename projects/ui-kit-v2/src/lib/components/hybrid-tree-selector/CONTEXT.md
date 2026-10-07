# `rt-hybrid-tree-selector`

```html
<rt-hybrid-tree-selector confirm expandControls [selectAll]="false" [nodes]="fields" [(value)]="chosenFields" />
```

Входы и выходы — на странице обзора `Overview.mdx` рядом. Договорённость —
`docs/specs/ui-kit-v2/hybrid-tree-selector/spec.md`.

## Главное, что нужно знать

**Это `rt-tree-selector` с `rt-hybrid-tree` внутри.** Класс наследует `RtTreeSelectorComponent`, берёт
его разметку и стили и ставит флаг `hybrid`. По флагу разметка селектора рисует гибридное дерево
вместо обычного. Панель, черновик, «Применить», поиск и кнопки строки общие: правка селектора
доходит до обоих.

**Поиск не теряет признак `single`.** Отбор по словам копирует отобранную ветку целиком, со всеми
полями узла.

## Края

- Всё, что сказано в `CONTEXT.md` селектора, верно и здесь.
