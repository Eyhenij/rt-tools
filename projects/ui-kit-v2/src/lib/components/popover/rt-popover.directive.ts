import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
    ConnectedPosition,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    OverlayRef,
    ScrollStrategyOptions,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
    booleanAttribute,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
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

import { map, merge, Observable, Subject, switchMap } from 'rxjs';

import { IRtPopover } from './rt-popover.model';

const HOVER_CLOSE_DELAY_MS: number = 100;

/**
 * Высота, ниже которой ужимать панель под вьюпорт бессмысленно: в такой полосе не
 * видно и одного пункта. Нужна только режиму `fitViewport` — по ней CDK решает,
 * что свободного места под триггером хватает.
 */
const FIT_VIEWPORT_MIN_HEIGHT_PX: number = 120;

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
 *   (наведение на панель удерживает её открытой).
 * - `manual` — авто-listener'ы не вешаются; host сам зовёт `open()/close()`.
 *   Используется form-control'ами с собственным жестом (autocomplete — открытие
 *   по набору текста).
 *
 * `open()/close()/toggle()/isOpen()` публичны во ВСЕХ режимах — `trigger` лишь
 * определяет авто-listener'ы. `width: 'trigger'` синхронизирует ширину панели с
 * host'ом (dropdown'ы), `'auto'` — content-sized (тултипы).
 */
@Directive({
    selector: '[rtPopover]',
    exportAs: 'rtPopover',
    host: {
        '(click)': 'onHostClick()',
        '(mouseenter)': 'onHostMouseEnter()',
        '(mouseleave)': 'onHostMouseLeave($event)',
    },
})
export class RtPopoverDirective implements OnDestroy {
    readonly #overlay: Overlay = inject(Overlay);
    readonly #elementRef: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
    readonly #scrollStrategies: ScrollStrategyOptions = inject(ScrollStrategyOptions);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #overlayCreatedSource: Subject<OverlayRef> = new Subject<OverlayRef>();

    #overlayRef: OverlayRef | null = null;
    #hoverCloseTimer: ReturnType<typeof setTimeout> | null = null;

    protected readonly isOpenState: WritableSignal<boolean> = signal<boolean>(false);

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

    public readonly opened: OutputEmitterRef<void> = output<void>({ alias: 'rtPopoverOpened' });

    public readonly closed: OutputEmitterRef<void> = output<void>({ alias: 'rtPopoverClosed' });

    public readonly isOpen: Signal<boolean> = this.isOpenState.asReadonly();

