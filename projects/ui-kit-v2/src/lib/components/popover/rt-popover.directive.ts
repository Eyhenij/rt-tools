import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    OnDestroy,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    TemplateRef,
    ViewContainerRef,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Observable, Subject, switchMap, take } from 'rxjs';

import { BreakpointsService, carryThemeScope, materialPresetClassesOf } from '@rt-tools/ui-kit-v2/core';
import { rtPopoverCloseIntents } from './rt-popover-intents.logic';
import { rtBindPopoverHoverBridge } from './rt-popover-hover.logic';
import { rtIsNestedOverlay } from './rt-popover-nested.logic';
import { IRtPopoverOverlay, rtCreatePopoverOverlay } from './rt-popover-overlay.logic';
import { RtPopoverSheetOptionsDirective } from './rt-popover-sheet-options.directive';
import { rtPopoverDefaultPositions, rtPopoverSizeByWidth } from './rt-popover-position.logic';
import { IRtPopoverSheetOpened, rtClosePopoverSheet, rtOpenPopoverSheet, rtPopoverSheetDismissals } from './rt-popover-sheet.helper';
import { RT_POPOVER_SHEET } from './rt-popover-sheet.token';
import { IRtPopover } from './rt-popover.model';

const HOVER_CLOSE_DELAY_MS: number = 100;

/**
 * Переиспользуемый popover-примитив поверх CDK Overlay. Привязывает плавающую
 * панель (`<ng-template>`) к host-элементу. Движок — CDK Overlay
 * (`flexibleConnectedTo`): авто-flip у края viewport, reposition при скролле,
 * outside-click и Escape закрытие из коробки — без ручного `position: absolute`
 * в `:host` (тот резался `overflow: hidden` предками: таблицы, aside, карточки).
 *
 * Триггеры:
 * - `click` (default) — toggle по клику на host; outside-click закрывает.
 * - `hover` — открытие на `mouseenter`, закрытие с grace-периодом на `mouseleave`
 *   (наведение на панель удерживает её открытой). Наведение судится только мышиное:
 *   касание и перо открывают панель нажатием.
 * - `manual` — авто-listener'ы не вешаются; host сам зовёт `open()/close()`.
 *   Используется form-control'ами с собственным жестом (autocomplete — открытие
 *   по набору текста).
 *
 * `open()/close()/toggle()/isOpen()` публичны во ВСЕХ режимах — `trigger` лишь
 * определяет авто-listener'ы. `width: 'trigger'` синхронизирует ширину панели с
 * host'ом (dropdown'ы), `'trigger-min'` не даёт панели стать уже host'а и дальше пускает
 * её по содержимому, `'auto'` — content-sized (тултипы).
 */
@Directive({
    selector: '[rtPopover]',
    exportAs: 'rtPopover',
    hostDirectives: [
        {
            directive: RtPopoverSheetOptionsDirective,
            inputs: ['rtPopoverSheetFull', 'rtPopoverSheetAction', 'rtPopoverSheetUnsaved', 'rtPopoverSheetHeader', 'rtPopoverSheetFooter'],
            outputs: ['rtPopoverSheetApply'],
        },
    ],
    host: {
        '(click)': 'onHostClick()',
        '(pointerenter)': 'onHostPointerEnter($event)',
        '(mouseenter)': 'onHostMouseEnter()',
        '(mouseleave)': 'onHostMouseLeave($event)',
    },
})
export class RtPopoverDirective implements OnDestroy {
    readonly #overlay: Overlay = inject(Overlay);
    readonly #elementRef: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
    /** Входы шторки: полная высота, действие в шапке, неприменённый выбор — в директиве рядом. */
    readonly #sheetOptions: RtPopoverSheetOptionsDirective = inject(RtPopoverSheetOptionsDirective, { self: true });
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #injector: Injector = inject(Injector);
    readonly #narrow: Signal<boolean> = inject(BreakpointsService).phone;
    readonly #sheetAllowed: boolean = inject(RT_POPOVER_SHEET);

    readonly #overlayCreatedSource: Subject<OverlayRef> = new Subject<OverlayRef>();
    readonly #sheetCreatedSource: Subject<IRtPopoverSheetOpened> = new Subject<IRtPopoverSheetOpened>();
    readonly #sheetLeavingSource: Subject<IRtPopoverSheetOpened> = new Subject<IRtPopoverSheetOpened>();

