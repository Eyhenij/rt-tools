---
name: entity-aside
kind: pattern
rule: entity-conventions
description: Pattern of rule entity-conventions. Load when assembling or editing the record create-and-edit panel — the ready-made route in the ro outlet, inheriting the shared base, runMutation, the unsaved edits guard, header and footer, leaving for a linked record. Not for the store — pattern entity-store.
---
<!-- rt-kit v0.25.0 · patterns/entity-aside.md · ffb4aa896d57 · правится надстройкой, не здесь -->

# The record edit panel

Pattern of the rule `entity-conventions`. What must be true — the law
`docs/constitution/entity-editing.md`.

## When to use

- A panel that creates and edits a record is created or edited.
- A panel without a record appears — table settings, an event feed.

## The panel is declared by a route in the `ro` outlet

```typescript
{
    path: 'booking/:id',
    outlet: 'ro',
    component: BookingDetailAsideComponent,
}
```

This way the panel survives a reload, is passed by link and lands in the browser history. There
is no programmatic opening through a service in the admin.

**The opening command goes from the current route, not from the root.** The outlet is declared
inside the domain's routes, so the screen calls the opening relative to itself:

```typescript
void this.#router.navigate([{ outlets: { ro: [EDIT_PATH, id] } }], { relativeTo: this.#route });
```

Without the current route the command goes to the application root: the panel does not open,
there is no exception, the browser output is clean — the miss is seen only by eye and only by
whoever opened this screen. Its second half is quieter: the panel base closes it against the
parent of the current route, and a panel opened from the root does not close at all.

A panel opened from the header is declared as a constant and mixed into the `children` of every
domain branch — the outlet stands in the chrome template, and the chrome is put on by the
`shell` of every domain:

```typescript
export const ACTIVITY_ASIDE_ROUTES: Route[] = [{ path: 'activity', outlet: 'ro', component: ActivityFeedAsideComponent }];
```

## The screen inherits the shared base

`RtRouteAsideComponent<T>` holds `entity`, `entityId`, `isCreateMode`, `submitting`,
`resolving`, `submitError`, opening the panel by route, leaving the address and the whole
mechanics of saving. Names from the base are not renamed: `booking`, `feed`, `slug` instead of
`entity` break the very uniformity the base was set up for.

## Saving goes through `runMutation`

```typescript
protected save(): void {
    if (!this.canSave()) {
        return;
    }

    this.runMutation(this.#store.save(this.#draft()), {
        successKey: 'promoCodeSaved',
        errorText: (): string => this.#store.errorKey() ?? 'promoCodeSaveFailed',
        closeOnSuccess: true,
    });
}
```

The busy state, clearing the previous error, the success toast and closing the panel are held by
the base. `errorText` is a function: the reason of the refusal is known only after it. The
mutation stream must give a value or an error — an empty stream freezes the panel forever.

## The unsaved-edits guard

Set by the panel itself, and it stands on all four closing paths: the button in the header, the
button in the footer, a press outside the panel and Esc.

```typescript
protected readonly panelForm: Signal<NgForm | undefined> = viewChild(NgForm);
protected readonly formPristine: Signal<boolean> = this.pristineSignal(
    computed((): AbstractControl | undefined => this.panelForm()?.control)
);

constructor() {
    super();
    this.guardUnsavedChanges({ pristine: this.formPristine, save: (): void => this.save() });
}
```

Angular does not accept `viewChild` on a `#` field — the field is declared `protected`.

## Header and footer

```html
<<prefix>-aside-header [title]="title()" [overline]="overline()" [loading]="resolving()" (dismiss)="onClose()">
    <ng-container asideActions>
        <!-- domain actions as icons; more than two — under one menu button -->
    </ng-container>
</<prefix>-aside-header>
```

The title names the action, the record name goes as the overline. The footer has two zones and no
more than two buttons: `asideDismiss` — closing, `asidePrimary` — saving. Domain verbs do not go
into the footer: confirming, rejecting, unpublishing — icons in the header.

The button captions are fixed, the panel does not choose them:

| Button                             | Caption                                           |
| ---------------------------------- | ------------------------------------------------- |
| saving on create                   | «Создать»                                         |
| saving on edit                     | «Сохранить»                                       |
| closing a panel that saves         | «Закрыть и не сохранять» (`uiCloseWithoutSaving`) |
| closing a view-only panel          | «Закрыть»                                         |

