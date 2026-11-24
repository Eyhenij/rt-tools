import { NumberInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    forwardRef,
    inject,
    input,
    numberAttribute,
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
import { RtFormControlBase, rtBoundOrNull } from '@rt-tools/ui-kit-v2/form-control';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { IRtInput } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RT_POPOVER_SHEET, RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { RtDatePanelComponent } from './panel/rt-date-panel.component';
import { rtDateInBounds } from './rt-date-panel.logic';
import { IRtDatePicker } from './rt-date-picker.model';
import { RT_DATE_SHAPE_MASK, rtDateLayout, rtDateParse, rtDateShape, rtDateText } from './rt-date-text.logic';

type TBooleanInput = boolean | string;

const BEM_BLOCK: string = 'rt-date-picker';

/**
 * Поле даты, времени или даты со временем со своей панелью кита, визуально и по токенам
 * идентичное rt-input (host — box `--rt-input-*`, input — прозрачный `__field`). Кнопка в конце
 * поля открывает `rt-date-panel`: на широком экране в поповере, на узком — в нижней шторке.
 * CVA через общий `RtFormControlBase`: clearable, авто-подсветка invalid, read-only
 * представление (значение форматируется через Intl).
 *
 * `value` — строка формы нативного input'а (`YYYY-MM-DD`, `YYYY-MM-DDTHH:mm`, `HH:mm`). Текст в
 * поле — дата в порядке языка интерфейса (`01.08.2026` под `ru`), время `HH:mm`; набирается так же,
 * вставленная форма значения тоже читается. Нечитаемый или лежащий за границами текст оставляет
 * значение прежним и помечает поле ошибкой.
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
        RtButtonDirective,
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
    /**
     * Панель в шторке: кнопка в шапке шторки зовёт её и читает, есть ли что применять.
     */
    protected readonly sheetPanel: Signal<RtDatePanelComponent | undefined> = viewChild<RtDatePanelComponent>('sheetPanel');

    /** Набранный текст не читается как значение в границах: поле помечено ошибкой. */
    protected readonly textInvalid: WritableSignal<boolean> = signal(false);
    protected readonly sheetOpen: WritableSignal<boolean> = signal(false);
    /** Подсказка формы текста маской из чёрточек: `--.--.----` в порядке языка интерфейса. */
    protected readonly shape: Signal<string> = computed((): string => rtDateShape(this.type(), this.#layout(), RT_DATE_SHAPE_MASK));
    /**
     * Текст в поле — значение в порядке языка интерфейса. Не строку форма кладёт мимо контракта
     * (например `Date`), и поле показывает её пустой, как показывало браузерное.
     */
    protected readonly text: Signal<string> = computed((): string => this.#text(this.value()));
    protected readonly openIcon: Signal<IRtIcon.Name> = computed((): IRtIcon.Name => (this.type() === 'time' ? 'ico-time' : 'calendar-2'));

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value() !== '');
    /**
     * Ширина поля в знаках — по длине формы значения. Без неё текстовое поле берёт от браузера
     * двадцать знаков и в строке отборов потребителя занимает место вдвое шире значения.
     */
    protected readonly fieldSize: Signal<number> = computed((): number => this.shape().length);
    /** Подсказка обрезается многоточием в узком поле, поэтому шаблон целиком виден при наведении. */
    protected readonly shapeTitle: Signal<string | null> = computed((): string | null => (this.hasValue() ? null : this.shape()));

    /** Вид рамки: `outline` — рамка со всех сторон, `fill` — залитое поле с чертой снизу. */
    public readonly appearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('outline');

    public readonly displayText: Signal<string> = computed((): string => this.#format(this.value(), this.type()));

    public readonly type: InputSignal<IRtDatePicker.Type> = input<IRtDatePicker.Type>('date');
    /** На узком экране панель открывается в нижней шторке; `false` оставляет поповер у поля. */
    public readonly sheet: InputSignalWithTransform<boolean, TBooleanInput> = input<boolean, TBooleanInput>(true, {
        transform: booleanAttribute,
    });
    /** Первый допустимый день. `undefined` — сигнальная форма не задала границу: границы нет. */
    public readonly min: InputSignalWithTransform<string | null, string | null | undefined> = input<
        string | null,
        string | null | undefined
    >(null, { transform: rtBoundOrNull });
    /** Последний допустимый день. `undefined` — сигнальная форма не задала границу: границы нет. */
    public readonly max: InputSignalWithTransform<string | null, string | null | undefined> = input<
        string | null,
        string | null | undefined
    >(null, { transform: rtBoundOrNull });
    /** Шаг колонки минут в панели. */
    public readonly minuteStep: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(5, {
        transform: numberAttribute,
    });
    /**
     * С какого времени барабан шторки начинает у поля без времени: `now` — с текущего, `midnight` —
     * с `00:00`. У списков поля на широком экране время до выбора пусто.
     */
    public readonly timeStart: InputSignal<IRtDatePicker.TimeStart> = input<IRtDatePicker.TimeStart>('now');

    /**
     * Смена значения человеком: выбор в панели, набор текста, крестик. Несёт ту же строку, что уходит
     * в форму; на `writeValue` и на модель формы, заданную снаружи, не испускается.
     */
    public readonly selectionChange: OutputEmitterRef<string> = output<string>();

    /**
     * Значение из формы снимает ошибку набора. Когда его текст другой, чем у прежнего значения, он
     * пишется в поле сам, а не привязкой: форма может вернуть прежнее значение после того, как
     * человек набрал другое, и привязка, чей текст не менялся, поле бы не тронула. Значение с тем же
     * текстом недонабранное не стирает.
     */
    public override writeValue(value: string | null): void {
        const shown: string = this.text();
        super.writeValue(value);
        this.textInvalid.set(false);
        if (this.text() !== shown) {
            this.#accept(this.value());
        }
    }

    protected getEmptyValue(): string {
        return '';
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
        this.#accept('');
    }

    /** Набор текста: значение меняется, только когда текст читается как значение в границах. */
    protected onTyped(event: Event): void {
        const text: string = (event.target as HTMLInputElement).value;
        if (text.trim() === '') {
            this.#commit('');
            return;
        }
        const read: string | null = rtDateParse(text, this.type(), this.#layout());
        if (read === null || !rtDateInBounds(read, this.min(), this.max())) {
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

    protected onPicked(value: string): void {
        this.#commit(value);
        this.markTouched();
    }

    protected onBlur(): void {
        this.markTouched();
    }

    #commit(value: string): void {
        this.value.set(value);
        // Текст принимается до формы и события: подписчик формы или обработчик события, вернувший
        // другое значение, пишет его текст в поле последним.
        this.#accept(value);
        this.emitChange(value);
        this.selectionChange.emit(value);
    }

    /** Текст в поле — принятое значение, ошибки набора нет. */
    #accept(value: string): void {
        this.textInvalid.set(false);
        const node: HTMLInputElement | undefined = this.fieldEl()?.nativeElement;
        if (node !== undefined) {
            node.value = this.#text(value);
        }
    }

    #text(value: unknown): string {
        return typeof value === 'string' ? rtDateText(value, this.type(), this.#layout()) : '';
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
        return new Intl.DateTimeFormat(this.#locale(), this.#formatOptions(type)).format(new Date(parsed));
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