    #overlayRef: OverlayRef | null = null;
    #sheet: IRtPopoverSheetOpened | null = null;
    #positionStrategy: FlexibleConnectedPositionStrategy | null = null;
    #hoverCloseTimer: ReturnType<typeof setTimeout> | null = null;

    /**
     * Чем пришёл последний указатель — на host или на панель. Касание браузер дублирует
     * событиями мыши: наведение от него открывало меню профиля, нажатие того же касания
     * падало на подложку и закрывало меню, а повторное наведение после снятия подложки
     * открывало его снова. Указатель приходит раньше своих событий мыши, поэтому по нему
     * наведение от касания и пера отличается от мышиного.
     */
    #pointerType: string = 'mouse';

    protected readonly isOpenState: WritableSignal<boolean> = signal<boolean>(false);

    /** Панель открыта в шторке: берётся в минуту открытия, и порог ширины не меняет открытую панель. */
    protected readonly openedInSheetState: WritableSignal<boolean> = signal<boolean>(false);
    /** Шторка закрыта и уезжает вниз: её содержимое ещё на экране. */
    protected readonly sheetLeavingState: WritableSignal<boolean> = signal<boolean>(false);

    public readonly template: InputSignal<TemplateRef<unknown> | null> = input<TemplateRef<unknown> | null>(null, { alias: 'rtPopover' });

    public readonly trigger: InputSignal<IRtPopover.Trigger> = input<IRtPopover.Trigger>('click', {
        alias: 'rtPopoverTrigger',
    });

    public readonly width: InputSignal<IRtPopover.Width> = input<IRtPopover.Width>('auto', {
        alias: 'rtPopoverWidth',
    });

    /** `end` — панель прижата к правому краю host'а (триггеры у правого края viewport). */
    public readonly align: InputSignal<IRtPopover.Align> = input<IRtPopover.Align>('start', {
        alias: 'rtPopoverAlign',
    });

