import { NumberInput } from '@angular/cdk/coercion';
import {
    computed,
    forwardRef,
    inject,
    input,
    numberAttribute,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    LOCALE_ID,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '../../i18n';
import { BreakpointsService } from '../../platform';
import { RtBottomSheetComponent } from '../bottom-sheet/rt-bottom-sheet.component';
import { RtFormControlBase } from '../form-control/rt-form-control.base';
import { IRtIcon } from '../icon/rt-icon.model';
import { IRtInput } from '../input/rt-input.model';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtPopoverDirective } from '../popover/rt-popover.directive';
import { RtRadiusDirective } from '../radius/rt-radius.directive';
import { RtDatePanelComponent } from './panel/rt-date-panel.component';
import { rtDateInBounds, rtDateRead } from './rt-date-panel.logic';
import { IRtDatePicker } from './rt-date-picker.model';

const BEM_BLOCK: string = 'rt-date-picker';

/** Подсказка формы значения по типу — её же поле читает при наборе. */
const SHAPES: Readonly<Record<IRtDatePicker.Type, string>> = {
    date: 'YYYY-MM-DD',
    time: 'HH:mm',
    'datetime-local': 'YYYY-MM-DDTHH:mm',
};

/**
 * Поле даты, времени или даты со временем со своей панелью кита, визуально и по токенам
 * идентичное rt-input (host — box `--rt-input-*`, input — прозрачный `__field`). Кнопка в конце
 * поля открывает `rt-date-panel`: на широком экране в поповере, на узком — в нижней шторке.
 * CVA через общий `RtFormControlBase`: clearable, авто-подсветка invalid, read-only
 * представление (значение форматируется через Intl).
 *
 * `value` — строка формы нативного input'а (`YYYY-MM-DD`, `YYYY-MM-DDTHH:mm`, `HH:mm`). Текст
 * набирается в той же форме; нечитаемый или лежащий за границами оставляет значение прежним
 * и помечает поле ошибкой.
 */
@Component({
    selector: 'rt-date-picker',
    templateUrl: './rt-date-picker.component.html',
    styleUrls: ['./rt-date-picker.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtBottomSheetComponent,
        RtDatePanelComponent,
        RtIconButtonComponent,
        RtPopoverDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtDatePickerComponent) },
    ],
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    host: {
        class: BEM_BLOCK,
        '[class.rt-date-picker--disabled]': 'isDisabled()',
        '[class.rt-date-picker--invalid]': 'isInvalid() || textInvalid()',
        '[class.rt-date-picker--readonly]': 'isReadonly()',
        '[class.rt-date-picker--borderless]': '!bordered()',
        '[class.rt-date-picker--appearance--fill]': "appearance() === 'fill'",
        '[class.rt-date-picker--size--sm]': "size() === 'sm'",
        '[class.rt-date-picker--size--lg]': "size() === 'lg'",
    },
})
export class RtDatePickerComponent extends RtFormControlBase<string> {
    readonly #locale: string = inject(LOCALE_ID);

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);
    /** Узкий экран: панель открывается в нижней шторке, а не в поповере. */
    protected readonly narrow: Signal<boolean> = inject(BreakpointsService).narrow;

    protected readonly fieldEl: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild<ElementRef<HTMLInputElement>>('fieldEl');
    protected readonly popover: Signal<RtPopoverDirective | undefined> = viewChild(RtPopoverDirective);

    /** Набранный текст не читается как значение в границах: поле помечено ошибкой. */
    protected readonly textInvalid: WritableSignal<boolean> = signal(false);
    protected readonly sheetOpen: WritableSignal<boolean> = signal(false);
    protected readonly shape: Signal<string> = computed((): string => SHAPES[this.type()]);
    protected readonly openIcon: Signal<IRtIcon.Name> = computed((): IRtIcon.Name =>
        this.type() === 'time' ? 'ico-time' : 'ico-calendar'
    );

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value() !== '');
    /** Подсказка обрезается многоточием в узком поле, поэтому шаблон целиком виден при наведении. */
    /**
     * Ширина поля в знаках — по длине формы значения. Без неё текстовое поле берёт от браузера
     * двадцать знаков и в строке отборов потребителя занимает место вдвое шире значения.
     */
    protected readonly fieldSize: Signal<number> = computed((): number => this.shape().length);
    protected readonly shapeTitle: Signal<string | null> = computed((): string | null => (this.hasValue() ? null : this.shape()));

    /** Вид рамки: `outline` — рамка со всех сторон, `fill` — залитое поле с чертой снизу. */
    public readonly appearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('outline');

    public readonly displayText: Signal<string> = computed((): string => this.#format(this.value(), this.type()));

    public readonly type: InputSignal<IRtDatePicker.Type> = input<IRtDatePicker.Type>('date');
    public readonly min: InputSignal<string | null> = input<string | null>(null);
    public readonly max: InputSignal<string | null> = input<string | null>(null);
    /** Шаг колонки минут в панели. */
    public readonly minuteStep: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(5, {
        transform: numberAttribute,
    });

    /** Значение из формы снимает ошибку набора: в поле теперь стоит оно. */
    public override writeValue(value: string | null): void {
        super.writeValue(value);
        this.textInvalid.set(false);
    }

    protected getEmptyValue(): string {
        return '';
    }

    protected focusAfterClear(): void {
        this.fieldEl()?.nativeElement.focus();
    }

    protected override clearValue(): void {
        super.clearValue();
        this.#accept('');
    }

    /** Набор текста: значение меняется, только когда текст читается как значение в границах. */
    protected onTyped(event: Event): void {
        const text: string = (event.target as HTMLInputElement).value;
        if (text.trim() === '') {
            this.#commit('');
            return;
        }
        const read: string | null = rtDateRead(text, this.type());
        if (read === null || !rtDateInBounds(read, this.min(), this.max())) {
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

    protected onPicked(value: string): void {
        this.#commit(value);
        this.markTouched();
    }

    protected onBlur(): void {
        this.markTouched();
    }

    #commit(value: string): void {
        this.value.set(value);
        this.emitChange(value);
        this.#accept(value);
    }

    /** Текст в поле — принятое значение, ошибки набора нет. */
    #accept(value: string): void {
        this.textInvalid.set(false);
        const node: HTMLInputElement | undefined = this.fieldEl()?.nativeElement;
        if (node !== undefined) {
            node.value = value;
        }
    }

    /**
     * Форматирует ISO-значение нативного input'а в локализованный текст для
     * read-only. Для `time` форматируем как сегодняшнюю дату с временем (нужен
     * валидный Date), показывая только часы/минуты.
     */
    #format(value: string, type: IRtDatePicker.Type): string {
        if (value === '') {
            return '';
        }
        const parsed: number = Date.parse(type === 'time' ? `1970-01-01T${value}` : value);
        if (Number.isNaN(parsed)) {
            return value;
        }
        return new Intl.DateTimeFormat(this.#locale, this.#formatOptions(type)).format(new Date(parsed));
    }

    #formatOptions(type: IRtDatePicker.Type): Intl.DateTimeFormatOptions {
        if (type === 'time') {
            return { hour: '2-digit', minute: '2-digit' };
        }
        if (type === 'datetime-local') {
            return { dateStyle: 'medium', timeStyle: 'short' };
        }
        return { dateStyle: 'medium' };
    }
}