    constructor() {
        // Outside-click / ESC подписки на единожды создаваемый overlay живут в
        // одном конструкторном стриме: #ensureOverlay эмитит OverlayRef после
        // создания (ровно один раз за жизнь директивы), стрим живёт до destroy.
        this.#overlayCreatedSource
            .pipe(
                switchMap((overlayRef: OverlayRef): Observable<() => void> =>
                    merge(
                        overlayRef.outsidePointerEvents().pipe(
                            map((event: MouseEvent): (() => void) => (): void => {
                                // Клик по host в режиме click обрабатывает onHostClick (toggle) —
                                // не закрываем здесь, иначе двойной toggle (close + open).
                                if (this.#elementRef.nativeElement.contains(event.target as Node)) {
                                    return;
                                }
                                // Клик по вложенной панели — не клик снаружи: закрытие
                                // разрушило бы её вместе с нашей до того, как выбор
                                // дойдёт до обработчика
                                if (this.#isNestedOverlay(event.target)) {
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
        this.#clearHoverTimer();
        this.#disposeOverlay();
    }

    public open(): void {
        if (this.disabled() || this.isOpenState() || this.template() === null) {
            return;
        }
        const overlayRef: OverlayRef = this.#ensureOverlay();
        if (this.width() === 'trigger') {
            overlayRef.updateSize({ width: this.#elementRef.nativeElement.offsetWidth });
        }
        const portal: TemplatePortal<unknown> = new TemplatePortal(this.template() as TemplateRef<unknown>, this.#viewContainerRef, {
            $implicit: this.context(),
        });
        overlayRef.attach(portal);
        this.isOpenState.set(true);
        this.opened.emit();
    }

    public close(): void {
        if (!this.isOpenState()) {
            return;
        }
        this.#overlayRef?.detach();
        this.isOpenState.set(false);
        this.closed.emit();
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
        if (this.trigger() !== 'click' || this.disabled()) {
            return;
        }
        this.toggle();
    }

    protected onHostMouseEnter(): void {
        if (this.trigger() !== 'hover') {
            return;
        }
        this.#clearHoverTimer();
        this.open();
    }

    protected onHostMouseLeave(event: MouseEvent): void {
        if (this.trigger() !== 'hover') {
            return;
        }
        if (this.#isNestedOverlay(event.relatedTarget)) {
            return;
        }
        this.#scheduleHoverClose();
    }

    #ensureOverlay(): OverlayRef {
        if (this.#overlayRef !== null) {
            return this.#overlayRef;
        }
        const alignX: 'start' | 'end' = this.align();
        const positions: ConnectedPosition[] = [
            {
                originX: alignX,
                originY: 'bottom',
                overlayX: alignX,
                overlayY: 'top',
                offsetX: this.offsetX(),
                offsetY: this.offsetY(),
            },
            {
                originX: alignX,
                originY: 'top',
                overlayX: alignX,
                overlayY: 'bottom',
                offsetX: this.offsetX(),
                offsetY: -this.offsetY(),
            },
        ];
        // Сдвиг к краю экрана и ужатие по высоте включаются только по просьбе
        // потребителя: панель, которая и так помещается, обязана стоять у своего
        // триггера — меню строки таблицы, подтверждение, меню профиля.
        const fitViewport: boolean = this.fitViewport();
        const positionStrategy: FlexibleConnectedPositionStrategy = this.#overlay
            .position()
            .flexibleConnectedTo(this.#elementRef)
            .withPush(fitViewport)
            .withFlexibleDimensions(fitViewport)
            // Отступ от края экрана равен отступу от триггера: свободное место
            // считается без него, и ужатая по высоте панель свисала бы за нижний
            // край ровно на этот отступ — вместе со своей рамкой.
            .withViewportMargin(fitViewport ? Math.abs(this.offsetY()) : 0)
            .withPositions(positions);

        const config: OverlayConfig = new OverlayConfig({
            positionStrategy,
            scrollStrategy: this.#scrollStrategies.reposition(),
            hasBackdrop: false,
            panelClass: this.#resolvePanelClasses(),
            // Порог, ниже которого свободного места под триггером считается
            // недостаточно и панель не ужимается, а сдвигается целиком.
            minHeight: fitViewport ? FIT_VIEWPORT_MIN_HEIGHT_PX : undefined,
        });
        const overlayRef: OverlayRef = this.#overlay.create(config);

        // Hover-bridge: при переходе курсора с host'а на панель отложенный close
        // (grace-период) гасится; уход с панели планирует его заново. Без этого
        // hover-popover закрывался бы по таймеру, как только мышь покидает host.
        // Listeners живут на overlay-элементе и умирают вместе с ним в dispose().
        overlayRef.overlayElement.addEventListener('mouseenter', (): void => {
            if (this.trigger() === 'hover') {
                this.#clearHoverTimer();
            }
        });
        overlayRef.overlayElement.addEventListener('mouseleave', (event: MouseEvent): void => {
            if (this.trigger() === 'hover' && !this.#isNestedOverlay(event.relatedTarget)) {
                this.#scheduleHoverClose();
            }
        });

        // Outside-click / ESC подписки объявлены один раз в конструкторе —
        // здесь только эмит созданного OverlayRef (см. #overlayCreatedSource-стрим).
        this.#overlayCreatedSource.next(overlayRef);

        this.#overlayRef = overlayRef;
        return overlayRef;
    }

    /**
     * Панель, открытая из нашей — список `rt-select`, календарь, вложенное меню.
     *
     * В DOM она лежит не внутри нашей панели, а рядом, отдельным оверлеем CDK.
     * Поэтому и уход курсора на неё, и клик по ней выглядят как «ушёл наружу»:
     * меню профиля закрывалось прямо под рукой, стоило потянуться к списку
     * языков, а выбранное значение до обработчика не доходило — панель со
     * `rt-select` разрушалась раньше.
     *
     * Вложенность определяется порядком в контейнере оверлеев: CDK добавляет их
     * по мере открытия, поэтому панель, открытая из нашей, всегда следует за
     * нашей. Соседний оверлей, открытый до нас, этой проверкой не удерживается —
     * клик по нему закрывает попап, как и любой клик снаружи.
     */
    #isNestedOverlay(target: EventTarget | null): boolean {
        const panel: HTMLElement | undefined = this.#overlayRef?.overlayElement;
        if (!panel || !(target instanceof Element)) {
            return false;
        }

        const nested: Element | null = target.closest('.cdk-overlay-pane');
        const container: HTMLElement | null = panel.parentElement;
        if (nested === null || nested === panel || container === null) {
            return false;
        }

        // `querySelectorAll` отдаёт узлы в порядке документа — им и меряется,
        // какая панель открыта позже
        const panes: readonly Element[] = Array.from(container.querySelectorAll('.cdk-overlay-pane'));

        return panes.indexOf(nested) > panes.indexOf(panel);
    }

    #resolvePanelClasses(): string[] {
        const base: string = 'rt-popover-panel';
        const extra: string = this.panelClass().trim();
        return extra ? [base, ...extra.split(/\s+/)] : [base];
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

    #disposeOverlay(): void {
        this.#overlayRef?.dispose();
        this.#overlayRef = null;
    }
}