    /**
     * Панель обязана уместиться во вьюпорт: не влезающая по ширине сдвигается от
     * края экрана внутрь, не влезающая по высоте ужимается до свободного места под
     * триггером, и содержимое в ней прокручивается.
     *
     * По умолчанию выключено: панель стоит ровно там, куда её ставит привязка к
     * триггеру, даже если часть её ушла за экран. Включать там, где панель широкая
     * или высокая настолько, что привязка сама по себе её не удерживает, — иначе
     * пункты навигации остаются за краем экрана и недостижимы.
     */
    public readonly fitViewport: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        alias: 'rtPopoverFitViewport',
        transform: booleanAttribute,
    });

    public readonly context: InputSignal<unknown> = input<unknown>(null, {
        alias: 'rtPopoverContext',
    });

    public readonly panelClass: InputSignal<string> = input<string>('', {
        alias: 'rtPopoverPanelClass',
    });

    /**
     * Класс подложки под панелью. Пусто — подложки нет, и страница рядом с панелью остаётся
     * открытой. Заданный ставит подложку на весь экран: её вид задаёт класс, а нажатие по ней
     * закрывает панель так же, как нажатие снаружи. Читается при первом открытии.
     */
    public readonly backdropClass: InputSignal<string> = input<string>('', {
        alias: 'rtPopoverBackdropClass',
    });

    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        alias: 'rtPopoverDisabled',
        transform: booleanAttribute,
    });

    public readonly offsetY: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(4, {
        alias: 'rtPopoverOffsetY',
        transform: numberAttribute,
    });

    public readonly offsetX: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(0, {
        alias: 'rtPopoverOffsetX',
        transform: numberAttribute,
    });

    /**
     * Узел, от которого панель меряет своё место и ширину. `null` — сам host. Поле даты и периода
     * отдаёт свой корень: панель встаёт по краю поля, а не по кнопке календаря внутри него.
     * Читается при первом открытии.
     */
    public readonly origin: InputSignal<HTMLElement | null> = input<HTMLElement | null>(null, { alias: 'rtPopoverOrigin' });

    /**
     * Свои места панели вокруг host'а: первое главное, остальные — запасные у края экрана. `null` —
     * прежние два: под host'ом и над ним. Заданные читаются при каждом открытии.
     */
    public readonly positions: InputSignal<readonly ConnectedPosition[] | null> = input<readonly ConnectedPosition[] | null>(null, {
        alias: 'rtPopoverPositions',
    });

    /**
     * Режим шторки: на узком экране панель открывается в нижней шторке кита, а не у host'а. Выключен
     * по умолчанию — его включают компоненты, у которых панель служит выбором (списки, меню, отборы);
     * подсказкам и подтверждениям шторка не нужна. На широком экране вход ничего не меняет.
     */
    public readonly sheet: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        alias: 'rtPopoverSheet',
        transform: booleanAttribute,
    });

    /** Заголовок шторки — подпись поля или доступное имя контрола. Пусто — шторка без заголовка. */
    public readonly sheetTitle: InputSignal<string | null> = input<string | null>('', {
        alias: 'rtPopoverSheetTitle',
    });

    /**
     * Панель откроется (или открыта) в шторке: режим включён входом и токеном `RT_POPOVER_SHEET`, а
     * экран узкий. Открытая панель остаётся там, где открылась, даже если экран пересёк порог:
     * `close()` убирает и шторку, и панель у триггера.
     */
    public readonly inSheet: Signal<boolean> = computed((): boolean => this.sheet() && this.#sheetAllowed && this.#narrow());

    /**
     * Панель открыта в шторке — именно та, что открылась, а не та, что открылась бы сейчас. Читать надо
     * его, а не `inSheet`: экран мог пересечь порог при открытой панели, и живой `inSheet` убрал бы
     * поиск из открытой шторки или добавил второй в панель у триггера.
     */
    public readonly openedInSheet: Signal<boolean> = this.openedInSheetState.asReadonly();

    /**
     * Панель нарисована в шторке: открыта в ней или ещё уезжает вниз после закрытия. По нему панель
     * выбирает свой вид в шторке — карточки, поиск, подвал: по `openedInSheet` вид сменился бы на
     * глазах, пока шторка закрывается. Поведение — фокус, клавиши, закрытие — читает `openedInSheet`.
     */
    public readonly shownInSheet: Signal<boolean> = computed((): boolean => this.openedInSheetState() || this.sheetLeavingState());

    public readonly opened: OutputEmitterRef<void> = output<void>({ alias: 'rtPopoverOpened' });

    /** Шторка открыта и больше не `inert`: с этой минуты в неё можно ставить фокус. Сама панель у триггера его не шлёт. */
    public readonly sheetOpened: OutputEmitterRef<void> = output<void>({ alias: 'rtPopoverSheetOpened' });

    public readonly closed: OutputEmitterRef<void> = output<void>({ alias: 'rtPopoverClosed' });

    public readonly isOpen: Signal<boolean> = this.isOpenState.asReadonly();

    constructor() {
        // Outside-click / ESC подписки на единожды создаваемый overlay живут в
        // одном конструкторном стриме: #ensureOverlay эмитит OverlayRef после
        // создания (ровно один раз за жизнь директивы), стрим живёт до destroy.
        this.#overlayCreatedSource
            .pipe(
                switchMap((overlayRef: OverlayRef): Observable<void> => rtPopoverCloseIntents(overlayRef, this.#elementRef.nativeElement)),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((): void => this.close());

        // Шторка создаётся на каждое открытие: её подложка, ручка и Escape закрывают панель
        // так же, как нажатие снаружи у панели рядом с триггером.
        this.#sheetCreatedSource
            .pipe(
                switchMap((sheet: IRtPopoverSheetOpened): Observable<unknown> => rtPopoverSheetDismissals(sheet)),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((): void => this.close());

        // Закрытая шторка ещё уезжает вниз: признак «нарисована в шторке» снимается, когда её снесли.
        this.#sheetLeavingSource
            .pipe(
                switchMap((sheet: IRtPopoverSheetOpened): Observable<void> => sheet.overlayRef.detachments().pipe(take(1))),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((): void => this.sheetLeavingState.set(false));
    }

    public ngOnDestroy(): void {
        this.#clearHoverTimer();
        this.#disposeOverlay();
    }

    public open(): void {
        if (this.disabled() || this.isOpenState() || this.template() === null) {
            return;
        }
        if (this.inSheet()) {
            this.#openSheet();
            return;
        }
        const overlayRef: OverlayRef = this.#ensureOverlay();
        const positions: readonly ConnectedPosition[] | null = this.positions();
        if (positions !== null) {
            this.#positionStrategy?.withPositions([...positions]);
        }
        overlayRef.updateSize(rtPopoverSizeByWidth(this.width(), this.#anchor().offsetWidth));
        // Тема куска `rtTheme` вокруг host'а едет на коробку панели: панель лежит в конце
        // страницы, и без этого список из тёмной карточки рисовался темой страницы.
        carryThemeScope(overlayRef.overlayElement, this.#elementRef.nativeElement);
        const portal: TemplatePortal<unknown> = new TemplatePortal(this.template() as TemplateRef<unknown>, this.#viewContainerRef, {
            $implicit: this.context(),
        });
        overlayRef.attach(portal);
        this.#releasePaneMinHeight(overlayRef);
        this.isOpenState.set(true);
        this.opened.emit();
    }

    public close(): void {
        if (!this.isOpenState()) {
            return;
        }
        this.#overlayRef?.detach();
        // Шторка уезжает вниз со своим содержимым, и признак «нарисована в шторке» живёт до её сноса.
        const leaving: IRtPopoverSheetOpened | null = this.#sheet;
        if (leaving !== null) {
            this.sheetLeavingState.set(true);
            this.#sheetLeavingSource.next(leaving);
        }
        this.#closeSheet(true);
        this.isOpenState.set(false);
        this.closed.emit();
        // После `closed`: слушатель закрытия ещё видит, в чём панель была открыта.
        this.openedInSheetState.set(false);
    }

    public toggle(): void {
        if (this.isOpenState()) {
            this.close();
        } else {
            this.open();
        }
    }

    // --- авто-triggers (HostListener'ы навешиваются на host безусловно, но
    //     проверяют активный режим — это дешевле, чем условная подписка) ---

    protected onHostClick(): void {
        if (this.disabled()) {
            return;
        }
        if (this.trigger() === 'click') {
            this.toggle();
        }
        // Касанию наведения нет: в режиме hover его заменяет нажатие, и только открывает —
        // закрывают нажатие снаружи и подложка
        if (this.trigger() === 'hover') {
            this.open();
        }
    }

    protected onHostPointerEnter(event: PointerEvent): void {
        this.#pointerType = event.pointerType;
        // Указатель любого типа вернулся к host: закрытие, запланированное уходом мыши, отменяется.
        // Иначе на устройстве с мышью и экраном касания панель гасла бы под пальцем.
        this.#clearHoverTimer();
    }

    protected onHostMouseEnter(): void {
        if (!this.#isMouseHover()) {
            return;
        }
        this.#clearHoverTimer();
        this.open();
    }

    protected onHostMouseLeave(event: MouseEvent): void {
        if (!this.#isMouseHover()) {
            return;
        }
        if (rtIsNestedOverlay(this.#overlayRef?.overlayElement, event.relatedTarget)) {
            return;
        }
        this.#scheduleHoverClose();
    }

    #ensureOverlay(): OverlayRef {
        if (this.#overlayRef !== null) {
            return this.#overlayRef;
        }
        const { overlayRef, positionStrategy }: IRtPopoverOverlay = rtCreatePopoverOverlay({
            overlay: this.#overlay,
            anchor: this.#anchor(),
            positions: rtPopoverDefaultPositions(this.align(), this.offsetX(), this.offsetY()),
            fitViewport: this.fitViewport(),
            offsetY: this.offsetY(),
            backdropClass: this.backdropClass(),
            panelClasses: this.#resolvePanelClasses(),
        });
        this.#positionStrategy = positionStrategy;

        // Мост наведения: панель держится открытой, пока на неё ведёт курсор с host'а.
        rtBindPopoverHoverBridge(overlayRef.overlayElement, {
            pointerEntered: (pointerType: string): void => {
                this.#pointerType = pointerType;
                this.#clearHoverTimer();
            },
            mouseEntered: (): void => {
                if (this.#isMouseHover()) {
                    this.#clearHoverTimer();
                }
            },
            mouseLeft: (relatedTarget: EventTarget | null): void => {
                if (this.#isMouseHover() && !rtIsNestedOverlay(this.#overlayRef?.overlayElement, relatedTarget)) {
                    this.#scheduleHoverClose();
                }
            },
        });

        // Outside-click / ESC подписки объявлены один раз в конструкторе —
        // здесь только эмит созданного OverlayRef (см. #overlayCreatedSource-стрим).
        this.#overlayCreatedSource.next(overlayRef);

        this.#overlayRef = overlayRef;
        return overlayRef;
    }

    /**
     * Порог подгонки остаётся в настройке оверлея и уходит из стиля коробки.
     *
     * CDK читает порог из настройки, когда решает, сдвинуть панель или ужать. Но при `attach` и
     * при каждом `updateSize` он пишет то же число в стиль коробки, и короткая панель
     * растягивалась до порога: под двумя пунктами «Ещё» шапки стояла пустая полоса.
     */
    #releasePaneMinHeight(overlayRef: OverlayRef): void {
        overlayRef.overlayElement.style.minHeight = '';
    }

    /** Узел, по которому панель встаёт и меряет ширину: заданный `rtPopoverOrigin` или сам host. */
    #anchor(): HTMLElement {
        return this.origin() ?? this.#elementRef.nativeElement;
    }

    #resolvePanelClasses(): string[] {
        const base: string = 'rt-popover-panel';
        const extra: string = this.panelClass().trim();
        const preset: string[] = materialPresetClassesOf(this.#elementRef.nativeElement);
        return extra ? [base, ...extra.split(/\s+/), ...preset] : [base, ...preset];
    }

    /**
     * Режим hover и наведение мышью, а не событие мыши, порождённое касанием или пером. Шторку
     * наведение не открывает и уход курсора не закрывает: она открывается нажатием и закрывается
     * своей подложкой, иначе курсор по дороге к шторке гасил бы её.
     */
    #isMouseHover(): boolean {
        return this.trigger() === 'hover' && this.#pointerType === 'mouse' && !this.inSheet();
    }

    #scheduleHoverClose(): void {
        this.#clearHoverTimer();
        this.#hoverCloseTimer = setTimeout((): void => this.close(), HOVER_CLOSE_DELAY_MS);
    }

    #clearHoverTimer(): void {
        if (this.#hoverCloseTimer !== null) {
            clearTimeout(this.#hoverCloseTimer);
            this.#hoverCloseTimer = null;
        }
    }

    /** Открывает панель в нижней шторке — устройство шторки описано у `rtOpenPopoverSheet`. */
    #openSheet(): void {
        const sheet: IRtPopoverSheetOpened = rtOpenPopoverSheet({
            overlay: this.#overlay,
            host: this.#elementRef.nativeElement,
            viewContainerRef: this.#viewContainerRef,
            injector: this.#injector,
            template: this.template() as TemplateRef<unknown>,
            context: this.context(),
            title: this.sheetTitle() ?? '',
            options: this.#sheetOptions,
            panelClasses: this.panelClass()
                .split(/\s+/)
                .filter((name: string): boolean => name !== ''),
            onOpened: (): void => this.sheetOpened.emit(),
        });
        this.#sheetCreatedSource.next(sheet);
        this.#sheet = sheet;
        this.openedInSheetState.set(true);
        this.isOpenState.set(true);
        this.opened.emit();
    }

    /**
     * Закрывает шторку. Закрытие по жесту уводит её вниз и возвращает фокус триггеру, если он был
     * внутри; снос директивы снимает шторку сразу и фокус не трогает.
     */
    #closeSheet(byGesture: boolean = false): void {
        const sheet: IRtPopoverSheetOpened | null = this.#sheet;
        this.#sheet = null;
        if (sheet === null) {
            return;
        }
        if (byGesture) {
            rtClosePopoverSheet(sheet, this.#elementRef.nativeElement);
        } else {
            sheet.overlayRef.dispose();
        }
    }

    #disposeOverlay(): void {
        this.openedInSheetState.set(false);
        this.#overlayRef?.dispose();
        this.#overlayRef = null;
        this.#positionStrategy = null;
        this.#closeSheet();
    }
}
