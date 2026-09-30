import { ERtCalendarDayState, IRtCalendar } from '../calendar/rt-calendar.model';
import { rtDateAddMonths, rtDateInBounds, rtDateMonth, rtDateRead } from '../date-picker/rt-date-panel.logic';
import { IRtDatePicker } from '../date-picker/rt-date-picker.model';
import { rtDateParse, rtDateShape, rtDateText } from '../date-picker/rt-date-text.logic';
import { ERtDateRangePreset, IRtDateRange } from './rt-date-range.model';

/**
 * Чистая логика поля диапазона дат: порядок двух дней, состояния дней месяца, быстрые варианты,
 * итог и текст поля. Сегодняшний день приходит параметром — компонент читает часы сам.
 *
 * Дни — строки `YYYY-MM-DD`: строки одной формы сравниваются как текст в порядке дат.
 */

const DAY_LENGTH_MS: number = 86_400_000;
const DAY_LEN: number = 10;
const MONTH_LEN: number = 7;
const YEAR_LEN: number = 4;
const LAST_WEEK_DAYS: number = 7;
const LAST_MONTH_DAYS: number = 30;
/** Знак между датами в тексте поля. */
const DASH: string = ' — ';
/** Тире между датами набранного текста: длинное или короткое, дефис — только между пробелами. */
const DASH_RE: RegExp = /[—–]|\s-\s/;

function dayToMs(day: string): number {
    const [y, m, d]: number[] = day.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
}

function msToDay(ms: number): string {
    return new Date(ms).toISOString().slice(0, DAY_LEN);
}

function addDays(day: string, delta: number): string {
    return msToDay(dayToMs(day) + delta * DAY_LENGTH_MS);
}

function lastDayOf(month: string): string {
    return addDays(`${rtDateAddMonths(month, 1)}-01`, -1);
}

function dayState(day: string, low: string | null, high: string | null): ERtCalendarDayState {
    if (high === null || low === high) {
        return day === low ? ERtCalendarDayState.Chosen : ERtCalendarDayState.Free;
    }
    if (day === low) {
        return ERtCalendarDayState.Start;
    }
    if (day === high) {
        return ERtCalendarDayState.End;
    }
    const ms: number = dayToMs(day);
    return low !== null && ms > dayToMs(low) && ms < dayToMs(high) ? ERtCalendarDayState.InRange : ERtCalendarDayState.Free;
}

/** Два дня по порядку: второй раньше первого — они меняются местами. */
export function rtRangeOrder(a: string, b: string): IRtDateRange.Value {
    return dayToMs(a) <= dayToMs(b) ? { start: a, end: b } : { start: b, end: a };
}

/** Значение поля из того, что пришло из формы; не пара дней по порядку — `null`. */
export function rtRangeRead(value: unknown): IRtDateRange.Value | null {
    if (typeof value !== 'object' || value === null) {
        return null;
    }
    const start: unknown = Reflect.get(value, 'start');
    const end: unknown = Reflect.get(value, 'end');
    if (typeof start !== 'string' || typeof end !== 'string') {
        return null;
    }
    const ok: boolean = rtDateRead(start, 'date') !== null && rtDateRead(end, 'date') !== null && dayToMs(start) <= dayToMs(end);
    return ok ? { start, end } : null;
}

/** Диапазон лежит в границах целиком. */
export function rtRangeInBounds(range: IRtDateRange.Value, min: string | null, max: string | null): boolean {
    return rtDateInBounds(range.start, min, max) && rtDateInBounds(range.end, min, max);
}

/**
 * Месяц `YYYY-MM` для календаря: дни черновика — начало, конец и дни между ними. Пока выбрано только
 * начало, будущий диапазон тянется до дня под указателем, и этот день светлый, как дни между краями:
 * залит только выбранный край.
 */
export function rtRangeMonth(month: string, ctx: IRtDateRange.MonthContext): IRtCalendar.Month {
    const base: IRtCalendar.Month = rtDateMonth(month, { locale: ctx.locale, today: ctx.today, chosen: null, min: ctx.min, max: ctx.max });
    const other: string | null = ctx.end ?? ctx.hover;
    const range: IRtDateRange.Value | null = ctx.start === null || other === null ? null : rtRangeOrder(ctx.start, other);
    const low: string | null = range?.start ?? ctx.start;
    const high: string | null = range?.end ?? null;
    const preview: string | null = ctx.end === null && ctx.hover !== ctx.start ? ctx.hover : null;
    return {
        ...base,
        days: base.days.map((day: IRtCalendar.Day): IRtCalendar.Day => {
            const state: ERtCalendarDayState = dayState(day.key, low, high);
            return { ...day, state: day.key === preview ? ERtCalendarDayState.InRange : state };
        }),
    };
}

