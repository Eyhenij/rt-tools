import {
    computed,
    forwardRef,
    inject,
    input,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    LOCALE_ID,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RtKitLabelMap } from '../../i18n';
import { RtFormControlBase } from '../form-control/rt-form-control.base';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { IRtDatePicker } from './rt-date-picker.model';

const BEM_BLOCK: string = 'rt-date-picker';

/**
 * Date/time picker на нативном `<input type="date"|"datetime-local"|"time">`,
 * визуально и по токенам идентичный rt-input (host — box `--rt-input-*`, input —
 * прозрачный `__field`). Календарь/часы — нативные браузерные (без сторонних
 * библиотек). CVA через общий `RtFormControlBase`: clearable, авто-подсветка
 * invalid, read-only представление (значение форматируется через Intl).
 *
 * `value` — ISO-строка, которую отдаёт нативный input (`YYYY-MM-DD`,
 * `YYYY-MM-DDTHH:mm`, `HH:mm`).
 */
@Component({
    selector: 'rt-date-picker',
    templateUrl: './rt-date-picker.component.html',
    styleUrls: ['./rt-date-picker.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconButtonComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtDatePickerComponent) },
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-date-picker--disabled]': 'isDisabled()',
        '[class.rt-date-picker--invalid]': 'isInvalid()',
        '[class.rt-date-picker--readonly]': 'isReadonly()',
        '[class.rt-date-picker--borderless]': '!bordered()',
        '[class.rt-date-picker--size--sm]': "size() === 'sm'",
        '[class.rt-date-picker--size--lg]': "size() === 'lg'",
    },
})
export class RtDatePickerComponent extends RtFormControlBase<string> {
    readonly #locale: string = inject(LOCALE_ID);

    protected readonly t: Signal<RtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly fieldEl: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild<ElementRef<HTMLInputElement>>('fieldEl');

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value() !== '');

    public readonly displayText: Signal<string> = computed((): string => this.#format(this.value(), this.type()));

    public readonly type: InputSignal<IRtDatePicker.Type> = input<IRtDatePicker.Type>('date');
    public readonly min: InputSignal<string | null> = input<string | null>(null);
    public readonly max: InputSignal<string | null> = input<string | null>(null);

    protected getEmptyValue(): string {
        return '';
    }

    protected focusAfterClear(): void {
        this.fieldEl()?.nativeElement.focus();
    }

    protected onInput(event: Event): void {
        const next: string = (event.target as HTMLInputElement).value;
        this.value.set(next);
        this.emitChange(next);
    }

    protected onBlur(): void {
        this.markTouched();
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
