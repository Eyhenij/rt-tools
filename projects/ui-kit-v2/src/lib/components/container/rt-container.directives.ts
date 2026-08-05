import { DestroyRef, Directive, OnDestroy, OutputEmitterRef, Signal, inject, output } from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RtContainerStateService } from './rt-container-state.service';
import { RtContainerComponent } from './rt-container.component';

/**
 * Маркер-директива для содержимого хедера `rt-container`.
 *
 * @example
 * ```html
 * <rt-container>
 *     <ng-container *rtContainerHeader>
 *         <rt-header />
 *     </ng-container>
 * </rt-container>
 * ```
 */
@Directive({
    selector: '[rtContainerHeader]',
})
export class RtContainerHeaderDirective {}

/**
 * Маркер-директива для контента левой sidenav в `rt-container`.
 *
 * @example
 * ```html
 * <rt-container>
 *     <ng-container *rtContainerLeftSidenav>
 *         <router-outlet name="lo" />
 *     </ng-container>
 * </rt-container>
 * ```
 */
@Directive({
    selector: '[rtContainerLeftSidenav]',
})
export class RtContainerLeftSidenavDirective {}

/**
 * Маркер-директива для контента правой sidenav в `rt-container`.
 *
 * @example
 * ```html
 * <rt-container>
 *     <ng-container *rtContainerRightSidenav>
 *         <router-outlet name="ro" />
 *     </ng-container>
 * </rt-container>
 * ```
 */
@Directive({
    selector: '[rtContainerRightSidenav]',
})
export class RtContainerRightSidenavDirective {}

/**
 * Маркер-директива для контента в левой секции toolbar.
 *
 * @example
 * ```html
 * <rt-container>
 *     <ng-container *rtContainerToolbarLeft>
 *         <router-outlet name="lb" />
 *     </ng-container>
 * </rt-container>
 * ```
 */
@Directive({
    selector: '[rtContainerToolbarLeft]',
})
export class RtContainerToolbarLeftDirective {}

/**
 * Маркер-директива для контента в центральной секции toolbar.
 *
 * @example
 * ```html
 * <rt-container>
 *     <ng-container *rtContainerToolbarCenter>
 *         <router-outlet name="cb" />
 *     </ng-container>
 * </rt-container>
 * ```
 */
@Directive({
    selector: '[rtContainerToolbarCenter]',
})
export class RtContainerToolbarCenterDirective {}

/**
 * Маркер-директива для контента в правой секции toolbar.
 *
 * @example
 * ```html
 * <rt-container>
 *     <ng-container *rtContainerToolbarRight>
 *         <router-outlet name="rb" />
 *     </ng-container>
 * </rt-container>
 * ```
 */
@Directive({
    selector: '[rtContainerToolbarRight]',
})
export class RtContainerToolbarRightDirective {}

/**
 * Маркер-директива для основного контента `rt-container`.
 *
 * @example
 * ```html
 * <rt-container>
 *     <ng-container *rtContainerContent>
 *         <router-outlet />
 *     </ng-container>
 * </rt-container>
 * ```
 */
@Directive({
    selector: '[rtContainerContent]',
})
export class RtContainerContentDirective {}

/**
 * Driver-директива для управления левой sidenav через шаблонную ссылку.
 *
 * Пишет в component-scoped `RtContainerStateService.leftSidenavOpen` signal —
 * шаблон контейнера читает этот signal и применяет docked grid-cell состояние.
 *
 * @example
 * ```html
 * <ng-container rtContainerLeftSidenavPanel #left="containerLeftPanel">
 *     <button (click)="left.toggle(true)">Open</button>
 * </ng-container>
 * ```
 */
@Directive({
    selector: '[rtContainerLeftSidenavPanel]',
    exportAs: 'containerLeftPanel',
})
export class RtContainerLeftSidenavPanelDirective {
    readonly #state: RtContainerStateService = inject(RtContainerStateService);

    public open(): void {
        this.#state.leftSidenavOpen.set(true);
    }

