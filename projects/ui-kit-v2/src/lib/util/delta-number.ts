/**
 * Запись дельты к базе по языку кита — одна для плитки и для копии ответа, чтобы скопированная
 * строка читалась так же, как нарисованная.
 */

/** Единица дельты: проценты к базе или процентные пункты. */
export type TRtDeltaUnit = 'percent' | 'points';

/** Направление записанной дельты. */
export type TRtDeltaDirection = 'up' | 'down' | 'flat';

/** Записанное число дельты и его направление. */
export interface IRtDeltaNumber {
    /** Проценты — как язык пишет процент («+12,5 %»), пункты — числом для подписи пунктов («+2,5»). */
    readonly text: string;
    readonly direction: TRtDeltaDirection;
}

/** Язык, которым пишется дельта, когда язык кита `Intl` не принимает. */
const FALLBACK_LOCALE: string = 'en';

/** Плюс на росте, минус языка на падении, без знака у записанного нуля; не больше одного дробного знака. */
const DELTA_OPTIONS: Intl.NumberFormatOptions = { maximumFractionDigits: 1, signDisplay: 'exceptZero' };

function deltaFormat(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
    try {
        return new Intl.NumberFormat(locale, options);
    } catch {
        return new Intl.NumberFormat(FALLBACK_LOCALE, options);
    }
}

/**
 * Дельта по языку кита. Направление берётся из записанного числа, а не из присланного: 0.04 и
 * -0.04 записаны «0 %», и стрелка, знак и цвет у них ровные.
 */
export function rtDeltaNumber(value: number, unit: TRtDeltaUnit, locale: string): IRtDeltaNumber {
    const parts: Intl.NumberFormatPart[] =
        unit === 'points'
            ? deltaFormat(locale, DELTA_OPTIONS).formatToParts(value)
            : deltaFormat(locale, { ...DELTA_OPTIONS, style: 'percent' }).formatToParts(value / 100);
    const text: string = parts.map((part: Intl.NumberFormatPart): string => part.value).join('');

    if (parts.some((part: Intl.NumberFormatPart): boolean => part.type === 'plusSign')) {
        return { text, direction: 'up' };
    }

    return { text, direction: parts.some((part: Intl.NumberFormatPart): boolean => part.type === 'minusSign') ? 'down' : 'flat' };
}
