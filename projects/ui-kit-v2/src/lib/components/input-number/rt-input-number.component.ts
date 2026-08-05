import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    forwardRef,
    inject,
    input,
    InputSignal,
    LOCALE_ID,
    Signal,
    signal,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtFormControlBase } from '../form-control/rt-form-control.base';
import { RtIconComponent, IRtIcon } from '../icon';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';

const BEM_BLOCK: string = 'rt-input-number';

/**
 * Парсит строку в `number | null`. Принимает `,` или `.` как decimal
 * separator. Все пробелы (включая неразрывный) удаляются — нужно чтобы
 * сгруппированное по разрядам отображение (`1 234,56`) парсилось обратно.
 * Пустая строка / NaN → null.
 */
function parseNumber(text: string): number | null {
    const cleaned: string = text.replace(/\s/g, '').replace(',', '.');
    if (cleaned === '') {
        return null;
    }
    const parsed: number = parseFloat(cleaned);
    return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Клампит `value` в диапазон `[min, max]`. `null` границы игнорируются —
 * соответствующая сторона остаётся неограниченной.
 */
function clamp(value: number, min: number | null, max: number | null): number {
    let result: number = value;
    if (min !== null && result < min) {
        result = min;
    }
    if (max !== null && result > max) {
        result = max;
    }
    return result;
}

/**
 * Форматирует `number | null` в строку с группировкой разрядов (неразрывный
 * пробел) и заданным fractionDigits diapason. `value === null` → "".
 * `maxFractionDigits` ограничивается сверху 20 (лимит Intl). Итоговый
 * precision = `max(min, min(max, 20))` и фиксирует одинаковую нижнюю/верхнюю
 * границу дробной части (как прежний `toFixed`), меняется только группировка
 * и десятичный разделитель — их даёт `locale`.
 */
function formatNumber(value: number | null, minFractionDigits: number, maxFractionDigits: number, locale: string): string {
    if (value === null) {
        return '';
    }
    const cappedMax: number = Math.min(maxFractionDigits, 20);
    const precision: number = Math.min(20, Math.max(minFractionDigits, cappedMax));
    return value.toLocaleString(locale, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
        useGrouping: true,
    });
}

/**
 * Numeric input с parse/format/clamp logic. Использует native
 * `<input type="text" inputmode="decimal">` (НЕ `type="number"` — избегаем
 * browser spinner quirks: scroll-wheel value changes, locale-specific decimal
 * separators, inconsistent step rounding).
 *
 * CVA через общий `RtFormControlBase` — авто-подсветка invalid, `clearable`
 * (крестик при непустом display). Parser принимает `,`/`.`, невалидный ввод
 * (NaN) не эмитится во время набора; на blur невалидное → null, валидное —
 * clamp + format.
 *
 * Визуально и по токенам идентичен rt-input (`--rt-input-*`): host — box,
 * `<input>` — прозрачный `__field`.
 */
@Component({
    selector: 'rt-input-number',
    templateUrl: './rt-input-number.component.html',
    styleUrl: './rt-input-number.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconButtonComponent,
        RtIconComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
        TranslocoPipe,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtInputNumberComponent) },
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-input-number--disabled]': 'isDisabled()',
        '[class.rt-input-number--invalid]': 'isInvalid()',
        '[class.rt-input-number--readonly]': 'isReadonly()',
        '[class.rt-input-number--borderless]': '!bordered()',
        '[class.rt-input-number--size--sm]': "size() === 'sm'",
        '[class.rt-input-number--size--lg]': "size() === 'lg'",
        '(mousedown)': 'onHostMousedown($event)',
    },
})
export class RtInputNumberComponent extends RtFormControlBase<number | null> {
    readonly #locale: string = inject(LOCALE_ID);

    // Символ группировки разрядов из локали (для ru — неразрывный пробел). Берём
    // тот же, что отдаёт toLocaleString на blur — тогда live и blur выглядят
    // одинаково, а parseNumber (стрипает \s) парсит обратно обе формы.
    readonly #groupSep: string = (1000).toLocaleString(this.#locale).replace(/\d/g, '') || ' ';

