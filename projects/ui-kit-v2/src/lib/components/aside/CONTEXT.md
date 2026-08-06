# `rt-aside` + `RtAsideService`

Панель, выезжающая сбоку поверх страницы. Открывается **сервисом**, а не разметкой.

```typescript
readonly #aside: RtAsideService = inject(RtAsideService);

const ref: RtAsideRef<ITour> = this.#aside.open(TourCardComponent, { data: tour, position: 'right' });
ref.afterClosed().subscribe((result?: ITour): void => …);
```

```html
<!-- внутри поднятого компонента -->
<rt-aside size="md" ariaLabel="Карточка тура">
    <rt-aside-header title="Тур в Сочи" />
    <rt-aside-section heading="Клиент">…</rt-aside-section>
    <rt-aside-footer>…</rt-aside-footer>
</rt-aside>
```

| вход `rt-aside` | тип                    | умолчание   |
| --------------- | ---------------------- | ----------- |
| `size`          | `'sm' \| 'md' \| 'lg'` | `'md'`      |
| `contentLayout` | `'default' \| 'tabs'`  | `'default'` |
| `width`         | `string \| null`       | `null`      |
| `ariaLabel`     | `string \| null`       | `null`      |

| настройка `open()`                       | умолчание                                 |
| ---------------------------------------- | ----------------------------------------- |
| `data`                                   | `null` — доезжает токеном `RT_ASIDE_DATA` |
| `position`                               | `'right'`                                 |
| `closeOnBackdropClick` / `closeOnEscape` | `true`                                    |
| `backdropClass` / `panelClass`           | `rt-aside-backdrop` / `rt-aside-overlay`  |

## Главное, что нужно знать

**Асайд объявлен `role="complementary"`, а не диалогом.** Он не модален: страница за ним
остаётся видна, и это осознанный выбор — карточку смотрят, не теряя список.

**Закрытие двухтактное.** `close(result)` отдаёт результат **сразу**, а панель убирает через
200 мс — чтобы доиграла анимация ухода. В тестах это значит: подписчик получил значение, а
`.rt-aside-overlay` ещё в документе. Повторный `close()` игнорируется.

**`disableClose`** на `RtAsideRef` держит панель под кликом по подложке и под Escape — ставится
самим содержимым, когда в форме есть несохранённое.

## Рядом

- [`rt-aside-section`](../aside-section/CONTEXT.md) — раздел внутри.
- [`rt-bottom-sheet`](../bottom-sheet/CONTEXT.md) — то же на узком экране.
- [`rt-dialog`](../dialog/CONTEXT.md) — когда нужна именно модальность.
