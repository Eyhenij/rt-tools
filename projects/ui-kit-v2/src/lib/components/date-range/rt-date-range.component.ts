import {
    booleanAttribute,
    computed,
    forwardRef,
    inject,
    input,
    output,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RT_KIT_LOCALE, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { BreakpointsService } from '@rt-tools/ui-kit-v2/core';
import { RtBottomSheetComponent } from '@rt-tools/ui-kit-v2/bottom-sheet';
import { IRtDatePicker } from '@rt-tools/ui-kit-v2/date-picker';
import { RT_DATE_SHAPE_MASK, rtDateLayout } from '@rt-tools/ui-kit-v2/date-picker';
import { RtFormControlBase, rtDayBoundOrNull } from '@rt-tools/ui-kit-v2/form-control';
import { IRtInput } from '@rt-tools/ui-kit-v2/core';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RT_POPOVER_SHEET, RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { RtDateRangePanelComponent } from './panel/rt-date-range-panel.component';
import { rtRangeInBounds, rtRangeParse, rtRangeRead, rtRangeShape, rtRangeText } from './rt-date-range.logic';
import { IRtDateRange } from './rt-date-range.model';

type TBooleanInput = boolean | string;

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
    /** Корень поля: поповер встаёт по его краю, а не по кнопке календаря внутри него. */
    protected readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    /** Узкий экран: панель открывается в нижней шторке, а не в поповере. */
    protected readonly phone: Signal<boolean> = inject(BreakpointsService).phone;
    /** Приложение разрешает шторку токеном `RT_POPOVER_SHEET` (по умолчанию да); `false` оставляет поповер у поля везде под ним. */
    readonly #sheetAllowed: boolean = inject(RT_POPOVER_SHEET);
    /** Шторка включена входом `sheet`, токеном и экраном телефона (`BreakpointsService.phone`, до 480 px); иначе панель открывается поповером у поля. */
    protected readonly useSheet: Signal<boolean> = computed((): boolean => this.#sheetAllowed && this.phone() && this.sheet());

    protected readonly fieldEl: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild<ElementRef<HTMLInputElement>>('fieldEl');
    protected readonly popover: Signal<RtPopoverDirective | undefined> = viewChild(RtPopoverDirective);

    /** Набранный текст не читается как диапазон в границах: поле помечено ошибкой. */
    protected readonly textInvalid: WritableSignal<boolean> = signal(false);
    protected readonly sheetOpen: WritableSignal<boolean> = signal(false);
    /** Подсказка формы текста маской из чёрточек: `--.--.---- — --.--.----` в порядке языка интерфейса. */
    protected readonly shape: Signal<string> = computed((): string => rtRangeShape(this.#layout(), RT_DATE_SHAPE_MASK));
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

    /** На узком экране панель открывается в нижней шторке; `false` оставляет поповер у поля. */
    public readonly sheet: InputSignalWithTransform<boolean, TBooleanInput> = input<boolean, TBooleanInput>(true, {
        transform: booleanAttribute,
    });
    /**
     * Первый допустимый день `YYYY-MM-DD`. Сигнальная форма типизирует границу поля типом его
     * значения и пишет `undefined`, когда границу не задала: и это, и диапазон — границы нет.
     */
    public readonly min: InputSignalWithTransform<string | null, IRtDateRange.Bound> = input<string | null, IRtDateRange.Bound>(null, {
        transform: rtDayBoundOrNull,
    });
    /** Последний допустимый день `YYYY-MM-DD`; чтение — как у `min`. */
    public readonly max: InputSignalWithTransform<string | null, IRtDateRange.Bound> = input<string | null, IRtDateRange.Bound>(null, {
        transform: rtDayBoundOrNull,
    });

    /**
     * Смена значения человеком: выбор в панели, набор текста, крестик. Несёт то же значение, что
     * уходит в форму; на `writeValue` и на модель формы, заданную снаружи, не испускается.
     */
    public readonly selectionChange: OutputEmitterRef<IRtDateRange.Value | null> = output<IRtDateRange.Value | null>();

    /**
     * Значение из формы снимает ошибку набора. Когда его текст другой, чем у прежнего значения, он
     * пишется в поле сам, а не привязкой: форма может вернуть прежнее значение после того, как
     * человек набрал другое, и привязка, чей текст не менялся, поле бы не тронула. Значение с тем же
     * текстом недонабранное не стирает.
     */
    public override writeValue(value: IRtDateRange.Value | null): void {
        const shown: string = this.text();
        super.writeValue(value);
        this.textInvalid.set(false);
        if (this.text() !== shown) {
            this.#accept(this.range());
        }
    }

    protected getEmptyValue(): IRtDateRange.Value | null {
        return null;
    }

    protected focusAfterClear(): void {
        this.fieldEl()?.nativeElement.focus();
    }

    /** Крестик: событие несёт значение поля после очистки — то же, что ушло в форму. */
    protected override clear(event?: Event): void {
        if (this.isDisabled()) {
            return;
        }
        super.clear(event);
        this.selectionChange.emit(this.value());
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
        if (this.useSheet() && !this.isDisabled()) {
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
        // Текст принимается до формы и события: подписчик формы или обработчик события, вернувший
        // другое значение, пишет его текст в поле последним.
        this.#accept(value);
        this.emitChange(value);
        this.selectionChange.emit(value);
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
