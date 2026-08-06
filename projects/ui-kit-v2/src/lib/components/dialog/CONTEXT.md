# `rt-dialog` + `RtDialogService`

Модальное окно по центру. Открывается **сервисом**, а не разметкой.

```typescript
const ref: RtDialogRef<boolean> = this.#dialog.open(ConfirmComponent, { data: { id }, closeOnEscape: true });
ref.afterClosed().subscribe((ok?: boolean): void => …);
```

```html
<rt-dialog width="360px" ariaLabel="Удаление">
    <rt-dialog-header title="Удалить запись?" />
    <p>Действие необратимо.</p>
    <rt-dialog-footer>…</rt-dialog-footer>
</rt-dialog>
```

| вход `rt-dialog` | тип                    | умолчание                             |
| ---------------- | ---------------------- | ------------------------------------- |
| `size`           | `'sm' \| 'md' \| 'lg'` | `'md'`                                |
| `width`          | `string \| null`       | `null` (свойство `--rt-dialog-width`) |
| `ariaLabel`      | `string \| null`       | `null`                                |

| вход `rt-dialog-header` | тип       | умолчание      |
| ----------------------- | --------- | -------------- |
| `title`                 | `string`  | **обязателен** |
| `closable`              | `boolean` | `true`         |

| настройка `open()`                       | умолчание                                  |
| ---------------------------------------- | ------------------------------------------ |
| `data`                                   | `null` — доезжает токеном `RT_DIALOG_DATA` |
| `closeOnBackdropClick` / `closeOnEscape` | `true`                                     |
| `backdropClass` / `panelClass`           | `rt-dialog-backdrop` / `rt-dialog-overlay` |

## Главное, что нужно знать

**Прокрутка страницы блокируется на время диалога** (`scrollStrategies.block()`), а окно
объявлено `role="dialog"` с `aria-modal="true"`.

`RtDialogRef.disableClose` держит окно и под кликом по подложке, и под Escape — ставится самим
содержимым, когда закрывать нельзя.

**Крестик в шапке ищет `RtDialogRef` необязательным инжектом.** Поэтому `rt-dialog-header` можно
поставить и вне диалога — нажатие просто ничего не сделает, а не упадёт.

## Рядом

- [`rt-aside`](../aside/CONTEXT.md) — немодальная панель сбоку.
- [`[rtConfirm]`](../confirm-popover/CONTEXT.md) — подтверждение без модалки.
- [`rt-welcome-dialog`](../welcome-dialog/CONTEXT.md) — готовое приветственное окно.
- Проверки: [`rt-dialog.component.spec.ts`](./rt-dialog.component.spec.ts).
