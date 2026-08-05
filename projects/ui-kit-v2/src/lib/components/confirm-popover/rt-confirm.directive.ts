import { BooleanInput } from '@angular/cdk/coercion';
import {
    ConnectedPosition,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    OverlayRef,
    ScrollStrategyOptions,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
    booleanAttribute,
    ComponentRef,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    OnDestroy,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    WritableSignal,
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { map, merge, Observable, Subject, switchMap } from 'rxjs';

import { RtConfirmPopoverComponent } from './rt-confirm-popover.component';
import { IRtConfirmPopover } from './rt-confirm-popover.model';

const VIEWPORT_MARGIN: number = 8;

/**
 * Confirm-popover директива поверх CDK Overlay. Вешается на host-кнопку
 * (обычно `rt-icon-button` деструктивного действия). По клику показывает прямо
 * под кнопкой панель `rt-confirm-popover` с вопросом и кнопками
 * «Отмена» / подтверждение. Подтверждение → `(confirmed)` + закрытие; отмена,
 * outside-click, Escape → просто закрытие.
 *
 * Движок — CDK `flexibleConnectedTo` (end-выравнивание + flip), чтобы панель у
 * правого края aside'а раскрывалась влево и не резалась `overflow: hidden`.
 *
 * @example
 * ```html
 * <rt-icon-button
 *     icon="ico-error"
 *     variant="danger"
 *     ariaLabel="Отклонить"
 *     tooltip="Отклонить"
 *     [rtConfirm]="'Отклонить заявку? Оператор получит уведомление.'"
 *     rtConfirmTitle="Отклонить заявку"
 *     rtConfirmLabel="Отклонить"
 *     (confirmed)="rejectTour()" />
 * ```
 */
@Directive({
    selector: '[rtConfirm]',
    exportAs: 'rtConfirm',
    host: {
        '(click)': 'onHostClick()',
    },
})
export class RtConfirmDirective implements OnDestroy {
    readonly #overlay: Overlay = inject(Overlay);
    readonly #elementRef: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #scrollStrategies: ScrollStrategyOptions = inject(ScrollStrategyOptions);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #overlayCreatedSource: Subject<OverlayRef> = new Subject<OverlayRef>();
    readonly #panelAttachedSource: Subject<ComponentRef<RtConfirmPopoverComponent>> = new Subject<
        ComponentRef<RtConfirmPopoverComponent>
    >();

    #overlayRef: OverlayRef | null = null;
    #panelRef: ComponentRef<RtConfirmPopoverComponent> | null = null;

    protected readonly isOpenState: WritableSignal<boolean> = signal<boolean>(false);

    public readonly message: InputSignal<string> = input<string>('', { alias: 'rtConfirm' });

    public readonly title: InputSignal<string | null> = input<string | null>(null, {
        alias: 'rtConfirmTitle',
    });

    /** Пусто — панель подставит переведённое умолчание */
    public readonly label: InputSignal<string> = input<string>('', {
        alias: 'rtConfirmLabel',
    });

    public readonly cancelLabel: InputSignal<string> = input<string>('', {
        alias: 'rtConfirmCancelLabel',
    });

    public readonly tone: InputSignal<IRtConfirmPopover.Tone> = input<IRtConfirmPopover.Tone>('danger', { alias: 'rtConfirmTone' });

    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        alias: 'rtConfirmDisabled',
        transform: booleanAttribute,
    });

    public readonly confirmed: OutputEmitterRef<void> = output<void>();

    public readonly isOpen: Signal<boolean> = this.isOpenState.asReadonly();

    constructor() {
        // Per-attach подписки на outputs панели (accepted / cancelled) живут в
        // одном конструкторном стриме: open() эмитит свежий ComponentRef,
        // switchMap переключается на его outputs (предыдущая панель к этому
        // моменту уже detach'нута — outputs комплитятся при destroy componentRef).
        // Бэкстоп takeUntilDestroyed — на жизнь директивы.
        this.#panelAttachedSource
            .pipe(
                switchMap((panelRef: ComponentRef<RtConfirmPopoverComponent>): Observable<() => void> =>
                    merge(
                        outputToObservable(panelRef.instance.accepted).pipe(
                            map((): (() => void) => (): void => {
                                this.confirmed.emit();
                                this.close();
                            })
                        ),
                        outputToObservable(panelRef.instance.cancelled).pipe(map((): (() => void) => (): void => this.close()))
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((handleCloseIntent: () => void): void => handleCloseIntent());

        // Outside-click / ESC подписки на единожды создаваемый overlay:
        // #ensureOverlay эмитит OverlayRef после создания (ровно один раз за
        // жизнь директивы), стрим живёт до destroy директивы.
        this.#overlayCreatedSource
            .pipe(
                switchMap((overlayRef: OverlayRef): Observable<() => void> =>
                    merge(
                        overlayRef.outsidePointerEvents().pipe(
                            map((event: MouseEvent): (() => void) => (): void => {
                                // Клик по host обрабатывает onHostClick (toggle) — не закрываем
                                // здесь, иначе двойной toggle.
                                if (this.#elementRef.nativeElement.contains(event.target as Node)) {
                                    return;
                                }
                                this.close();
                            })
                        ),
                        overlayRef.keydownEvents().pipe(
                            map((event: KeyboardEvent): (() => void) => (): void => {
                                if (event.key === 'Escape') {
                                    event.preventDefault();
                                    this.close();
                                }
                            })
                        )
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((handleCloseIntent: () => void): void => handleCloseIntent());
    }

    public ngOnDestroy(): void {
        this.#disposeOverlay();
    }

    public open(): void {
        if (this.disabled() || this.isOpenState() || this.message().trim() === '') {
            return;
        }
        const overlayRef: OverlayRef = this.#ensureOverlay();
        const portal: ComponentPortal<RtConfirmPopoverComponent> = new ComponentPortal(RtConfirmPopoverComponent);
        this.#panelRef = overlayRef.attach(portal);
        this.#panelRef.setInput('message', this.message());
        this.#panelRef.setInput('title', this.title());
        this.#panelRef.setInput('confirmLabel', this.label());
        this.#panelRef.setInput('cancelLabel', this.cancelLabel());
        this.#panelRef.setInput('tone', this.tone());

        // Подписки на accepted/cancelled объявлены один раз в конструкторе —
        // здесь только эмит свежего ComponentRef (см. #panelAttachedSource-стрим).
        this.#panelAttachedSource.next(this.#panelRef);

        this.isOpenState.set(true);
    }

    public close(): void {
        if (!this.isOpenState()) {
            return;
        }
        this.#overlayRef?.detach();
        this.#panelRef = null;
        this.isOpenState.set(false);
    }

    protected onHostClick(): void {
        if (this.disabled()) {
            return;
        }
        if (this.isOpenState()) {
            this.close();
        } else {
            this.open();
        }
    }

    #ensureOverlay(): OverlayRef {
        if (this.#overlayRef !== null) {
            return this.#overlayRef;
        }
        const positions: ConnectedPosition[] = [
            {
                originX: 'end',
                originY: 'bottom',
                overlayX: 'end',
                overlayY: 'top',
                offsetY: 6,
            },
            {
                originX: 'end',
                originY: 'top',
                overlayX: 'end',
                overlayY: 'bottom',
                offsetY: -6,
            },
        ];
        const positionStrategy: FlexibleConnectedPositionStrategy = this.#overlay
            .position()
            .flexibleConnectedTo(this.#elementRef)
            .withPush(true)
            .withViewportMargin(VIEWPORT_MARGIN)
            .withFlexibleDimensions(false)
            .withPositions(positions);

        const config: OverlayConfig = new OverlayConfig({
            positionStrategy,
            scrollStrategy: this.#scrollStrategies.reposition(),
            hasBackdrop: false,
            panelClass: 'rt-confirm-popover-panel',
        });
        const overlayRef: OverlayRef = this.#overlay.create(config);

        // Outside-click / ESC подписки объявлены один раз в конструкторе —
        // здесь только эмит созданного OverlayRef (см. #overlayCreatedSource-стрим).
        this.#overlayCreatedSource.next(overlayRef);

        this.#overlayRef = overlayRef;
        return overlayRef;
    }

    #disposeOverlay(): void {
        this.#overlayRef?.dispose();
        this.#overlayRef = null;
        this.#panelRef = null;
    }
}
