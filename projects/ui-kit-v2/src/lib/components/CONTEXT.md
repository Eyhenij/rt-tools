# Компоненты `@rt-tools/ui-kit-v2`

72 семейства, каждое — своя директория с одинаковым устройством:

```
tag/
  index.ts                  # баррель семейства
  rt-tag.component.ts       # компонент
  rt-tag.component.html
  rt-tag.component.scss
  rt-tag.model.ts           # неймспейс IRtTag с union-типами входов
  rt-tag.component.spec.ts  # проверки
  CONTEXT.md                # контракт, края, чем отличается от соседей
  stories/                  # витрина
```

**У каждого семейства есть свой CONTEXT.md** — читать надо его, а не этот файл: здесь только
карта и то, что верно для всех.

## Что верно для всех компонентов

- **Селектор `rt-*`**, `OnPush`, только сигнальные входы и выходы (`input()` / `output()`), без
  `@Input`/`@Output`.
- **Разметка размечена BEM-директивами** `rtBlock` / `rtElem` / `[rtMod]` из `@rt-tools/core`.
  Модификатор `{ severity: 'info' }` даёт класс `rt-tag--severity--info`, булев `{ closable: true }` —
  `rt-tag--closable`, камелкейс превращается в дефис (`hasIndicator` → `--has-indicator`).
- **Точки для проверок помечены `qa-dataid`** — по нему компонент находят и спеки, и e2e.
- **Подписи, которые кит рисует сам**, живут в неймспейсе `rtKit` и приходят через
  `provideRtKitLabels()`. Свой текст почти везде перебивает переведённый; пустая строка
  равна отсутствию входа.
- **Цвета и размеры — только токены `--rt-*`**, ни одного HEX в компонентных стилях.

## Карта

| задача                   | компонент                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| иконка, кольцо, заглушка | `icon`, `spinner`, `skeleton`, `skeleton-wrapper`                                                                                 |
| статус, счётчик, метка   | `tag`, `live-badge`, `info-item`, `stat-tile`, `delta-view`                                                                       |
| кнопки                   | `button` (директива), `icon-button`, `split-button`, `toggle-button-group`                                                        |
| поля ввода               | `input`, `textarea`, `input-number`, `counter`, `checkbox`, `toggle-switch`, `date-picker`, `file-input`, `rich-editor`           |
| списки выбора            | `select`, `multiselect`, `autocomplete`, `filter-control`                                                                         |
| обёртка поля             | `field`, `form-control` (основа)                                                                                                  |
| плавающие панели         | `popover`, `tooltip`, `confirm-popover`, `menu`, `toast`                                                                          |
| окна и панели            | `dialog`, `aside`, `aside-section`, `bottom-sheet`, `welcome-dialog`, `photo-viewer`                                              |
| каркас страницы          | `container`, `workspace`, `workspace-details`, `header`, `page-header`, `toolbar`, `section-nav`                                  |
| данные                   | `table`, `pagination`, `thread-list`, `detail-list`, `money-list`, `bar-list`, `timeline`, `night-grid`, `calendar`               |
| переписка                | `chat`, `message`, `message-composer`                                                                                             |
| файлы                    | `file-card`, `file-list`, `file-drop`, `download-link`                                                                            |
| прочее                   | `card`, `note`, `empty-state`, `tabs`, `stepper`, `logo`, `theme-toggle`, `notifications-bell`, `collapsible-text`, `counter-row` |
