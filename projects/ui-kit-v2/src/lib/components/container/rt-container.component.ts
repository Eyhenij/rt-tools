import { BlockScrollStrategy, Overlay, OverlayConfig, OverlayRef, PositionStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    ModelSignal,
    numberAttribute,
    OutputEmitterRef,
    Renderer2,
    RendererFactory2,
    Signal,
    TemplateRef,
    ViewContainerRef,
    ViewEncapsulation,
    WritableSignal,
    afterNextRender,
    computed,
    contentChild,
    effect,
    inject,
    input,
    model,
    output,
    signal,
    untracked,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtAsideSheet } from '@rt-tools/ui-kit-v2/aside';
import { BreakpointsService, carryThemeScope, materialPresetClassesOf } from '@rt-tools/ui-kit-v2/core';
import { clampWidth, listenTransitionEnd, RtResizeHandleComponent } from '@rt-tools/ui-kit-v2/drawer';
import { RtToasterComponent } from '@rt-tools/ui-kit-v2/toast';
import { rtHideBackdrop } from './rt-container-overlay';
import { RT_OVERLAY_ENTERING_CLASS, RT_OVERLAY_LEAVING_CLASS, RT_OVERLAY_OPEN_CLASS, RtContainerSheetDriver } from './rt-container-sheet';
import { RtContainerStateService } from './rt-container-state.service';
import { rtMarkPlaceRoot } from './rt-place-root.logic';
import {
    RtContainerContentDirective,
    RtContainerHeaderDirective,
    RtContainerLeftSidenavDirective,
    RtContainerRightSidenavDirective,
    RtContainerToolbarCenterDirective,
    RtContainerToolbarLeftDirective,
    RtContainerToolbarRightDirective,
} from './rt-container.markers';

const BEM_BLOCK: string = 'rt-container';

/** Пределы ширины правой панели по умолчанию, в пикселях. */
const RIGHT_MIN_WIDTH: number = 240;

const RIGHT_MAX_WIDTH: number = 960;

/** Где стоит правая панель: поверх страницы в оверлее или колонкой рядом с содержимым. */
export type TRtContainerRightMode = 'over' | 'side';

/**
 * Multi-slot container с CSS-grid layout. Slot consumers wrap content в
 * `*rtContainerXxx` structural directives, контейнер подхватывает шаблоны через
 * `contentChild(..., { read: TemplateRef })` + рендерит через `*ngTemplateOutlet`.
 *
 * Slots: `header`, `leftSidenav`, `toolbarLeft/Center/Right`, `content` — живут в
 * CSS-grid. `rightSidenav` по умолчанию (`rightMode="over"`) рендерится через CDK Overlay
 * поверх grid'а (slide-in side-sheet) — overlay переиспользует глобальные
 * `rt-aside-overlay` / `rt-aside-backdrop` классы из rt-aside, чтобы анимация и
 * backdrop вели себя идентично программно открываемым asides. С `rightMode="side"` та же
 * панель стоит колонкой справа от содержимого и сужает его; режим переключается на ходу,
 * и при переключении содержимое панели создаётся заново на новом месте.
 *
 * На телефоне (окно до 480 точек) правая панель в обоих режимах открывается шторкой кита во всю
 * высоту: вид выбирается при каждом открытии и держится до закрытия, переход к другой записи в
 * открытой панели вид не меняет. Шторка всегда затемняет страницу — `rightBackdrop` к ней не
 * относится, — а ширина и ручка ширины в ней не рисуются.
 *
 * Ширину правой панели задаёт `rightWidth` (без него — по содержимому), а с `rightResizable`
 * у её левого края стоит ручка: ширину тянут указателем и двигают стрелками.
 *
 * Driver-directives (`[rtContainerLeftSidenavPanel/RightSidenavPanel]`) общаются с
 * контейнером через `RtContainerStateService` (для левой docked) и через
 * `openRight()/closeRight()` + lifecycle outputs (для правой overlay).
 */
