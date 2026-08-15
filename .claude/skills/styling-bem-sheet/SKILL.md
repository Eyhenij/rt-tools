---
name: styling-bem-sheet
kind: pattern
rule: styling-bem
description: Паттерн правила styling-bem. Брать при заведении или правке шторки, окна и полноэкранного просмотра поверх страницы — чем открывается, что передаётся внутрь, как приезжает снизу, чем проверяется. Не брать для панели правки записи в админке — это паттерн entity-aside.
---
<!-- rt-kit v0.8.2 · patterns/styling-bem-sheet.md · a23793ee6b49 · правится надстройкой, не здесь -->

# Шторка и окно поверх страницы

Паттерн правила `styling-bem`. Что при этом должно быть верно — закон
`docs/constitution/frontend-application.md`.

## Когда брать

- На телефоне заводится шторка: выбор языка, валюты, дат.
- Заводится окно или полноэкранный просмотр поверх страницы.
- Шторку или окно что-то перекрывает, и хочется поднять им `z-index`.

Панель правки записи в админке — это другое: там маршрут в своём аутлете, паттерн
`entity-aside`.

## Открывает служба, а не разметка рядом с кнопкой

Компонент шторки — обычный элемент разметки. Он рисуется там, где написан, поэтому его
`z-index` сравнивается только с соседями по этому месту. Липкая шапка размывает фон под собой —
и всё, что написано внутри шапки, замкнуто в её слой.

Открывает шторку служба окон кита — тем же вызовом открывается полноэкранный просмотр.
Разметка уезжает к `<body>`, и сравнивать её становится не с чем.

```typescript
readonly #dialog: RtDialogService = inject(RtDialogService);

readonly #sheetOpenedSource: Subject<RtDialogRef<string>> = new Subject<RtDialogRef<string>>();
#sheetRef: RtDialogRef<string> | null = null;

protected openLocalePicker(): void {
    if (this.#sheetRef) {
        return;
    }

    const data: ILocalePickerData = { locales: this.locales, value: this.currentLocale };
    const ref: RtDialogRef<string> = this.#dialog.open<LocalePickerComponent, ILocalePickerData, string>(
        LocalePickerComponent,
        { data, panelClass: 'locale-picker-panel', backdropClass: 'locale-picker-backdrop' }
    );
    this.#sheetRef = ref;
    this.#sheetOpenedSource.next(ref);
}
```

Ответ шторки ждут подпиской из конструктора — подписываться в методе запрещает
`angular-patterns`:

```typescript
this.#sheetOpenedSource
    .pipe(
        mergeMap((ref: RtDialogRef<string>): Observable<string | undefined> => ref.afterClosed()),
        takeUntilDestroyed(this.#destroyRef)
    )
    .subscribe((code: string | undefined): void => {
        this.#sheetRef = null;
        if (code) {
            this.onLocaleChange(code);
        }
    });
```

Ссылку обнуляют здесь, а не в обработчике кнопки: шторку закрывают ещё жестом вниз и нажатием
мимо, и оба пути идут мимо кнопки.

## Внутри шторки — только она сама

Что показать, приходит токеном. Что выбрали, уходит вместе с закрытием. Своей кнопки у шторки
нет: кнопку держит тот, кто шторку открывает.

```typescript
export interface ILocalePickerData {
    readonly locales: readonly ISiteLocale[];
    readonly value: string;
}

readonly #data: ILocalePickerData = inject<ILocalePickerData>(RT_DIALOG_DATA);
readonly #dialogRef: RtDialogRef<string> = inject<RtDialogRef<string>>(RtDialogRef);

protected confirm(): void {
    this.#dialogRef.close(this.centeredLocale());
}

/** Закрыли, не подтвердив: значит, передумали — значение не меняем */
protected onOpenChange(open: boolean): void {
    this.open.set(open);
    if (!open) {
        this.#dialogRef.close();
    }
}
```

## Шторка приезжает снизу

Служба поднимает её сразу открытой, и анимировать киту нечего: вместо движения гость видит
подмену экрана. Поэтому открывают её на кадр позже:

```typescript
protected readonly open: WritableSignal<boolean> = signal<boolean>(false);

constructor() {
    afterNextRender((): void => {
        this.open.set(true);
    });
}
```

`afterNextRender`, а не `ngAfterViewInit`: страницу отдаёт сервер, и разметка появляется позже.

## Подложка

Шторка сама затемняет фон и сама ловит нажатие мимо. Подложка окна поверх неё дала бы второе
затемнение — фон стал бы вдвое темнее, чем у соседней шторки. Поэтому её делают прозрачной.
Правило пишут в общий слой приложения: шторка уехала к `<body>`, и файл стилей компонента до
неё не достаёт.

```scss
/* общий слой приложения; имя класса несёт приставку дерева */
.locale-picker-backdrop {
    background: transparent;
}
```

Нажатие она ловит по-прежнему — закрытие по ней делает само окно.

## Чем проверяется

Скриншот тут не поможет: перекрытая шторка выглядит целой, а сборка и линт молчат. Спрашивают
точку — кому достанется нажатие:

```javascript
const rect = button.getBoundingClientRect();
document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
```

Ответом должна быть сама кнопка. Мерить надо на стенде из прод-сборки и на узком экране —
паттерн `browser-verification-measure`.

В сквозном тесте перед замером дожидаются, пока шторка доедет: видимая кнопка ещё может
двигаться, и координаты через кадр будут другими.

```typescript
await page.locator('[qa-dataid="locale-picker-sheet"] [qa-dataid="bottom-sheet-panel"]').evaluate(
    (panel: Element): Promise<void> =>
        new Promise<void>((resolve: () => void): void => {
            if (panel.getBoundingClientRect().bottom <= window.innerHeight) {
                resolve();

                return;
            }
            panel.addEventListener('transitionend', (): void => resolve(), { once: true });
        })
);
```

## Частые промахи

- **Шторка написана рядом со своей кнопкой в шапке.** Шапка размывает фон, и шторка замкнута в
  её слой. Так нижняя панель накрыла шторку вместе с кнопкой подтверждения, и значение на
  телефоне стало не сменить.
- **Шапке подняли номер слоя.** Дефект уходит, шторка остаётся замкнутой в чужой слой:
  следующий сосед с номером повыше накроет её снова.
- **Шторку перенесли в другое место разметки.** То же самое: заработает, пока над новым местом
  никто не поставит `transform`, `filter` или свой `z-index`.
- **Правило подложки положили в стили компонента.** Подложка уехала к `<body>`, и правило до
  неё не достаёт — писать надо в общий слой приложения.
- **Ссылку на открытую шторку обнулили в обработчике кнопки.** Закрытие жестом и нажатием мимо
  идёт мимо него, и второй раз шторка уже не откроется.
- **Тест померил сразу после проверки видимости.** Шторка ещё едет, `elementFromPoint`
  возвращает `null`, и тест краснеет на исправном коде.
- **Образец искали по именам библиотеки, поверх которой собран кит.** Она лежит внутри кита, её
  имён в дереве нет — искать надо по именам кита.