/** Диапазоны быстрых вариантов от сегодняшнего дня. */
export function rtRangePresets(today: string): Readonly<Record<ERtDateRangePreset, IRtDateRange.Value>> {
    const month: string = today.slice(0, MONTH_LEN);
    const lastMonth: string = rtDateAddMonths(month, -1);
    const yesterday: string = addDays(today, -1);
    return {
        [ERtDateRangePreset.Today]: { start: today, end: today },
        [ERtDateRangePreset.Yesterday]: { start: yesterday, end: yesterday },
        [ERtDateRangePreset.Last7]: { start: addDays(today, 1 - LAST_WEEK_DAYS), end: today },
        [ERtDateRangePreset.Last30]: { start: addDays(today, 1 - LAST_MONTH_DAYS), end: today },
        [ERtDateRangePreset.ThisMonth]: { start: `${month}-01`, end: today },
        [ERtDateRangePreset.LastMonth]: { start: `${lastMonth}-01`, end: lastDayOf(lastMonth) },
    };
}

/** Быстрые варианты в порядке панели; вариант, не лежащий в границах целиком, выключен. */
export function rtRangePresetCells(today: string, min: string | null, max: string | null): IRtDateRange.PresetCell[] {
    const ranges: Readonly<Record<ERtDateRangePreset, IRtDateRange.Value>> = rtRangePresets(today);
    return Object.values(ERtDateRangePreset).map((preset: ERtDateRangePreset): IRtDateRange.PresetCell => ({
        preset,
        range: ranges[preset],
        disabled: !rtRangeInBounds(ranges[preset], min, max),
    }));
}

/** Вариант, чей диапазон совпадает с черновиком; иначе `null`. */
export function rtRangePresetOf(range: IRtDateRange.Value | null, today: string): ERtDateRangePreset | null {
    if (range === null) {
        return null;
    }
    const ranges: Readonly<Record<ERtDateRangePreset, IRtDateRange.Value>> = rtRangePresets(today);
    const found: ERtDateRangePreset | undefined = Object.values(ERtDateRangePreset).find(
        (preset: ERtDateRangePreset): boolean => ranges[preset].start === range.start && ranges[preset].end === range.end
    );
    return found ?? null;
}

/** Число дней диапазона, оба края включены. */
export function rtRangeDays(range: IRtDateRange.Value): number {
    return Math.round((dayToMs(range.end) - dayToMs(range.start)) / DAY_LENGTH_MS) + 1;
}

/** Форма числа по правилам локали; `zero` и `two` идут подписью `other`. */
export function rtRangePlural(count: number, locale: string): IRtDateRange.Plural {
    const form: Intl.LDMLPluralRule = new Intl.PluralRules(locale).select(count);
    return form === 'one' || form === 'few' || form === 'many' ? form : 'other';
}

/** Даты итога по локали: `12–15 октября`; год пишется, когда края в разных годах. */
export function rtRangeDates(range: IRtDateRange.Value, locale: string): string {
    const sameYear: boolean = range.start.slice(0, YEAR_LEN) === range.end.slice(0, YEAR_LEN);
    const options: Intl.DateTimeFormatOptions = sameYear
        ? { day: 'numeric', month: 'long', timeZone: 'UTC' }
        : { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
    return new Intl.DateTimeFormat(locale, options).formatRange(dayToMs(range.start), dayToMs(range.end));
}

/** Текст поля: две даты в порядке локали через тире; пусто — пустой текст. */
export function rtRangeText(value: IRtDateRange.Value | null, layout: IRtDatePicker.TextLayout): string {
    return value === null ? '' : `${rtDateText(value.start, 'date', layout)}${DASH}${rtDateText(value.end, 'date', layout)}`;
}

/** Подсказка формы текста буквами кита: `дд.мм.гггг — дд.мм.гггг`. */
export function rtRangeShape(layout: IRtDatePicker.TextLayout, letters: IRtDatePicker.ShapeLetters): string {
    const day: string = rtDateShape('date', layout, letters);
    return `${day}${DASH}${day}`;
}

/**
 * Читает набранный текст в диапазон; `null` — текст не две даты. Даты читаются в порядке локали,
 * форма значения тоже; даты в обратном порядке ставятся по порядку.
 */
export function rtRangeParse(text: string, layout: IRtDatePicker.TextLayout): IRtDateRange.Value | null {
    const parts: string[] = text.trim().split(DASH_RE);
    if (parts.length !== 2) {
        return null;
    }
    const start: string | null = rtDateParse(parts[0].trim(), 'date', layout);
    const end: string | null = rtDateParse(parts[1].trim(), 'date', layout);
    return start === null || end === null ? null : rtRangeOrder(start, end);
}