@Component({
    selector: 'rt-container',
    templateUrl: './rt-container.component.html',
    styleUrls: ['./rt-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,

        // standalone components / directives
        RtToasterComponent,
        RtResizeHandleComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    providers: [RtContainerStateService],
    host: {
        class: BEM_BLOCK,
        '[class.rt-container--mobile-left-bottom]': "mobileLeftNav() === 'bottom'",
        '[class.rt-container--viewport]': "height() === 'viewport'",
        '[class.rt-container--right-side]': "rightMode() === 'side' && rightSidenavTpl() !== undefined",
        '[class.rt-container--right-sheet]': 'rightSheetActive()',
    },
})
export class RtContainerComponent {
    readonly #overlay: Overlay = inject(Overlay);
    readonly #host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #vcr: ViewContainerRef = inject(ViewContainerRef);
    readonly #scrollStrategies: ScrollStrategyOptions = inject(ScrollStrategyOptions);
    readonly #blockScroll: BlockScrollStrategy = this.#scrollStrategies.block();
    readonly #renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);
    readonly #window: Window | null = inject(DOCUMENT).defaultView;
    readonly #phone: Signal<boolean> = inject(BreakpointsService).phone;
    /** Вид правой панели на телефоне; его же панель в слоте читает через маркер слота. */
    readonly #rightSheet: RtAsideSheet = inject(RtContainerStateService).rightSheet;
    readonly #sheetDriver: RtContainerSheetDriver = new RtContainerSheetDriver(this.#rightSheet, this.#renderer, this.#window);

    readonly #rightOverlaySource: Subject<OverlayRef> = new Subject<OverlayRef>();

    #overlayRef: OverlayRef | null = null;

    /** Страница замерла под подложкой: снимается ровно то, что было поставлено. */
    #scrollBlocked: boolean = false;

    readonly #overlayRefSignal: WritableSignal<OverlayRef | null> = signal<OverlayRef | null>(null);

    protected readonly headerTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtContainerHeaderDirective, {
        read: TemplateRef,
    });

    protected readonly leftSidenavTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtContainerLeftSidenavDirective, {
        read: TemplateRef,
    });

    protected readonly rightSidenavTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtContainerRightSidenavDirective, {
        read: TemplateRef,
    });

    protected readonly toolbarLeftTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtContainerToolbarLeftDirective, {
        read: TemplateRef,
    });

    protected readonly toolbarCenterTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtContainerToolbarCenterDirective, {
        read: TemplateRef,
    });

    protected readonly toolbarRightTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtContainerToolbarRightDirective, {
        read: TemplateRef,
    });

    protected readonly contentTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtContainerContentDirective, {
        read: TemplateRef,
    });

    /** Обёртка правой панели — ширина и ручка; ставится и в оверлей, и в колонку сетки. */
    protected readonly rightPaneTpl: Signal<TemplateRef<unknown> | undefined> = viewChild('rightPane', { read: TemplateRef });

    protected readonly rightCell: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('rightCell');

    /** Правая панель открыта шторкой телефона: ширина, ручка и колонка рядом с содержимым ей не нужны. */
    protected readonly rightSheetActive: Signal<boolean> = this.#rightSheet.active;

    /** Ручку тянут: колонка панели гасит переход ширины. */
    protected readonly rightResizing: WritableSignal<boolean> = signal(false);

    /** Ширина, которую рисует правая панель: вход в пределах, или `null` — по содержимому. */
    protected readonly rightShownWidth: Signal<number | null> = computed((): number | null => {
        const width: number | null = this.rightWidth();

        return width === null ? null : clampWidth(width, this.rightMinWidth(), this.rightMaxWidth());
    });

    /**
     * Поведение левого sidenav на мобилке (<=768px): `keep` — остаётся боковой
     * колонкой (по умолчанию, десктоп-стиль); `bottom` — сворачивается в нижний
     * ряд grid'а (таб-бар), контент занимает всю ширину и скроллится над ним.
     */
    public readonly mobileLeftNav: InputSignal<'keep' | 'bottom'> = input<'keep' | 'bottom'>('keep');

    /**
     * Высота контейнера: `auto` — растёт под контент, скроллится документ (по
     * умолчанию; на этом держится sticky-хедер); `viewport` — контейнер жёстко
     * равен вьюпорту, страница не скроллится вовсе, а скроллятся зоны внутри —
     * каждая сама по себе (app-shell раскладка, напр. чаты бот-панели).
     */
    public readonly height: InputSignal<'auto' | 'viewport'> = input<'auto' | 'viewport'>('auto');

    /** `over` — правая панель поверх страницы (по умолчанию), `side` — колонкой рядом с содержимым. */
    public readonly rightMode: InputSignal<TRtContainerRightMode> = input<TRtContainerRightMode>('over');

    /** Подложка под правой панелью в режиме `over`. Без неё страница остаётся доступной и не замирает. */
    public readonly rightBackdrop: InputSignalWithTransform<boolean, unknown> = input(true, { transform: booleanAttribute });

    /** Ширина правой панели в пикселях; `null` — по содержимому, как прежде. Ручка пишет сюда. */
    public readonly rightWidth: ModelSignal<number | null> = model<number | null>(null);

    /** Ручка ширины у левого края правой панели. */
    public readonly rightResizable: InputSignalWithTransform<boolean, unknown> = input(false, { transform: booleanAttribute });

    public readonly rightMinWidth: InputSignalWithTransform<number, unknown> = input(RIGHT_MIN_WIDTH, { transform: numberAttribute });

    public readonly rightMaxWidth: InputSignalWithTransform<number, unknown> = input(RIGHT_MAX_WIDTH, { transform: numberAttribute });

    public readonly backdropClick: OutputEmitterRef<void> = output<void>();

    public readonly rightOpened: OutputEmitterRef<void> = output<void>();

    public readonly rightClosed: OutputEmitterRef<void> = output<void>();

    public readonly rightOpen: WritableSignal<boolean> = signal<boolean>(false);

    /**
     * `true` когда правой панели есть где открыться: в режиме `over` — CDK Overlay создан и
     * attache'нут (см. effect в constructor'е), в режиме `side` — шаблон панели объявлен.
     * Дёргать panel.open() из консьюмера можно только когда это true — иначе openRight()
     * видит null overlayRef и early-return'ит, --entering modifier остаётся, панель остаётся за
     * экраном. Re-exposed на driver через `panel.ready` для удобства route-driven dialog'ов.
     */
    public readonly rightOverlayReady: Signal<boolean> = computed((): boolean =>
        this.rightMode() === 'side' ? this.rightSidenavTpl() !== undefined : this.#overlayRefSignal() !== null
    );

    constructor() {
        // Контейнер — место страницы: узкий вид кита считается от его ширины. Боковая панель
        // приложения рядом сужает его, а окно остаётся прежним. Место объявляется в браузере
        // после первой отрисовки и снимается вместе с контейнером.
        const breakpoints: BreakpointsService = inject(BreakpointsService);
        const destroyRef: DestroyRef = inject(DestroyRef);
        // Класс на корне ставится сразу, до первой отрисовки: по нему стили снимают запасной
        // порог по окну, и первый кадр не берёт пороги окна вместо порогов места.
        destroyRef.onDestroy(rtMarkPlaceRoot(this.#host.nativeElement));
        afterNextRender((): void => {
            destroyRef.onDestroy(breakpoints.registerPlace(this.#host.nativeElement));
        });

        // Backdrop-click / ESC подписки правого overlay живут в одном
        // конструкторном стриме: #createRightOverlay эмитит созданный OverlayRef,
        // switchMap переключается на его event-стримы (предыдущий overlay к этому
        // моменту уже dispose'нут effect-cleanup'ом; `detachments()` терминирует
        // внутренний поток при dispose).
        this.#rightOverlaySource
            .pipe(
                switchMap((overlayRef: OverlayRef): Observable<() => void> =>
                    merge(
                        overlayRef.backdropClick().pipe(map((): (() => void) => (): void => this.backdropClick.emit())),
                        overlayRef.keydownEvents().pipe(
                            map((event: KeyboardEvent): (() => void) => (): void => {
                                // Escape шторки телефона ведёт сама шторка: она знает, верхняя ли она.
                                if (event.key !== 'Escape' || !this.rightOpen() || this.#rightSheet.active()) {
                                    return;
                                }
                                event.preventDefault();
                                this.backdropClick.emit();
                            })
                        )
                    ).pipe(takeUntil(overlayRef.detachments()))
                ),
                takeUntilDestroyed()
            )
            .subscribe((handleCloseIntent: () => void): void => handleCloseIntent());

        // Жест закрытия шторки телефона для драйвера — та же отмена, что подложка и Escape панели.
        this.#rightSheet
            .closeRequests()
            .pipe(takeUntilDestroyed())
            .subscribe((): void => this.backdropClick.emit());

        // Persistent overlay: создаётся при появлении rightSidenavTpl и живёт
        // до уничтожения rt-container'а. Это нужно чтобы <router-outlet name="ro">
        // внутри slot template'а материализовался и мог активировать route.
        // Без auto-attach landmine: route не активируется → driver не вызывается
        // → ничего не открывается (chicken-and-egg).
        // Смена режима или подложки пересоздаёт overlay; открытая панель остаётся открытой на
        // новом месте без повторного `rightOpened`.
        effect((onCleanup: (cleanup: () => void) => void): void => {
            const tpl: TemplateRef<unknown> | undefined = this.rightSidenavTpl();
            const pane: TemplateRef<unknown> | undefined = this.rightPaneTpl();
            const over: boolean = this.rightMode() === 'over';
            const backdrop: boolean = this.rightBackdrop();

            if (tpl === undefined || pane === undefined || !over || this.#overlayRef !== null) {
                return;
            }

            // Чтения сигналов шаблоном, отрисованным при создании, — не повод пересоздать оверлей.
            const overlayRef: OverlayRef = untracked((): OverlayRef => this.#createRightOverlay(pane, backdrop));
            this.#overlayRef = overlayRef;
            this.#overlayRefSignal.set(overlayRef);

            if (untracked(this.rightOpen)) {
                this.#showOverlay(overlayRef);
                this.#renderer.addClass(overlayRef.overlayElement, RT_OVERLAY_OPEN_CLASS);
            }

            onCleanup((): void => {
                this.#setScrollBlocked(false);
                overlayRef.dispose();
                this.#overlayRef = null;
                this.#overlayRefSignal.set(null);
            });
        });
    }

    public openRight(): void {
        const sheet: boolean = this.#sheetDriver.choose(!this.rightOpen(), this.#phone());

        if (this.rightMode() === 'side') {
            this.#openSide();
            return;
        }

        const overlayRef: OverlayRef | null = this.#overlayRef;
        if (overlayRef === null) {
            return;
        }

        if (sheet) {
            carryThemeScope(overlayRef.overlayElement, this.#host.nativeElement);
            this.rightOpen.set(true);
            this.#sheetDriver.openOverlay(overlayRef.overlayElement, (): void => this.rightOpened.emit());
            return;
        }

        this.#sheetDriver.leaveOverlay(overlayRef.overlayElement);
        this.#showOverlay(overlayRef);

        // Slide-in: на следующий paint добавляем --open.
        requestAnimationFrame((): void => {
            this.#renderer.addClass(overlayRef.overlayElement, RT_OVERLAY_OPEN_CLASS);
            listenTransitionEnd(this.#window, overlayRef.overlayElement, 'transform', (): void => this.rightOpened.emit());
        });

        this.rightOpen.set(true);
    }

    public closeRight(): void {
        if (this.rightMode() === 'side') {
            this.#closeSide();
            return;
        }

        const overlayRef: OverlayRef | null = this.#overlayRef;
        if (overlayRef === null || !this.rightOpen()) {
            return;
        }

        if (this.#rightSheet.active()) {
            this.#sheetDriver.lower(overlayRef.overlayElement, (): void => {
                this.#sheetDriver.closeOverlay(overlayRef.overlayElement);
                this.rightOpen.set(false);
                this.rightClosed.emit();
            });
            return;
        }

        this.#renderer.removeClass(overlayRef.overlayElement, RT_OVERLAY_OPEN_CLASS);
        this.#renderer.addClass(overlayRef.overlayElement, RT_OVERLAY_LEAVING_CLASS);

        const backdropEl: HTMLElement | null = overlayRef.backdropElement;
        if (backdropEl !== null) {
            this.#renderer.removeClass(backdropEl, 'rt-aside-backdrop--visible');
        }

        listenTransitionEnd(this.#window, overlayRef.overlayElement, 'transform', (): void => {
            this.#setScrollBlocked(false);
            // Объявления на узле возвращаются только после ухода: поставленные сразу, они
            // обрывают затухание подложки на первом же кадре.
            rtHideBackdrop(this.#renderer, overlayRef);
            this.rightOpen.set(false);
            this.rightClosed.emit();
        });
    }

    protected onRightWidth(width: number): void {
        this.rightWidth.set(width);
    }

    /** Колонка рядом с содержимым: открытие — это ширина колонки, оверлея здесь нет. */
    #openSide(): void {
        if (this.rightOpen()) {
            return;
        }
        this.rightOpen.set(true);
        if (this.#rightSheet.active()) {
            requestAnimationFrame((): void =>
                this.#sheetDriver.raise(this.rightCell()?.nativeElement ?? null, (): void => this.rightOpened.emit())
            );
            return;
        }
        requestAnimationFrame((): void => this.#afterSideTransition((): void => this.rightOpened.emit()));
    }

    #closeSide(): void {
        if (!this.rightOpen()) {
            return;
        }
        if (this.#rightSheet.active()) {
            this.#sheetDriver.lower(this.rightCell()?.nativeElement ?? null, (): void => {
                this.rightOpen.set(false);
                this.rightClosed.emit();
            });
            return;
        }
        this.rightOpen.set(false);
        this.#afterSideTransition((): void => this.rightClosed.emit());
    }

    #afterSideTransition(callback: () => void): void {
        const cell: HTMLElement | undefined = this.rightCell()?.nativeElement;

        if (cell === undefined) {
            callback();
            return;
        }
        listenTransitionEnd(this.#window, cell, 'inline-size', callback);
    }

    /** Открытый вид оверлея без перехода: подложка видна, страница замирает, если подложка есть. */
    #showOverlay(overlayRef: OverlayRef): void {
        // Коробка постоянная и лежит в конце страницы, а кусок темы вокруг контейнера мог смениться.
        carryThemeScope(overlayRef.overlayElement, this.#host.nativeElement);

        this.#renderer.removeClass(overlayRef.overlayElement, RT_OVERLAY_ENTERING_CLASS);
        this.#renderer.removeClass(overlayRef.overlayElement, RT_OVERLAY_LEAVING_CLASS);

        const backdropEl: HTMLElement | null = overlayRef.backdropElement;
        if (backdropEl !== null) {
            this.#setScrollBlocked(true);
            this.#renderer.addClass(backdropEl, 'rt-aside-backdrop--visible');
            this.#renderer.removeStyle(backdropEl, 'opacity');
            this.#renderer.removeStyle(backdropEl, 'pointer-events');
        }
    }

    #setScrollBlocked(blocked: boolean): void {
        if (blocked === this.#scrollBlocked) {
            return;
        }
        this.#scrollBlocked = blocked;
        if (blocked) {
            this.#blockScroll.enable();
        } else {
            this.#blockScroll.disable();
        }
    }

    #createRightOverlay(tpl: TemplateRef<unknown>, hasBackdrop: boolean): OverlayRef {
        const positionStrategy: PositionStrategy = this.#overlay.position().global().right('0').top('0');

        const overlayConfig: OverlayConfig = {
            positionStrategy,
            hasBackdrop,
            // noop здесь, scroll-block управляется вручную через #blockScroll
            // в openRight/closeRight — иначе scroll заблокирован всегда
            // (overlay persistent), пока aside ещё не открыт.
            scrollStrategy: this.#overlay.scrollStrategies.noop(),
            backdropClass: 'rt-aside-backdrop',
            panelClass: [
                'rt-aside-overlay',
                'rt-aside-overlay--position-right',
                RT_OVERLAY_ENTERING_CLASS,
                ...materialPresetClassesOf(this.#host.nativeElement),
            ],
            disposeOnNavigation: false,
        };

        const overlayRef: OverlayRef = this.#overlay.create(overlayConfig);
        const portal: TemplatePortal = new TemplatePortal(tpl, this.#vcr);
        overlayRef.attach(portal);
        rtHideBackdrop(this.#renderer, overlayRef);

        // Backdrop-click / ESC подписки объявлены один раз в конструкторе —
        // здесь только эмит созданного OverlayRef (см. #rightOverlaySource-стрим).
        this.#rightOverlaySource.next(overlayRef);

        return overlayRef;
    }
}
