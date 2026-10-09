import { BooleanInput } from '@angular/cdk/coercion';
import { ConnectedPosition } from '@angular/cdk/overlay';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    viewChild,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { IRtIconButton, RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { IRtTooltip, RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import { speedMenuActionSize, speedMenuNextIndex, speedMenuPositions, speedMenuTooltipSide } from './rt-speed-menu.logic';
import { IRtSpeedMenu } from './rt-speed-menu.model';

const BEM_BLOCK: string = 'rt-speed-menu';

/** Кнопки действий, которые можно нажать: недоступная кнопка кита несёт нативный `disabled`. */
const AVAILABLE_ACTION: string = '.rt-speed-menu__action .rt-icon-button:not(:disabled)';

/**
 * Быстрое меню: круглая кнопка, которая раскрывает рядом несколько круглых кнопок действий. Действия
 * лежат в плавающей панели кита (`rtPopover`) на стороне направления, у края экрана — на
 * противоположной; Escape и нажатие снаружи закрывают меню.
 *
 * Выбор отдаётся выходом `actionSelect`, и меню остаётся открытым: приложение нажимает действие
 * несколько раз подряд. Закрытие на выборе — вход `closeOnSelect`.
 */
@Component({
    selector: 'rt-speed-menu',
    templateUrl: './rt-speed-menu.component.html',
    styleUrl: './rt-speed-menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [BlockDirective, ElemDirective, ModDirective, RtIconButtonComponent, RtPopoverDirective, RtTooltipDirective],
    host: {
        class: BEM_BLOCK,
        '[class.rt-speed-menu--open]': 'isOpen()',
    },
})
export class RtSpeedMenuComponent {
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);
    readonly #injector: Injector = inject(Injector);

    readonly #t_uiActions: Signal<string> = rtKitLabel('uiActions');

    protected readonly popover: Signal<RtPopoverDirective | undefined> = viewChild(RtPopoverDirective);

    protected readonly panel: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('panel');

    protected readonly isOpen: Signal<boolean> = computed((): boolean => this.popover()?.isOpen() ?? false);

    /** Своё имя кнопки важнее умолчания: приложение знает, что за действия в меню. */
    protected readonly triggerLabel: Signal<string> = computed((): string => this.label() || this.#t_uiActions());

    protected readonly positions: Signal<readonly ConnectedPosition[]> = computed((): readonly ConnectedPosition[] =>
        speedMenuPositions(this.direction())
    );

    protected readonly actionSize: Signal<IRtIconButton.Size> = computed((): IRtIconButton.Size => speedMenuActionSize(this.size()));

    protected readonly tooltipSide: Signal<IRtTooltip.Placement> = computed((): IRtTooltip.Placement =>
        speedMenuTooltipSide(this.direction())
    );

    /** Действия меню в порядке чтения: сверху вниз в столбце, от начала к концу в ряду. */
    public readonly actions: InputSignal<readonly IRtSpeedMenu.Action[]> = input.required<readonly IRtSpeedMenu.Action[]>();

    /** Значок кнопки меню: имя кита или Material. Открытая кнопка показывает крест. */
    public readonly icon: InputSignal<string> = input<string>('menu');

    /** Доступное имя кнопки меню. Пусто — подпись кита «Действия». */
    public readonly label: InputSignal<string> = input<string>('');

    /** Сторона, на которую раскрываются действия. */
    public readonly direction: InputSignal<IRtSpeedMenu.Direction> = input<IRtSpeedMenu.Direction>('up');

    /** Размер кнопки меню; действия на шаг меньше. */
    public readonly size: InputSignal<IRtSpeedMenu.Size> = input<IRtSpeedMenu.Size>('lg');

    /** Палитра кнопки меню. */
    public readonly variant: InputSignal<IRtSpeedMenu.Variant> = input<IRtSpeedMenu.Variant>('primary');

    /** Закрывать меню после выбора действия; фокус возвращается на кнопку меню. */
    public readonly closeOnSelect: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Недоступное меню не открывается, а открытое закрывается. */
    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Выбор действия — его `value`. */
    public readonly actionSelect: OutputEmitterRef<string> = output<string>();

    /** Меню открылось (`true`) или закрылось (`false`). */
    public readonly openChange: OutputEmitterRef<boolean> = output<boolean>();

    constructor() {
        effect((): void => {
            if (this.disabled()) {
                this.popover()?.close();
            }
        });
    }

    protected onTrigger(event: MouseEvent): void {
        if (this.isOpen()) {
            this.popover()?.close();
            return;
        }
        if (this.actions().length === 0) {
            return;
        }
        this.popover()?.open();
        // Нажатие с клавиатуры приходит без счёта щелчков: такого человека панель встречает фокусом
        // на первом действии — она лежит в конце страницы, и Tab до неё не дошёл бы.
        if (event.detail === 0) {
            afterNextRender((): void => this.#focusAction(0), { injector: this.#injector });
        }
    }

    protected onAction(action: IRtSpeedMenu.Action): void {
        if (action.disabled) {
            return;
        }
        this.actionSelect.emit(action.value);
        if (this.closeOnSelect()) {
            this.#closeToTrigger();
        }
    }

    protected onPanelKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape' || event.key === 'Tab') {
            event.preventDefault();
            this.#closeToTrigger();
            return;
        }
        const buttons: HTMLElement[] = this.#availableActions();
        // Клавишу ловит кнопка в фокусе, и место в ряду меряется по ней
        const current: number = buttons.findIndex((button: HTMLElement): boolean => button === event.target);
        const next: number | null = speedMenuNextIndex(event.key, current, buttons.length);
        if (next === null) {
            return;
        }
        event.preventDefault();
        buttons[next]?.focus();
    }

    protected onOpened(): void {
        this.openChange.emit(true);
    }

    protected onClosed(): void {
        this.openChange.emit(false);
    }

    #closeToTrigger(): void {
        this.popover()?.close();
        this.#host.nativeElement.querySelector<HTMLElement>('.rt-speed-menu__trigger .rt-icon-button')?.focus();
    }

    #focusAction(index: number): void {
        this.#availableActions()[index]?.focus();
    }

    #availableActions(): HTMLElement[] {
        const panel: HTMLElement | undefined = this.panel()?.nativeElement;
        return panel ? Array.from(panel.querySelectorAll<HTMLElement>(AVAILABLE_ACTION)) : [];
    }
}
