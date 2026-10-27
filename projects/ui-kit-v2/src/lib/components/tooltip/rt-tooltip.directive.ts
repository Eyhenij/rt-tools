import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { NumberInput } from '@angular/cdk/coercion';
import { hasModifierKey } from '@angular/cdk/keycodes';
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
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    OnDestroy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { carryThemeScope, IRtKitConfig, materialPresetClassesOf, rtKitDefault } from '@rt-tools/ui-kit-v2/core';
import { RtTooltipComponent } from './rt-tooltip.component';
import { isTooltipTextCut, tooltipPlacement, tooltipPositions } from './rt-tooltip.logic';
import { IRtTooltip } from './rt-tooltip.model';

const SHOW_DELAY_MS: number = 300;
const VIEWPORT_MARGIN: number = 8;

/**
 * Tooltip-директива поверх CDK Overlay. Показывает короткую подсказку
 * (`rtTooltip` = строка) на hover/focus host'а. Движок — CDK `flexibleConnectedTo`
 * (авто-flip у края viewport, reposition при скролле), так что подсказка не
 * режется `overflow: hidden` предками (таблицы, aside, карточки).
 *
 * Триггеры: `mouseenter` и фокус с клавиатуры показывают (с задержкой `SHOW_DELAY_MS`),
 * `mouseleave`/`focusout`/`click`/Escape прячут. Фокус, поставленный мышью или кодом, подсказку не
 * показывает, как у Material: меню возвращает фокус кнопке после выбора пункта мышью, и
 * подсказка кнопки всплывала поверх того, что пункт открыл. Пустой текст → no-op (директива
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
        '(focusout)': 'hide()',
        '(click)': 'onClick()',
        '(keydown)': 'onKeydown($event)',
    },
})
export class RtTooltipDirective implements OnDestroy {
    readonly #overlay: Overlay = inject(Overlay);
    readonly #elementRef: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #scrollStrategies: ScrollStrategyOptions = inject(ScrollStrategyOptions);
    readonly #focusMonitor: FocusMonitor = inject(FocusMonitor);

    #overlayRef: OverlayRef | null = null;
    #tooltipRef: ComponentRef<RtTooltipComponent> | null = null;
    #showTimer: ReturnType<typeof setTimeout> | null = null;
    /**
     * Сторона из настроек кита. Не умолчание входа: обёртка кита, передающая свой `null`, перебила
     * бы настройку приложения.
     */
    readonly #placementDefault: IRtTooltip.Placement | null = rtKitDefault(
        'tooltip',
        (it: IRtKitConfig.Tooltip): IRtTooltip.Placement | undefined => it.placement,
        null
    );
    /**
     * Задержка показа по умолчанию: из настроек кита `components.tooltip.showDelay`, без них —
     * `SHOW_DELAY_MS`. Не умолчание входа — по той же причине, что и сторона.
     */
    readonly #showDelayDefault: number = rtKitDefault(
        'tooltip',
        (it: IRtKitConfig.Tooltip): number | undefined => it.showDelay,
        SHOW_DELAY_MS
    );

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

    /**
     * Сторона подсказки. `null` — сторона из настроек кита `components.tooltip.placement`, без них
     * сверху, а под материальным набором снизу, как у первого кита.
     */
    public readonly placement: InputSignal<IRtTooltip.Placement | null> = input<IRtTooltip.Placement | null>(null, {
        alias: 'rtTooltipPlacement',
    });

    /**
     * Задержка показа этой подсказки в миллисекундах. `null` — общая задержка из настроек кита, без
     * них 300.
     */
    public readonly showDelay: InputSignalWithTransform<number | null, NumberInput> = input<number | null, NumberInput>(null, {
        alias: 'rtTooltipShowDelay',
        transform: (value: NumberInput): number | null => {
            const delay: number = value === null || value === undefined || value === '' ? Number.NaN : numberAttribute(value, Number.NaN);
            return delay >= 0 ? delay : null;
        },
    });

    /**
     * Подсказка только у обрезанного текста: хост меряется в момент показа, и подсказка не
     * появляется, пока его содержимое помещается целиком. Мерить заранее не нужно — показ идёт
     * только отсюда, и признак в эту минуту всегда свежий.
     */
    public readonly whenTruncated: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        alias: 'rtTooltipWhenTruncated',
        transform: booleanAttribute,
    });

    /**
     * Клик прячет открытую подсказку — по умолчанию, как раньше; умолчание на всё приложение —
     * `components.tooltip.hideOnClick` в настройках кита. `false` оставляет её открытой:
     * кнопка-переключатель показывает в ней новое состояние сразу после нажатия. Отложенный показ
     * клик снимает при любом значении — касание на тач-экране (mouseenter + click) подсказку не
     * показывает.
     */
    public readonly hideOnClick: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
        rtKitDefault('tooltip', (it: IRtKitConfig.Tooltip): boolean | undefined => it.hideOnClick, true),
        {
            alias: 'rtTooltipHideOnClick',
            transform: booleanAttribute,
        }
    );

    constructor() {
        // Новый текст доходит до открытой панели на месте, без повторного наведения.
        effect((): void => this.#syncText(this.text()));
        this.#focusMonitor
            .monitor(this.#elementRef, true)
            .pipe(takeUntilDestroyed())
            .subscribe((origin: FocusOrigin): void => {
                if (origin === 'keyboard') {
                    this.show();
                }
            });
    }

    public ngOnDestroy(): void {
        this.#focusMonitor.stopMonitoring(this.#elementRef);
        this.#clearTimer();
        this.#disposeOverlay();
    }

    protected show(): void {
        if (this.text().trim() === '' || this.#tooltipRef !== null) {
            return;
        }
        this.#clearTimer();
        this.#showTimer = setTimeout((): void => this.#attach(), this.showDelay() ?? this.#showDelayDefault);
    }

    protected hide(): void {
        this.#clearTimer();
        this.#overlayRef?.detach();
        this.#tooltipRef = null;
    }

    protected onClick(): void {
        if (this.hideOnClick() || this.#tooltipRef === null) {
            this.hide();
        }
    }

    /**
     * Escape прячет подсказку и снимает отложенный показ, фокус остаётся на хосте. Событие гасится,
     * только когда панель была открыта: при закрытой Escape доходит до диалога или панели выше.
     */
    protected onKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Escape' || hasModifierKey(event)) {
            return;
        }
        const wasOpen: boolean = this.#tooltipRef !== null;
        this.hide();
        if (wasOpen) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    #syncText(text: string): void {
        if (this.#tooltipRef === null) {
            return;
        }
        if (text.trim() === '') {
            this.hide();
            return;
        }
        this.#tooltipRef.instance.text.set(text);
        this.#tooltipRef.changeDetectorRef.markForCheck();
        this.#overlayRef?.updatePosition();
    }

    #attach(): void {
        if (this.text().trim() === '' || (this.whenTruncated() && !isTooltipTextCut(this.#elementRef.nativeElement))) {
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
        const presetClasses: string[] = materialPresetClassesOf(this.#elementRef.nativeElement);
        const placement: IRtTooltip.Placement = tooltipPlacement(this.placement(), this.#placementDefault, presetClasses.length > 0);
        const positions: ConnectedPosition[] = tooltipPositions(placement);

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