The save button stands at the edge opposite the close button, and while the request runs it
shows a spinner and cannot be pressed: the busy state comes from the base's `submitting()`, the
panel keeps no flag of its own. The header and the footer stay in place on scroll — only the
content zone scrolls.

## Leaving for a related record

```html
<a rtElem="related" qa-dataid="promo-code-property-link" [href]="propertyHref()" (click)="openProperty($event)">
    {{ 'propertyOpenLink' | transloco }} <<prefix>-icon name="arrow-right" size="sm" />
</a>
```

The address is given by `relatedUrl(commands)`, the leaving — by `openRelated(commands)`.
`routerLink` is no good here: the directive navigates itself, `preventDefault` does not stop it,
and it bypasses the question about unsaved edits.

## Common misses

- An own `router.navigate` in the panel: absolute commands change only the primary branch, the
  outlet stays in the address, and the router rejects the navigation silently.
- Skeletons by `busy()`, not by `resolving()`: `busy` includes saving too, and on save the fields
  would turn into skeletons.
- An own "not found" on the panel: a record that is not found leaves the address by the base's
  own means.
- Own spacing on top of the shared base: it gives different field widths on different panels and
  cuts off the focus outline at the edge of the scroll area.
- A panel that stays open after success did not reset pristineness (`markAsPristine`) — the
  question about edits is asked right after saving.
- Disabled inputs instead of data: a record that is only viewed is shown by the kit's ready-made
  property list — `<prefix>-detail-list`, `<prefix>-info-item`. Own markup on `<dl>` goes last
  and only as a one-off deviation: it is the departure from the shared look, and the owner
  decides it — a list that puts it first teaches to bypass the ready-made before asking.

## Кнопка футера, которой в каком-то состоянии быть не должно

Раздел этого дерева. Кнопки доходят до зон футера проекцией по атрибуту, и условный блок вокруг
такой кнопки её теряет: узел внутри `@if` до слота не доходит вовсе, и в футере остаётся одна
соседняя кнопка. Ни сборка, ни линтер условного блока не судят — видно это только на собранном
экране, и нашёл это сквозной прогон, а не спека компонента.

Поэтому кнопка не прячется, а отключается:

```html
<button rt-button asidePrimary qa-dataid="invite-create-submit" type="button" [label]="submitLabel" [disabled]="issued() !== null" (click)="submit()"></button>
```

Отключённая кнопка при этом остаётся ответом на вопрос «что здесь можно сделать»: пропавшая
после удачной записи, она читается как поломка разметки.

## Запись, которую только смотрят

Раздел этого дерева. Панель подробностей ничего не правит: свойства записи она показывает
готовым из кита, а не своей разметкой. Рукописного списка определений здесь не бывает — `<dl>`
не знает ни о ширине полей, ни о скелетонах чтения, и правится он в каждой панели отдельно.

Собрана панель тремя частями кита: раздел `rt-aside-section` со своим заголовком, список
свойств `rt-detail-list` и строка `rt-detail-row` — название, значение проекцией и скелетон на
время чтения.

```html
<rt-aside-section>
    <rt-detail-list>
        <rt-detail-row qa-dataid="postmortem-tree" [label]="treeLabel" [loading]="reading()">
            {{ entity()?.tree?.name }}
        </rt-detail-row>
    </rt-detail-list>
</rt-aside-section>

@if (!reading() && entity(); as record) {
    <rt-aside-section [heading]="textLabel">
        <pre rtElem="text" qa-dataid="postmortem-text">{{ record.text }}</pre>
    </rt-aside-section>
}
```

Признак чтения приходит от асайда входом и уходит в каждую строку: скелетон рисует строка кита,
а `rt-skeleton-wrapper` руками не оборачивается. Вход записи при этом принимает и пустоту —
пока чтение идёт, записи ещё нет вовсе, а названия свойств уже стоят на месте.

Раздел, показывающий содержимое записи, на время чтения скрывается целиком: прежнее
содержимое принадлежит прежней записи, а слово «этого у записи нет» читается человеком как
ответ, которого ещё не было.

Признаков у панели три уровня, и каждый свой: сама панель и её шапка носят метки раздела
(`<раздел>-details-panel`, `<раздел>-details-header`), строка свойства — метку свойства, а
название и значение внутри неё размечает кит (`detail-row-label`, `detail-row-value`). Метка
кита `aside-header` одна на все шторки приложения, и спека, которой нужна шапка именно этой
панели, зацепиться за неё не может.
