# `rt-workspace`

Трёхколоночный рабочий стол: список, карточка, панель подробностей. Колонки тянутся мышью и
клавиатурой, ширины запоминаются.

```html
<rt-workspace storageKey="inbox" [hasActive]="!!active()" (backClicked)="clearActive()">
    <ng-template rtWorkspaceList let-api><rt-thread-list … /></ng-template>
    <ng-template rtWorkspaceCenter><app-card /></ng-template>
    <ng-template rtWorkspaceAside><rt-workspace-details … /></ng-template>
</rt-workspace>
```

| вход                                                    | тип                | умолчание       |
| ------------------------------------------------------- | ------------------ | --------------- |
| `storageKey`                                            | `string \| null`   | `null`          |
| `hasActive`                                             | `boolean`          | `false`         |
| `listMinWidth` / `listMaxWidth` / `listDefaultWidth`    | `number \| string` | 240 / 480 / 320 |
| `asideMinWidth` / `asideMaxWidth` / `asideDefaultWidth` | `number \| string` | 280 / 560 / 360 |
| `centerMinWidth`                                        | `number \| string` | 360             |

Выход: `backClicked`. API панели: `openAside()`, `closeAside()`, `toggleAside()`,
`toggleAsideCollapsed()`, сигналы `asideOpen()`, `asideCollapsed()`, `listWidth()`, `asideWidth()`.

## Главное, что нужно знать

**Без `storageKey` ширины не запоминаются.** С ключом они переживают пересоздание компонента:
раскладку рабочего стола настраивают один раз, и сбрасывать её на каждом заходе было бы хуже.

**Ручки — полноценные разделители**: `role="separator"`, в таб-порядке, стрелки двигают их с
шагом 16px, двойной клик возвращает умолчание. Текущая ширина и границы объявлены через
`aria-valuenow/min/max`.

**Стрелки у правой ручки работают зеркально**: `ArrowLeft` расширяет панель подробностей, потому
что она растёт влево.

## Края

- Ширина всегда зажимается в границы — и при перетаскивании, и с клавиатуры.
- На узком экране появляется полоса с кнопками «назад» и «подробности» (только при `hasActive`);
  «назад» закрывает панель подробностей и поднимает событие.
- `asideCollapsed` — это «свернуть на широком экране», `asideOpen` — «показать на узком».

## Рядом

- [`rt-workspace-details`](../workspace-details/CONTEXT.md) — типовое наполнение правой панели.
- Проверки: [`rt-workspace.component.spec.ts`](./rt-workspace.component.spec.ts).
