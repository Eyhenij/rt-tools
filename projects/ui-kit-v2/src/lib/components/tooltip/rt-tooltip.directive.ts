import {
    ConnectedPosition,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    OverlayRef,
    ScrollStrategyOptions,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Directive, ElementRef, inject, input, InputSignal, InputSignalWithTransform, OnDestroy } from '@angular/core';

import { carryThemeScope, materialPresetClassesOf } from '../../util/material-preset';
import { RtTooltipComponent } from './rt-tooltip.component';
import { IRtTooltip } from './rt-tooltip.model';

const SHOW_DELAY_MS: number = 300;
const VIEWPORT_MARGIN: number = 8;

/**
 * Tooltip-директива поверх CDK Overlay. Показывает короткую подсказку
 * (`rtTooltip` = строка) на hover/focus host'а. Движок — CDK `flexibleConnectedTo`
 * (авто-flip у края viewport, reposition при скролле), так что подсказка не
 * режется `overflow: hidden` предками (таблицы, aside, карточки).
 *
 * Триггеры: `mouseenter`/`focusin` показывают (с задержкой `SHOW_DELAY_MS`),
 * `mouseleave`/`focusout`/`click` прячут. Пустой текст → no-op (директива
 * выключена), поэтому её можно безусловно вешать на icon-кнопки и включать
 * выставлением строки.
 *
 * @example
 * ```html
 * <rt-icon-button icon="ico-trash" ariaLabel="Удалить" tooltip="Удалить" />
 * <button rtButton [rtTooltip]="'Подсказка'">…</button>
 * ```
 */
@Directive({
    selector: '[rtTooltip]',
    exportAs: 'rtTooltip',
    host: {
        '(mouseenter)': 'show()',
        '(mouseleave)': 'hide()',
        '(focusin)': 'show()',
        '(focusout)': 'hide()',
        '(click)': 'hide()',
    },
})
export class RtTooltipDirective implements OnDestroy {
    readonly #overlay: Overlay = inject(Overlay);
    readonly #elementRef: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #scrollStrategies: ScrollStrategyOptions = inject(ScrollStrategyOptions);

    #overlayRef: OverlayRef | null = null;
    #tooltipRef: ComponentRef<RtTooltipComponent> | null = null;
    #showTimer: ReturnType<typeof setTimeout> | null = null;

    /**
     * Текст подсказки. Принимает `null`/`undefined` (частый результат date-пайпа
     * или nullable-полей модели) и нормализует их в пустую строку — иначе
     * биндинги вида `value | date` ломали бы строгую типизацию шаблона. Пустая
     * строка → no-op (директива выключена).
     */
    public readonly text: InputSignalWithTransform<string, string | null | undefined> = input<string, string | null | undefined>('', {
        alias: 'rtTooltip',
        transform: (value: string | null | undefined): string => value ?? '',
    });

    /** Сторона подсказки. Не задана — сверху, а под материальным набором снизу, как у первого кита. */
    public readonly placement: InputSignal<IRtTooltip.Placement | null> = input<IRtTooltip.Placement | null>(null, {
        alias: 'rtTooltipPlacement',
    });

    public ngOnDestroy(): void {
        this.#clearTimer();
        this.#disposeOverlay();
    }

    protected show(): void {
        if (this.text().trim() === '' || this.#tooltipRef !== null) {
            return;
        }
        this.#clearTimer();
        this.#showTimer = setTimeout((): void => this.#attach(), SHOW_DELAY_MS);
    }

    protected hide(): void {
        this.#clearTimer();
        this.#overlayRef?.detach();
        this.#tooltipRef = null;
    }

    #attach(): void {
        if (this.text().trim() === '') {
            return;
        }
        const overlayRef: OverlayRef = this.#ensureOverlay();
        // Коробка переживает закрытие, а кусок темы вокруг host'а мог смениться — переносим на каждом показе.
        carryThemeScope(overlayRef.overlayElement, this.#elementRef.nativeElement);
        const portal: ComponentPortal<RtTooltipComponent> = new ComponentPortal(RtTooltipComponent);
        this.#tooltipRef = overlayRef.attach(portal);
        this.#tooltipRef.instance.text.set(this.text());
        this.#tooltipRef.changeDetectorRef.markForCheck();
    }

    #ensureOverlay(): OverlayRef {
        if (this.#overlayRef !== null) {
            return this.#overlayRef;
        }
        const above: ConnectedPosition = {
            originX: 'center',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'bottom',
            offsetY: -6,
        };
        const below: ConnectedPosition = {
            originX: 'center',
            originY: 'bottom',
            overlayX: 'center',
            overlayY: 'top',
            offsetY: 6,
        };
        const presetClasses: string[] = materialPresetClassesOf(this.#elementRef.nativeElement);
        const placement: IRtTooltip.Placement = this.placement() ?? (presetClasses.length > 0 ? 'bottom' : 'top');
        const positions: ConnectedPosition[] = placement === 'top' ? [above, below] : [below, above];

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
            panelClass: ['rt-tooltip-panel', ...presetClasses],
        });
        this.#overlayRef = this.#overlay.create(config);
        return this.#overlayRef;
    }

    #clearTimer(): void {
        if (this.#showTimer !== null) {
            clearTimeout(this.#showTimer);
            this.#showTimer = null;
        }
    }

    #disposeOverlay(): void {
        this.#overlayRef?.dispose();
        this.#overlayRef = null;
        this.#tooltipRef = null;
    }
}
