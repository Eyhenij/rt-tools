import { BlockScrollStrategy, Overlay, OverlayConfig, OverlayRef, PositionStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
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

import { carryThemeScope, materialPresetClassesOf } from '@rt-tools/ui-kit-v2/core';
import { clampWidth, RtResizeHandleComponent } from '@rt-tools/ui-kit-v2/drawer';
import { RtToasterComponent } from '@rt-tools/ui-kit-v2/toast';
import { RtContainerStateService } from './rt-container-state.service';
import {
    RtContainerContentDirective,
    RtContainerHeaderDirective,
    RtContainerLeftSidenavDirective,
    RtContainerRightSidenavDirective,
    RtContainerToolbarCenterDirective,
    RtContainerToolbarLeftDirective,
    RtContainerToolbarRightDirective,
} from './rt-container.markers';

/** Запас поверх длительности transition'а для страховочного таймера. */
const ASIDE_TRANSITION_BUFFER_MS: number = 80;

const BEM_BLOCK: string = 'rt-container';

const OVERLAY_OPEN_CLASS: string = 'rt-aside-overlay--open';

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
                                if (event.key !== 'Escape' || !this.rightOpen()) {
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

            const overlayRef: OverlayRef = this.#createRightOverlay(pane, backdrop);
            this.#overlayRef = overlayRef;
            this.#overlayRefSignal.set(overlayRef);

            if (untracked(this.rightOpen)) {
                this.#showOverlay(overlayRef);
                this.#renderer.addClass(overlayRef.overlayElement, OVERLAY_OPEN_CLASS);
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
        if (this.rightMode() === 'side') {
            this.#openSide();
            return;
        }

        const overlayRef: OverlayRef | null = this.#overlayRef;
        if (overlayRef === null) {
            return;
        }

        this.#showOverlay(overlayRef);

        // Slide-in: на следующий paint добавляем --open.
        requestAnimationFrame((): void => {
            this.#renderer.addClass(overlayRef.overlayElement, OVERLAY_OPEN_CLASS);
            this.#listenTransitionEnd(overlayRef.overlayElement, 'transform', (): void => this.rightOpened.emit());
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

        this.#renderer.removeClass(overlayRef.overlayElement, OVERLAY_OPEN_CLASS);
        this.#renderer.addClass(overlayRef.overlayElement, 'rt-aside-overlay--leaving');

        const backdropEl: HTMLElement | null = overlayRef.backdropElement;
        if (backdropEl !== null) {
            this.#renderer.removeClass(backdropEl, 'rt-aside-backdrop--visible');
        }

        this.#listenTransitionEnd(overlayRef.overlayElement, 'transform', (): void => {
            this.#setScrollBlocked(false);
            // Объявления на узле возвращаются только после ухода: поставленные сразу, они
            // обрывают затухание подложки на первом же кадре.
            this.#hideBackdrop(overlayRef);
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
        requestAnimationFrame((): void => this.#afterSideTransition((): void => this.rightOpened.emit()));
    }

    #closeSide(): void {
        if (!this.rightOpen()) {
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
        this.#listenTransitionEnd(cell, 'inline-size', callback);
    }

    /** Открытый вид оверлея без перехода: подложка видна, страница замирает, если подложка есть. */
    #showOverlay(overlayRef: OverlayRef): void {
        // Коробка постоянная и лежит в конце страницы, а кусок темы вокруг контейнера мог смениться.
        carryThemeScope(overlayRef.overlayElement, this.#host.nativeElement);

        this.#renderer.removeClass(overlayRef.overlayElement, 'rt-aside-overlay--entering');
        this.#renderer.removeClass(overlayRef.overlayElement, 'rt-aside-overlay--leaving');

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

    /**
     * Подложка закрытой панели: невидима и нажатий не ловит.
     *
     * Стилями этого не сделать. Правила кита живут в слое каскада, а CDK кладёт свои прямо на
     * страницу, вне слоя, — и `.cdk-overlay-backdrop-showing { opacity: 1 }` выигрывает у нашего
     * `opacity: 0` независимо от специфичности: неслоевое правило сильнее слоевого всегда.
     * Подложка при этом висит поверх страницы во весь экран — прозрачная и перехватывающая
     * нажатия, а панель ещё не открывали. Объявление на самом узле сильнее обоих правил.
     *
     * Держится это ровно до открытия: там объявления снимаются, и дальше видом подложки
     * заведуют классы.
     */
    #hideBackdrop(overlayRef: OverlayRef): void {
        const backdropEl: HTMLElement | null = overlayRef.backdropElement;

        if (backdropEl === null) {
            return;
        }

        this.#renderer.setStyle(backdropEl, 'opacity', '0');
        this.#renderer.setStyle(backdropEl, 'pointer-events', 'none');
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
                'rt-aside-overlay--entering',
                ...materialPresetClassesOf(this.#host.nativeElement),
            ],
            disposeOnNavigation: false,
        };

        const overlayRef: OverlayRef = this.#overlay.create(overlayConfig);
        const portal: TemplatePortal = new TemplatePortal(tpl, this.#vcr);
        overlayRef.attach(portal);
        this.#hideBackdrop(overlayRef);

        // Backdrop-click / ESC подписки объявлены один раз в конструкторе —
        // здесь только эмит созданного OverlayRef (см. #rightOverlaySource-стрим).
        this.#rightOverlaySource.next(overlayRef);

        return overlayRef;
    }

    // Слушаем окончание одного свойства: на узле могут анимироваться и другие (opacity
    // backdrop'а, например) — это даст ложные срабатывания.
    #listenTransitionEnd(element: HTMLElement, property: string, callback: () => void): void {
        // Нет анимации (reduced-motion / `transition: none`) → `transitionend` не
        // придёт; teardown-callback (навигация `ro:null`) отрабатываем синхронно.
        const durationMs: number = this.#transitionDurationMs(element);
        if (durationMs === 0) {
            callback();
            return;
        }

        // settled-гард делает transitionend и fallback-таймаут взаимно
        // идемпотентными — сработает и снимет listener только то, что раньше.
        let settled: boolean = false;

        const handler: (event: TransitionEvent) => void = (event: TransitionEvent): void => {
            if (event.propertyName !== property || event.target !== element || settled) {
                return;
            }
            settled = true;
            element.removeEventListener('transitionend', handler);
            callback();
        };
        element.addEventListener('transitionend', handler);

        // Страховка на случай пропущенного `transitionend` (лаг рендера).
        setTimeout((): void => {
            if (settled) {
                return;
            }
            settled = true;
            element.removeEventListener('transitionend', handler);
            callback();
        }, durationMs + ASIDE_TRANSITION_BUFFER_MS);
    }

    // Максимальная длительность transition'а элемента в мс; `0` если анимации нет.
    #transitionDurationMs(element: HTMLElement): number {
        const durationCss: string | undefined = this.#window?.getComputedStyle(element).transitionDuration;
        if (durationCss === undefined || durationCss === '') {
            return 0;
        }
        const maxSeconds: number = durationCss.split(',').reduce((max: number, part: string): number => {
            const trimmed: string = part.trim();
            const seconds: number = trimmed.endsWith('ms') ? Number.parseFloat(trimmed) / 1000 : Number.parseFloat(trimmed);
            return Number.isNaN(seconds) ? max : Math.max(max, seconds);
        }, 0);
        return maxSeconds * 1000;
    }
}
