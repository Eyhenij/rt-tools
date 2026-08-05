import { BlockScrollStrategy, Overlay, OverlayConfig, OverlayRef, PositionStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    InputSignal,
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
    output,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtToasterComponent } from '../toast/rt-toaster.component';
import { RtContainerStateService } from './rt-container-state.service';
import {
    RtContainerContentDirective,
    RtContainerHeaderDirective,
    RtContainerLeftSidenavDirective,
    RtContainerRightSidenavDirective,
    RtContainerToolbarCenterDirective,
    RtContainerToolbarLeftDirective,
    RtContainerToolbarRightDirective,
} from './rt-container.directives';

/** Запас поверх длительности transition'а для страховочного таймера. */
const ASIDE_TRANSITION_BUFFER_MS: number = 80;

const BEM_BLOCK: string = 'rt-container';

/**
 * Multi-slot container с CSS-grid layout. Slot consumers wrap content в
 * `*rtContainerXxx` structural directives, контейнер подхватывает шаблоны через
 * `contentChild(..., { read: TemplateRef })` + рендерит через `*ngTemplateOutlet`.
 *
 * Slots: `header`, `leftSidenav`, `toolbarLeft/Center/Right`, `content` — живут в
 * CSS-grid. `rightSidenav` рендерится через CDK Overlay поверх grid'а (slide-in
 * side-sheet), а не как grid-cell — overlay переиспользует глобальные
 * `rt-aside-overlay` / `rt-aside-backdrop` классы из rt-aside, чтобы анимация и
 * backdrop вели себя идентично программно открываемым asides.
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
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    providers: [RtContainerStateService],
    host: {
        class: BEM_BLOCK,
        '[class.rt-container--mobile-left-bottom]': "mobileLeftNav() === 'bottom'",
        '[class.rt-container--viewport]': "height() === 'viewport'",
    },
})
export class RtContainerComponent {
    readonly #overlay: Overlay = inject(Overlay);
    readonly #vcr: ViewContainerRef = inject(ViewContainerRef);
    readonly #scrollStrategies: ScrollStrategyOptions = inject(ScrollStrategyOptions);
    readonly #blockScroll: BlockScrollStrategy = this.#scrollStrategies.block();
    readonly #renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);
    readonly #window: Window | null = inject(DOCUMENT).defaultView;

    readonly #rightOverlaySource: Subject<OverlayRef> = new Subject<OverlayRef>();

    #overlayRef: OverlayRef | null = null;

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

    public readonly backdropClick: OutputEmitterRef<void> = output<void>();

    public readonly rightOpened: OutputEmitterRef<void> = output<void>();

    public readonly rightClosed: OutputEmitterRef<void> = output<void>();

    public readonly rightOpen: WritableSignal<boolean> = signal<boolean>(false);

    /**
     * `true` когда CDK Overlay для правой sidenav создан и attache'нут (см.
     * effect в constructor'е). Дёргать panel.open() из консьюмера можно только
     * когда это true — иначе openRight() видит null overlayRef и early-return'ит,
     * --entering modifier остаётся, панель остаётся за экраном. Re-exposed на
     * driver через `panel.ready` для удобства route-driven dialog'ов.
     */
    public readonly rightOverlayReady: Signal<boolean> = computed((): boolean => this.#overlayRefSignal() !== null);

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
        effect((onCleanup: (cleanup: () => void) => void): void => {
            const tpl: TemplateRef<unknown> | undefined = this.rightSidenavTpl();

            if (tpl === undefined || this.#overlayRef !== null) {
                return;
            }

            const overlayRef: OverlayRef = this.#createRightOverlay(tpl);
            this.#overlayRef = overlayRef;
            this.#overlayRefSignal.set(overlayRef);

            onCleanup((): void => {
                overlayRef.dispose();
                this.#overlayRef = null;
                this.#overlayRefSignal.set(null);
            });
        });
    }

    public openRight(): void {
        const overlayRef: OverlayRef | null = this.#overlayRef;
        if (overlayRef === null) {
            return;
        }

        this.#blockScroll.enable();

        this.#renderer.removeClass(overlayRef.overlayElement, 'rt-aside-overlay--entering');
        this.#renderer.removeClass(overlayRef.overlayElement, 'rt-aside-overlay--leaving');

        const backdropEl: HTMLElement | null = overlayRef.backdropElement;
        if (backdropEl !== null) {
            this.#renderer.addClass(backdropEl, 'rt-aside-backdrop--visible');
        }

        // Slide-in: на следующий paint добавляем --open.
        requestAnimationFrame((): void => {
            this.#renderer.addClass(overlayRef.overlayElement, 'rt-aside-overlay--open');
            this.#listenTransitionEnd(overlayRef, (): void => this.rightOpened.emit());
        });

        this.rightOpen.set(true);
    }

    public closeRight(): void {
        const overlayRef: OverlayRef | null = this.#overlayRef;
        if (overlayRef === null || !this.rightOpen()) {
            return;
        }

        this.#renderer.removeClass(overlayRef.overlayElement, 'rt-aside-overlay--open');
        this.#renderer.addClass(overlayRef.overlayElement, 'rt-aside-overlay--leaving');

        const backdropEl: HTMLElement | null = overlayRef.backdropElement;
        if (backdropEl !== null) {
            this.#renderer.removeClass(backdropEl, 'rt-aside-backdrop--visible');
        }

        this.#listenTransitionEnd(overlayRef, (): void => {
            this.#blockScroll.disable();
            this.rightOpen.set(false);
            this.rightClosed.emit();
        });
    }

    #createRightOverlay(tpl: TemplateRef<unknown>): OverlayRef {
        const positionStrategy: PositionStrategy = this.#overlay.position().global().right('0').top('0');

        const overlayConfig: OverlayConfig = {
            positionStrategy,
            // noop здесь, scroll-block управляется вручную через #blockScroll
            // в openRight/closeRight — иначе scroll заблокирован всегда
            // (overlay persistent), пока aside ещё не открыт.
            scrollStrategy: this.#overlay.scrollStrategies.noop(),
            hasBackdrop: true,
            backdropClass: 'rt-aside-backdrop',
            panelClass: ['rt-aside-overlay', 'rt-aside-overlay--position-right', 'rt-aside-overlay--entering'],
            disposeOnNavigation: false,
        };

        const overlayRef: OverlayRef = this.#overlay.create(overlayConfig);
        const portal: TemplatePortal = new TemplatePortal(tpl, this.#vcr);
        overlayRef.attach(portal);

        // Backdrop-click / ESC подписки объявлены один раз в конструкторе —
        // здесь только эмит созданного OverlayRef (см. #rightOverlaySource-стрим).
        this.#rightOverlaySource.next(overlayRef);

        return overlayRef;
    }

    // Слушаем именно transform-окончание: на overlay host'е могут анимироваться
    // и другие свойства (opacity backdrop'а, например) — это даст ложные срабатывания.
    #listenTransitionEnd(overlayRef: OverlayRef, callback: () => void): void {
        const element: HTMLElement = overlayRef.overlayElement;

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
            if (event.propertyName !== 'transform' || settled) {
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