    public close(): void {
        this.#state.leftSidenavOpen.set(false);
    }

    public toggle(isOpen: boolean): void {
        this.#state.leftSidenavOpen.set(isOpen);
    }
}

/**
 * Driver-директива правой sidenav: route-component вызывает `open()`/`close()`,
 * rt-container выполняет slide-in/slide-out через CSS transform. После завершения
 * анимации driver эмитит `(opened)` / `(closed)`; backdrop click и ESC контейнера
 * эмитятся через `(cancelled)` — консьюмер сам решает что делать (обычно `close()`).
 *
 * Sub'ы через `takeUntilDestroyed` снимаются при разрушении route-component'а.
 * При уничтожении с открытой панелью гарантирует cleanup overlay'я (см. `ngOnDestroy`),
 * иначе при hard-navigate без `panel.close()` overlay останется висеть.
 *
 * @example
 * ```html
 * <ng-container
 *     rtContainerRightSidenavPanel
 *     #right="rtContainerRightPanel"
 *     (cancelled)="onClose()"
 *     (closed)="onClosed()">
 * </ng-container>
 * ```
 */
@Directive({
    selector: '[rtContainerRightSidenavPanel]',
    exportAs: 'rtContainerRightPanel',
})
export class RtContainerRightSidenavPanelDirective implements OnDestroy {
    readonly #container: RtContainerComponent = inject(RtContainerComponent);

    public readonly opened: OutputEmitterRef<void> = output<void>();

    public readonly closed: OutputEmitterRef<void> = output<void>();

    public readonly cancelled: OutputEmitterRef<void> = output<void>();

    /**
     * Re-export rt-container.rightOverlayReady — `true` когда CDK Overlay создан
     * и attache'нут. Консьюмер должен ждать этого signal'а в effect'е, перед
     * тем как вызывать `panel.open()` (иначе race: rt-container.effect ещё не
     * создал overlay → openRight() рано вернётся → --entering остаётся).
     */
    public readonly ready: Signal<boolean> = this.#container.rightOverlayReady;

    constructor() {
        const destroyRef: DestroyRef = inject(DestroyRef);

        // `output()` возвращает OutputEmitterRef (нет .pipe) — оборачиваем через
        // outputToObservable, чтобы пристегнуть takeUntilDestroyed.
        outputToObservable(this.#container.backdropClick)
            .pipe(takeUntilDestroyed(destroyRef))
            .subscribe((): void => this.cancelled.emit());

        outputToObservable(this.#container.rightOpened)
            .pipe(takeUntilDestroyed(destroyRef))
            .subscribe((): void => this.opened.emit());

        outputToObservable(this.#container.rightClosed)
            .pipe(takeUntilDestroyed(destroyRef))
            .subscribe((): void => this.closed.emit());
    }

    public ngOnDestroy(): void {
        // Если route-component разрушается при открытой панели (hard-navigate без
        // явного close через panel.close) — гарантируем cleanup, иначе overlay
        // останется висеть после смены роута.
        if (this.#container.rightOpen()) {
            this.#container.closeRight();
        }
    }

    public open(): void {
        this.#container.openRight();
    }

    public close(): void {
        this.#container.closeRight();
    }
}

/**
 * Driver-директива для основного content-региона `rt-container`.
 *
 * Объявляет 3 outputs (`scrolled/scrolledUp/scrolledDown`) — публичную поверхность
 * для будущих consumer'ов. Real-time wiring (scroll listeners → emit) отложено
 * до первого реального потребителя.
 *
 * @example
 * ```html
 * <ng-container
 *     rtContainerContentPanel
 *     (scrolled)="onScroll()"
 * >
 *     <router-outlet />
 * </ng-container>
 * ```
 */
@Directive({
    selector: '[rtContainerContentPanel]',
})
export class RtContainerContentPanelDirective {
    public readonly scrolled: OutputEmitterRef<void> = output<void>();

    public readonly scrolledUp: OutputEmitterRef<void> = output<void>();

    public readonly scrolledDown: OutputEmitterRef<void> = output<void>();
}
