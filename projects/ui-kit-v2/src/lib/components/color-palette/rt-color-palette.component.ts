import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    forwardRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    viewChild,
    viewChildren,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { RtFormControlBase } from '@rt-tools/ui-kit-v2/form-control';
import { RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { RtColorPickerComponent } from './picker/rt-color-picker.component';
import { colorPaletteHex, colorPaletteNextIndex, colorPaletteSwatches } from './rt-color-palette.logic';
import { IRtColorPalette } from './rt-color-palette.model';

const BEM_BLOCK: string = 'rt-color-palette';

/** С какого цвета начинается выбор своего, когда поле пусто. */
const PICKER_START: string = '#000000';

/**
 * Поле выбора цвета: образцы из набора и свой цвет. Значение — `#rrggbb` строчными или `null`.
 *
 * Образцы — группа переключателей: в порядке Tab стоит один образец, стрелки выбирают соседний.
 * Свой цвет выбирается на панели кита — площадь, полоса оттенка и запись, — и поле меняет только
 * «Применить». Только для чтения рисуется один образец текущего цвета.
 *
 * Договорённость — `docs/specs/ui-kit-v2/color-palette/`.
 */
@Component({
    selector: 'rt-color-palette',
    templateUrl: './rt-color-palette.component.html',
    styleUrls: ['./rt-color-palette.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtButtonDirective,
        RtColorPickerComponent,
        RtPopoverDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    providers: [
        // Алиас базового токена — чтобы rt-field нашёл контрол через contentChild(RtFormControlBase).
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtColorPaletteComponent) },
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-color-palette--disabled]': 'isDisabled()',
        '[class.rt-color-palette--invalid]': 'isInvalid()',
        '[class.rt-color-palette--readonly]': 'isReadonlyView()',
    },
})
export class RtColorPaletteComponent extends RtFormControlBase<string | null> {
    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value() !== null);
    protected readonly swatches: Signal<IRtColorPalette.Swatch[]> = computed((): IRtColorPalette.Swatch[] =>
        colorPaletteSwatches(this.colors(), this.value())
    );

    /** Номер выбранного образца; без выбора — `-1`. */
    protected readonly checkedIndex: Signal<number> = computed((): number =>
        this.swatches().findIndex((swatch: IRtColorPalette.Swatch): boolean => swatch.hex === this.value())
    );

    /** Образец в порядке Tab: выбранный, а без выбора — первый. */
    protected readonly tabbableIndex: Signal<number> = computed((): number => Math.max(this.checkedIndex(), 0));

    /** Свой цвет уже выбран: последний образец стоит вне набора. */
    protected readonly hasCustom: Signal<boolean> = computed((): boolean =>
        this.swatches().some((swatch: IRtColorPalette.Swatch): boolean => swatch.custom)
    );

    protected readonly isReadonlyView: Signal<boolean> = computed((): boolean => this.readonly() || this.isReadonly());
    protected readonly pickerStart: Signal<string> = computed((): string => this.value() ?? PICKER_START);
    protected readonly groupLabel: Signal<string> = computed((): string => this.ariaLabel() ?? this.t().uiColorPalette);

    protected readonly swatchRefs: Signal<readonly ElementRef<HTMLButtonElement>[]> = viewChildren<ElementRef<HTMLButtonElement>>('swatch');
    protected readonly picker: Signal<RtPopoverDirective | undefined> = viewChild(RtPopoverDirective);

    /** Цвета образцов по порядку; без них — набор кита. Неверные цвета и повторы не рисуются. */
    public readonly colors: InputSignal<readonly string[]> = input<readonly string[]>([]);

    /** Только для чтения: один образец текущего цвета, нажимать нечего. */
    public readonly readonly: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Кнопка своего цвета и панель выбора. Без неё палитра выбирает только из набора. */
    public readonly customAllowed: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /** Поля красного, зелёного и синего в панели своего цвета, под записью hex. */
    public readonly channels: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly displayText: Signal<string> = computed((): string => this.value() ?? '');

    public override writeValue(value: string | null): void {
        super.writeValue(colorPaletteHex(value));
    }

    protected onSwatch(hex: string): void {
        if (this.isDisabled() || this.isReadonlyView()) {
            return;
        }

        this.#choose(hex);
    }

    protected onSwatchKeydown(event: KeyboardEvent): void {
        if (this.isDisabled()) {
            return;
        }

        const next: number | null = colorPaletteNextIndex(event.key, this.checkedIndex(), this.swatches().length);

        if (next === null) {
            return;
        }

        event.preventDefault();
        this.#choose(this.swatches()[next].hex);
        this.swatchRefs()[next]?.nativeElement.focus();
    }

    protected onCustomApply(hex: string): void {
        this.picker()?.close();
        this.#choose(hex);
    }

    protected onCustomCancel(): void {
        this.picker()?.close();
    }

    protected getEmptyValue(): string | null {
        return null;
    }

    protected focusAfterClear(): void {
        this.swatchRefs()[0]?.nativeElement.focus();
    }

    #choose(hex: string): void {
        this.value.set(hex);
        this.emitChange(hex);
        this.markTouched();
    }
}
