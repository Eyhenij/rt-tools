# `rt-tabs` + `[rtTab]`

Вкладки объявляются директивой на `<ng-template>` — содержимое неактивной вкладки не создаётся.

```html
<rt-tabs stretch [activeId]="tab()" (activeIdChange)="tab.set($event)">
    <ng-template rtTab="main" label="Основное">…</ng-template>
    <ng-template rtTab="extra" label="Дополнительно" [badge]="3">…</ng-template>
    <ng-template rtTab="docs" label="Документы" icon="file" [invalid]="hasErrors()">…</ng-template>
</rt-tabs>
```

## `rt-tabs`

| вход                | тип                          | умолчание      |
| ------------------- | ---------------------------- | -------------- |
| `activeId`          | `IRtTabs.Id \| null`         | `null`         |
| `direction`         | `'horizontal' \| 'vertical'` | `'horizontal'` |
| `stretch`           | `boolean`                    | `false`        |
| `contentScrollable` | `boolean`                    | `true`         |

Выход: `activeIdChange: IRtTabs.Id`.

## `[rtTab]`

| вход                              | тип                                           | умолчание                   |
| --------------------------------- | --------------------------------------------- | --------------------------- |
| `rtTab`                           | `IRtTabs.Id` — идентификатор вкладки          | `''`                        |
| `label`                           | `string`                                      | `''`                        |
| `titleTemplate`                   | `TemplateRef \| null`                         | `null`                      |
| `icon` / `iconColor`              | `IRtIcon.Name \| null` / `IRtTabs.TitleColor` | `null` / `'current'`        |
| `badge`                           | `string \| number \| null`                    | `null`                      |
| `disabled` / `hidden` / `invalid` | `boolean`                                     | `false`                     |
| `invalidMessage`                  | `string`                                      | `''` → `rtKit.uiTabInvalid` |

## Главное, что нужно знать

**Вход `activeId` необязателен.** Без него компонент помнит выбор сам — управляемый режим нужен
только когда вкладка лежит в адресе страницы.

**Идентификатор, которого нет, откатывается на первую доступную вкладку.** То же с отключённой:
активной она стать не может. Так вкладка из старой ссылки не оставляет пустой экран.

## Клавиатура и доступность

- Стрелки (влево/вправо, а в вертикальной раскладке вверх/вниз) перешагивают отключённые вкладки
  и заворачиваются по кругу; `Home`/`End` — к первой и последней.
- В таб-порядке стоит **только активная** вкладка (`tabindex="0"`), остальные достаются стрелками.
- Панель и вкладка связаны в обе стороны: `aria-controls` ↔ `aria-labelledby`.

## Края

- `hidden` убирает вкладку из шапки целиком; `disabled` оставляет её видимой, но некликабельной.
- У невалидной вкладки появляется подсказка с текстом `invalidMessage`.
- Стрелки прокрутки шапки есть в разметке всегда — показывает их модификатор `--visible`,
  который выставляется по замеру ширины после отрисовки.

## Проверки

[`rt-tabs.component.spec.ts`](./rt-tabs.component.spec.ts).