    protected readonly fieldEl: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild<ElementRef<HTMLInputElement>>('fieldEl');

    protected readonly displayValue: WritableSignal<string> = signal<string>('');

    // Крестик показываем только при непустом и ненулевом значении: 0 — это и
    // есть результат очистки, поэтому при нём кнопка сброса не нужна.
    protected readonly hasValue: Signal<boolean> = computed(
        (): boolean => this.displayValue() !== '' && this.value() !== null && this.value() !== 0
    );

    public readonly displayText: Signal<string> = computed((): string => this.displayValue());

    public readonly iconLeft: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);
    /** Текстовый префикс слева от значения (напр. «₽» для рублёвых сумм). */
    public readonly prefix: InputSignal<string | null> = input<string | null>(null);
    public readonly placeholder: InputSignal<string> = input<string>('');
    public readonly min: InputSignal<number | null> = input<number | null>(null);
    public readonly max: InputSignal<number | null> = input<number | null>(null);
    public readonly minFractionDigits: InputSignal<number> = input<number>(0);
    public readonly maxFractionDigits: InputSignal<number> = input<number>(2);

    public override writeValue(value: number | null): void {
        super.writeValue(value);
        this.displayValue.set(formatNumber(this.value(), this.minFractionDigits(), this.maxFractionDigits(), this.#locale));
    }

    protected getEmptyValue(): number | null {
        return null;
    }

    protected focusAfterClear(): void {
        this.fieldEl()?.nativeElement.focus();
    }

    /**
     * Падинг/гэп рамки принадлежат host-контейнеру, а не `<input>`, поэтому клик
     * по этой зоне сам по себе не фокусирует поле. Перехватываем mousedown и
     * переводим фокус в input — но только если клик не пришёлся на само поле
     * (там нужно нативное позиционирование курсора) и не на интерактивный
     * постфикс (крестик-очистка со своим обработчиком).
     */
    protected onHostMousedown(event: MouseEvent): void {
        if (this.isDisabled()) {
            return;
        }
        const field: HTMLInputElement | undefined = this.fieldEl()?.nativeElement;
        const target: HTMLElement = event.target as HTMLElement;
        if (!field || target === field || target.closest('button, rt-icon-button')) {
            return;
        }
        event.preventDefault();
        field.focus();
    }

    /**
     * Крестик сбрасывает поле не в пустое/null, а в 0 — отформатированный по
     * текущему fractionDigits (например `0,00`). Числовые поля всегда имеют
     * осмысленный ноль, поэтому «очистка» = обнуление, а не пустое значение.
     */
    protected override clearValue(): void {
        this.value.set(0);
        this.displayValue.set(formatNumber(0, this.minFractionDigits(), this.maxFractionDigits(), this.#locale));
    }

    protected onInput(event: Event): void {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const raw: string = target.value;
        const caret: number = target.selectionStart ?? raw.length;

        // Live-группировка разрядов прямо во время набора (1000000 → 1 000 000).
        const formatted: string = this.#groupDisplay(raw);
        const nextCaret: number = this.#restoreCaret(raw, caret, formatted);

        // Пишем value императивно ДО Angular CD: тогда повторная запись биндинга
        // `[value]` будет той же строкой и не сбросит каретку в конец. Затем
        // восстанавливаем позицию по числу значимых символов слева от курсора.
        target.value = formatted;
        target.setSelectionRange(nextCaret, nextCaret);
        this.displayValue.set(formatted);

        const parsed: number | null = parseNumber(formatted);
        if (parsed === null) {
            // Только реально пустой ввод → emit null (пользователь очистил поле).
            // Нечисловой ввод стрипается из отображения, но prev value держится до
            // blur — поэтому проверяем исходный `raw`, а не очищенный `formatted`.
            if (raw.trim() === '') {
                this.value.set(null);
                this.emitChange(null);
            }
            return;
        }
        this.value.set(parsed);
        this.emitChange(parsed);
    }

    protected onBlur(): void {
        const parsed: number | null = parseNumber(this.displayValue());
        if (parsed === null) {
            this.value.set(null);
            this.displayValue.set('');
            this.emitChange(null);
            this.markTouched();
            return;
        }
        const clamped: number = clamp(parsed, this.min(), this.max());
        const formatted: string = formatNumber(clamped, this.minFractionDigits(), this.maxFractionDigits(), this.#locale);
        // `formatted` содержит пробелы-разделители и запятую — обратный парс
        // через parseNumber (а не parseFloat) даёт округлённое числовое значение.
        const rounded: number = parseNumber(formatted) ?? clamped;
        this.value.set(rounded);
        this.displayValue.set(formatted);
        this.emitChange(rounded);
        this.markTouched();
    }

    /**
     * Live-форматирование строки во время набора: целая часть группируется по
     * разрядам (`#groupSep`), дробная остаётся как набрана (хвостовая запятая и
     * нули сохраняются, чтобы их можно было дописать). Десятичный разделитель
     * всегда допускается — округление по `maxFractionDigits` происходит на blur
     * (поэтому в целочисленном поле «1000,5» парсится и округлится, а не склеится
     * в «10005»). Группировка — линейным проходом, а не `Number()`, чтобы не
     * терять точность на суммах длиннее 2^53.
     */
    #groupDisplay(raw: string): string {
        const negative: boolean = raw.trimStart().startsWith('-');

        let sep: string = '';
        let fracDigits: string = '';
        let intDigits: string;

        const sepIndex: number = raw.search(/[.,]/);
        if (sepIndex >= 0) {
            sep = raw.charAt(sepIndex);
            intDigits = raw.slice(0, sepIndex).replace(/\D/g, '');
            fracDigits = raw.slice(sepIndex + 1).replace(/\D/g, '');
        } else {
            intDigits = raw.replace(/\D/g, '');
        }

        // Ведущие нули убираем, но сохраняем один «0» перед десятичным разделителем.
        intDigits = intDigits.replace(/^0+(?=\d)/, '');

        let intPart: string;
        if (intDigits === '') {
            intPart = sep === '' ? '' : '0';
        } else {
            intPart = this.#groupInteger(intDigits);
        }

        let out: string = negative ? `-${intPart}` : intPart;
        if (sep !== '') {
            out += sep + fracDigits;
        }
        return out;
    }

    /**
     * Группирует строку цифр по три справа налево, вставляя `#groupSep`. Без
     * регэкспа намеренно — `(\d{3})+`-lookahead флагуется как ReDoS-уязвимый, а
     * линейный проход и быстрее, и безопасен.
     */
    #groupInteger(digits: string): string {
        const length: number = digits.length;
        let out: string = '';
        for (let i: number = 0; i < length; i++) {
            if (i > 0 && (length - i) % 3 === 0) {
                out += this.#groupSep;
            }
            out += digits.charAt(i);
        }
        return out;
    }

    /**
     * Пересчитывает позицию каретки после вставки разделителей разрядов: считает
     * значимые символы (цифры и десятичный разделитель — не group-separator)
     * слева от старой каретки и находит ту же точку в новой строке. Иначе курсор
     * прыгал бы в конец при каждом вставленном пробеле.
     */
    #restoreCaret(raw: string, caret: number, formatted: string): number {
        const isAnchor: (ch: string) => boolean = (ch: string): boolean => /[\d.,]/.test(ch);

        let need: number = 0;
        for (let i: number = 0; i < caret && i < raw.length; i++) {
            if (isAnchor(raw.charAt(i))) {
                need++;
            }
        }
        if (need === 0) {
            return formatted.startsWith('-') ? 1 : 0;
        }

        let seen: number = 0;
        let pos: number = 0;
        while (pos < formatted.length) {
            if (isAnchor(formatted.charAt(pos))) {
                seen++;
                if (seen === need) {
                    pos++;
                    break;
                }
            }
            pos++;
        }
        return pos;
    }
}
