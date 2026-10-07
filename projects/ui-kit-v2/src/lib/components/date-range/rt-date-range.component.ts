import {
    computed,
    forwardRef,
    inject,
    input,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RT_KIT_LOCALE, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { BreakpointsService } from '@rt-tools/ui-kit-v2/core';
import { RtBottomSheetComponent } from '@rt-tools/ui-kit-v2/bottom-sheet';
import { IRtDatePicker } from '@rt-tools/ui-kit-v2/date-picker';
import { rtDateLayout } from '@rt-tools/ui-kit-v2/date-picker';
import { RtFormControlBase } from '@rt-tools/ui-kit-v2/form-control';
import { IRtInput } from '@rt-tools/ui-kit-v2/core';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { RtDateRangePanelComponent } from './panel/rt-date-range-panel.component';
import { rtRangeInBounds, rtRangeParse, rtRangeRead, rtRangeShape, rtRangeText } from './rt-date-range.logic';
import { IRtDateRange } from './rt-date-range.model';

const BEM_BLOCK: string = 'rt-date-range';

/**
 * Поле диапазона дат со своей панелью кита, визуально и по токенам идентичное rt-input (host — box
 * `--rt-input-*`, input — прозрачный `__field`). Кнопка в конце поля открывает
 * `rt-date-range-panel`: на широком экране в поповере, на узком — в нижней шторке. CVA через общий
 * `RtFormControlBase`: clearable, авто-подсветка invalid, read-only представление.
 *
 * `value` — пара дней `{ start, end }` в форме `YYYY-MM-DD` или `null`. Текст в поле — две даты в
 * порядке языка интерфейса через тире (`12.10.2026 — 15.10.2026` под `ru`); набирается так же.
 * Нечитаемый или лежащий за границами текст оставляет значение прежним и помечает поле ошибкой.
 */
@Component({
    selector: 'rt-date-range',
    templateUrl: './rt-date-range.component.html',
    styleUrls: ['./rt-date-range.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtBottomSheetComponent,
        RtDateRangePanelComponent,
        RtIconButtonComponent,
        RtPopoverDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtDateRangeComponent) },
    ],
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    host: {
        class: BEM_BLOCK,
        '[class.rt-date-range--disabled]': 'isDisabled()',
        '[class.rt-date-range--invalid]': 'isInvalid() || textInvalid()',
        '[class.rt-date-range--readonly]': 'isReadonly()',
        '[class.rt-date-range--borderless]': '!bordered()',
        '[class.rt-date-range--appearance--fill]': "appearance() === 'fill'",
        '[class.rt-date-range--size--sm]': "size() === 'sm'",
        '[class.rt-date-range--size--lg]': "size() === 'lg'",
    },
})
export class RtDateRangeComponent extends RtFormControlBase<IRtDateRange.Value | null> {
    /** Локаль кита: приложение, меняющее язык на ходу, меняет её, и текст поля пересчитывается. */
    readonly #locale: Signal<string> = inject(RT_KIT_LOCALE);
    /** Порядок дня, месяца и года в тексте поля — по локали кита. */
    readonly #layout: Signal<IRtDatePicker.TextLayout> = computed((): IRtDatePicker.TextLayout => rtDateLayout(this.#locale()));

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);
    /** Узкий экран: панель открывается в нижней шторке, а не в поповере. */
    protected readonly narrow: Signal<boolean> = inject(BreakpointsService).narrow;

    protected readonly fieldEl: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild<ElementRef<HTMLInputElement>>('fieldEl');
    protected readonly popover: Signal<RtPopoverDirective | undefined> = viewChild(RtPopoverDirective);

    /** Набранный текст не читается как диапазон в границах: поле помечено ошибкой. */
    protected readonly textInvalid: WritableSignal<boolean> = signal(false);
    protected readonly sheetOpen: WritableSignal<boolean> = signal(false);
    /** Подсказка формы текста буквами кита: `дд.мм.гггг — дд.мм.гггг` под русскими метками. */
    protected readonly shape: Signal<string> = computed((): string => {
        const labels: TRtKitLabelMap = this.t();
        return rtRangeShape(this.#layout(), {
            day: labels.uiShapeDay,
            month: labels.uiShapeMonth,
            year: labels.uiShapeYear,
            hour: labels.uiShapeHour,
            minute: labels.uiShapeMinute,
        });
    });
    /** Значение, прочитанное из формы: не пара дней по порядку поле показывает пустой. */
    protected readonly range: Signal<IRtDateRange.Value | null> = computed((): IRtDateRange.Value | null => rtRangeRead(this.value()));
    protected readonly text: Signal<string> = computed((): string => rtRangeText(this.range(), this.#layout()));

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.range() !== null);
    /** Ширина поля в знаках — по длине формы значения, как у поля даты. */
    protected readonly fieldSize: Signal<number> = computed((): number => this.shape().length);
    /** Подсказка обрезается многоточием в узком поле, поэтому шаблон целиком виден при наведении. */
    protected readonly shapeTitle: Signal<string | null> = computed((): string | null => (this.hasValue() ? null : this.shape()));

    /** Вид рамки: `outline` — рамка со всех сторон, `fill` — залитое поле с чертой снизу. */
    public readonly appearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('outline');

    public readonly displayText: Signal<string> = computed((): string => this.#format(this.range()));

    /** Первый допустимый день `YYYY-MM-DD`. */
    public readonly min: InputSignal<string | null> = input<string | null>(null);
    /** Последний допустимый день `YYYY-MM-DD`. */
    public readonly max: InputSignal<string | null> = input<string | null>(null);

    /** Значение из формы снимает ошибку набора: в поле теперь стоит оно. */
    public override writeValue(value: IRtDateRange.Value | null): void {
        super.writeValue(value);
        this.textInvalid.set(false);
    }

    protected getEmptyValue(): IRtDateRange.Value | null {
        return null;
    }

    protected focusAfterClear(): void {
        this.fieldEl()?.nativeElement.focus();
    }

    protected override clearValue(): void {
        super.clearValue();
        this.#accept(null);
    }

    /** Набор текста: значение меняется, только когда текст читается как диапазон в границах. */
    protected onTyped(event: Event): void {
        const text: string = (event.target as HTMLInputElement).value;
        if (text.trim() === '') {
            this.#commit(null);
            return;
        }
        const read: IRtDateRange.Value | null = rtRangeParse(text, this.#layout());
        if (read === null || !rtRangeInBounds(read, this.min(), this.max())) {
            this.textInvalid.set(true);
            return;
        }
        this.#commit(read);
    }

    /** Кнопка в конце поля: на узком экране открывает шторку, на широком поповер открывает сам. */
    protected openPanel(): void {
        if (this.narrow() && !this.isDisabled()) {
            this.sheetOpen.set(true);
        }
    }

    protected closePanel(): void {
        this.sheetOpen.set(false);
        this.popover()?.close();
    }

    protected onPicked(value: IRtDateRange.Value): void {
        this.#commit(value);
        this.markTouched();
    }

    protected onBlur(): void {
        this.markTouched();
    }

    #commit(value: IRtDateRange.Value | null): void {
        this.value.set(value);
        this.emitChange(value);
        this.#accept(value);
    }

    /** Текст в поле — принятое значение, ошибки набора нет. */
    #accept(value: IRtDateRange.Value | null): void {
        this.textInvalid.set(false);
        const node: HTMLInputElement | undefined = this.fieldEl()?.nativeElement;
        if (node !== undefined) {
            node.value = rtRangeText(value, this.#layout());
        }
    }

    /** Плоский текст для режима чтения: диапазон по локали, `15 – 20 мар. 2026 г.` под `ru`. */
    #format(range: IRtDateRange.Value | null): string {
        if (range === null) {
            return '';
        }
        return new Intl.DateTimeFormat(this.#locale(), { dateStyle: 'medium', timeZone: 'UTC' }).formatRange(
            Date.parse(range.start),
            Date.parse(range.end)
        );
    }
}
