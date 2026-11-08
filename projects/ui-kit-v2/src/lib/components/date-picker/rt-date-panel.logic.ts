import { ERtCalendarDayState, IRtCalendar } from '@rt-tools/ui-kit-v2/calendar';
import { IRtDatePicker } from './rt-date-picker.model';

/**
 * Чистая логика панели rt-date-picker: чтение и запись значения, месяц, границы, колонки времени
 * и клавиши сетки. Текущий момент приходит параметром — компонент читает часы на своей границе.
 *
 * Значения — строки формы нативного input'а: `YYYY-MM-DD`, `HH:mm`, `YYYY-MM-DDTHH:mm`. Строки
 * одной формы сравниваются как текст, поэтому границы сравниваются обрезанными до длины значения.
 */

const DAY_RE: RegExp = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE: RegExp = /^(\d{2}):(\d{2})$/;
const DAY_LENGTH_MS: number = 86_400_000;
const WEEK: number = 7;
const DAY_LEN: number = 10;
const MONTH_LEN: number = 7;
const TIME_LEN: number = 5;

interface IWeekInfo {
    firstDay: number;
}

type TLocaleWithWeek = Intl.Locale & { weekInfo?: IWeekInfo; getWeekInfo?: () => IWeekInfo };

/** Числа строки даты или времени: `2026-09-29` → `[2026, 9, 29]`. */
function nums(text: string): number[] {
    return text.split(/\D/).map(Number);
}

/**
 * Строка формы значения как число: `2026-09-29T10:05` → `202609291005`. Строки одной формы
 * сравниваются по этому числу так же, как по порядку дат.
 */
function rank(text: string): number {
    return Number(text.replace(/\D/g, ''));
}

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

function dayToMs(day: string): number {
    const [y, m, d]: number[] = nums(day);
    return Date.UTC(y, m - 1, d);
}

function msToDay(ms: number): string {
    const date: Date = new Date(ms);
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function daysInMonth(year: number, month: number): number {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isDay(text: string): boolean {
    const match: RegExpExecArray | null = DAY_RE.exec(text);
    if (match === null) {
        return false;
    }
    const month: number = Number(match[2]);
    const day: number = Number(match[3]);
    return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(Number(match[1]), month);
}

function isTime(text: string): boolean {
    const match: RegExpExecArray | null = TIME_RE.exec(text);
    return match !== null && Number(match[1]) < 24 && Number(match[2]) < 60;
}

/** Время `HH:mm` из часа и минуты. */
export function rtDateTime(hour: number, minute: number): string {
    return `${pad(hour)}:${pad(minute)}`;
}

/** Первый день недели локали: 1 — понедельник … 7 — воскресенье. */
export function rtDateFirstDay(locale: string): number {
    const info: TLocaleWithWeek = new Intl.Locale(locale);
    return (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay ?? 1;
}

/** Читает текст формы значения; `null` — текст не значение этого типа. */
export function rtDateRead(text: string, type: IRtDatePicker.Type): string | null {
    const value: string = text.trim();
    if (type === 'date') {
        return isDay(value) ? value : null;
    }
    if (type === 'time') {
        return isTime(value) ? value : null;
    }
    const parts: string[] = value.split('T');
    return parts.length === 2 && isDay(parts[0]) && isTime(parts[1]) ? value : null;
}

/** Собирает значение типа из дня и времени; без нужной части — пустая строка. */
export function rtDateWrite(type: IRtDatePicker.Type, day: string | null, time: string | null): string {
    if (type === 'date') {
        return day ?? '';
    }
    if (type === 'time') {
        return time ?? '';
    }
    return day !== null && time !== null ? `${day}T${time}` : '';
}

/** Разбирает значение на день и время; недостающая часть — `null`. */
export function rtDateSplit(value: string, type: IRtDatePicker.Type): { day: string | null; time: string | null } {
    if (value === '') {
        return { day: null, time: null };
    }
    if (type === 'time') {
        return { day: null, time: value };
    }
    return { day: value.slice(0, DAY_LEN), time: type === 'date' ? null : value.slice(DAY_LEN + 1) };
}

/** Лежит ли значение в границах; граница обрезается до длины значения, `null` — открыта. */
export function rtDateInBounds(value: string, min: string | null, max: string | null): boolean {
    const low: string | null = min === null ? null : min.slice(0, value.length);
    const high: string | null = max === null ? null : max.slice(0, value.length);
    return (low === null || rank(value) >= rank(low)) && (high === null || rank(value) <= rank(high));
}

/** Текущий момент: день и время, округлённое вниз до шага минут. */
export function rtDateNow(now: Date, step: number): IRtDatePicker.Moment {
    const minute: number = Math.floor(now.getMinutes() / step) * step;
    return {
        day: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        time: `${pad(now.getHours())}:${pad(minute)}`,
    };
}

/** Сдвигает месяц `YYYY-MM` на `delta` месяцев. */
export function rtDateAddMonths(month: string, delta: number): string {
    const [y, m]: number[] = nums(month);
    const date: Date = new Date(Date.UTC(y, m - 1 + delta, 1));
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

/** Можно ли листать от месяца на `delta`: соседний месяц не лежит за границей. */
export function rtDateCanPage(month: string, delta: number, min: string | null, max: string | null): boolean {
    return rtDateInBounds(rtDateAddMonths(month, delta), min, max);
}

function monthTitle(month: string, locale: string): string {
    const [y, m]: number[] = nums(month);
    const name: string = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(Date.UTC(y, m - 1, 1));
    return `${name.charAt(0).toLocaleUpperCase(locale)}${name.slice(1)} ${y}`;
}

function dayCell(day: string, ctx: IRtDatePicker.MonthContext): IRtCalendar.Day {
    return {
        key: day,
        dayOfMonth: Number(day.slice(8)),
        sublabel: '',
        state: day === ctx.chosen ? ERtCalendarDayState.Chosen : ERtCalendarDayState.Free,
        disabled: !rtDateInBounds(day, ctx.min, ctx.max),
        today: day === ctx.today,
    };
}

/** Месяц `YYYY-MM` для календаря: подпись по локали, пустые ячейки до первого дня, дни. */
export function rtDateMonth(month: string, ctx: IRtDatePicker.MonthContext): IRtCalendar.Month {
    const [y, m]: number[] = nums(month);
    const first: number = Date.UTC(y, m - 1, 1);
    const weekday: number = new Date(first).getUTCDay() || WEEK;
    const blanks: number = (weekday - rtDateFirstDay(ctx.locale) + WEEK) % WEEK;
    const days: IRtCalendar.Day[] = Array.from({ length: daysInMonth(y, m) }, (_: unknown, i: number): IRtCalendar.Day =>
        dayCell(msToDay(first + i * DAY_LENGTH_MS), ctx)
    );
    const leadingBlanks: number[] = Array.from({ length: blanks }, (_: unknown, i: number): number => i);
    return { key: month, label: monthTitle(month, ctx.locale), leadingBlanks, days };
}

/** День соседнего месяца: бледный, за границей выбора ещё и зачёркнут. */
function outsideDay(ms: number, min: string | null, max: string | null): IRtCalendar.OutsideDay {
    const key: string = msToDay(ms);
    return { key, dayOfMonth: Number(key.slice(8)), crossed: !rtDateInBounds(key, min, max) };
}

/**
 * Месяц панели даты: тот же месяц, что у поля, но сетка дописана днями соседних месяцев до полных
 * недель, а дни за границей выбора зачёркнуты, как занятые.
 */
export function rtDatePanelMonth(month: string, ctx: IRtDatePicker.MonthContext): IRtCalendar.Month {
    const base: IRtCalendar.Month = rtDateMonth(month, ctx);
    const first: number = dayToMs(base.days[0].key);
    const last: number = dayToMs(base.days[base.days.length - 1].key);
    const lead: number = base.leadingBlanks.length;
    const tail: number = (WEEK - ((lead + base.days.length) % WEEK)) % WEEK;
    return {
        ...base,
        days: base.days.map((day: IRtCalendar.Day): IRtCalendar.Day => (day.disabled ? { ...day, state: ERtCalendarDayState.Busy } : day)),
        leadingDays: Array.from({ length: lead }, (_: unknown, i: number): IRtCalendar.OutsideDay =>
            outsideDay(first - (lead - i) * DAY_LENGTH_MS, ctx.min, ctx.max)
        ),
        trailingDays: Array.from({ length: tail }, (_: unknown, i: number): IRtCalendar.OutsideDay =>
            outsideDay(last + (i + 1) * DAY_LENGTH_MS, ctx.min, ctx.max)
        ),
    };
}

/** Короткие имена дней недели по локали, начиная с её первого дня, с заглавной буквы: «Пн», «Mon». */
export function rtDateWeekdays(locale: string): string[] {
    const format: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
    // 2024-01-01 — понедельник.
    const monday: number = Date.UTC(2024, 0, 1);
    const shift: number = rtDateFirstDay(locale) - 1;
    return Array.from({ length: WEEK }, (_: unknown, i: number): string => {
        const name: string = format.format(monday + ((i + shift) % WEEK) * DAY_LENGTH_MS);
        return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
    });
}

/** Двенадцать месяцев года для выбора месяца; месяц за границей выключен. */
export function rtDateMonths(year: number, locale: string, min: string | null, max: string | null): IRtDatePicker.MonthCell[] {
    const format: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
    return Array.from({ length: 12 }, (_: unknown, i: number): IRtDatePicker.MonthCell => {
        const key: string = `${year}-${pad(i + 1)}`;
        return { key, label: format.format(Date.UTC(year, i, 1)), disabled: !rtDateInBounds(key, min, max) };
    });
}

/** Год, от которого отсчитываются блоки сетки годов: макет рисует 2024 – 2035 вокруг 2026. */
const YEAR_SPAN_ORIGIN: number = 2024;

/** Лет в одном блоке сетки годов. */
export const RT_DATE_YEAR_SPAN: number = 12;

/** Первый год блока из двенадцати лет, в котором лежит `year`. */
export function rtDateYearSpanStart(year: number): number {
    return YEAR_SPAN_ORIGIN + Math.floor((year - YEAR_SPAN_ORIGIN) / RT_DATE_YEAR_SPAN) * RT_DATE_YEAR_SPAN;
}

/** Двенадцать лет блока, начиная со `start`; год за границей выключен. */
export function rtDateYears(start: number, min: string | null, max: string | null): IRtDatePicker.YearCell[] {
    return Array.from({ length: RT_DATE_YEAR_SPAN }, (_: unknown, i: number): IRtDatePicker.YearCell => {
        const key: string = String(start + i);
        return { key, label: key, disabled: !rtDateInBounds(key, min, max) };
    });
}

/** Можно ли листать блок лет на `delta` блоков: в соседнем блоке есть хоть один год внутри границ. */
export function rtDateCanPageYears(start: number, delta: number, min: string | null, max: string | null): boolean {
    return rtDateYears(start + delta * RT_DATE_YEAR_SPAN, min, max).some((cell: IRtDatePicker.YearCell): boolean => !cell.disabled);
}

/** Граница времени для дня: у даты со временем действует только в день самой границы. */
function timeBound(bound: string | null, day: string | null): string | null {
    if (bound === null || bound.length <= TIME_LEN) {
        return bound;
    }
    return day === bound.slice(0, DAY_LEN) ? bound.slice(DAY_LEN + 1) : null;
}

/** Колонки часов и минут: минуты идут с шагом, время за границей выключено. */
export function rtDateTimeColumns(ctx: IRtDatePicker.TimeContext): IRtDatePicker.TimeColumns {
    const low: string | null = timeBound(ctx.min, ctx.day);
    const high: string | null = timeBound(ctx.max, ctx.day);
    const hours: IRtDatePicker.TimeCell[] = Array.from({ length: 24 }, (_: unknown, h: number): IRtDatePicker.TimeCell => ({
        value: h,
        label: pad(h),
        disabled: (low !== null && rank(`${pad(h)}:59`) < rank(low)) || (high !== null && rank(`${pad(h)}:00`) > rank(high)),
    }));
    const step: number = Math.max(1, Math.floor(ctx.step));
    const minutes: IRtDatePicker.TimeCell[] = Array.from(
        { length: Math.ceil(60 / step) },
        (_: unknown, i: number): IRtDatePicker.TimeCell => {
            const minute: number = i * step;
            const time: string = `${pad(ctx.hour ?? 0)}:${pad(minute)}`;
            return { value: minute, label: pad(minute), disabled: ctx.hour !== null && !rtDateInBounds(time, low, high) };
        }
    );
    return { hours, minutes };
}

function shiftMonth(day: string, delta: number): string {
    const target: string = rtDateAddMonths(day.slice(0, MONTH_LEN), delta);
    const [y, m]: number[] = nums(target);
    return `${target}-${pad(Math.min(Number(day.slice(8)), daysInMonth(y, m)))}`;
}

/** Клавиши, что двигают фокус на число дней. */
const DAY_KEYS: Readonly<Record<string, number>> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -WEEK, ArrowDown: WEEK };

/** Клавиши, что двигают фокус на месяц. */
const MONTH_KEYS: Readonly<Record<string, number>> = { PageUp: -1, PageDown: 1 };

function keyTarget(key: string, day: string, firstDay: number): string | null {
    const ms: number = dayToMs(day);
    if (key in DAY_KEYS) {
        return msToDay(ms + DAY_KEYS[key] * DAY_LENGTH_MS);
    }
    if (key in MONTH_KEYS) {
        return shiftMonth(day, MONTH_KEYS[key]);
    }
    const offset: number = ((new Date(ms).getUTCDay() || WEEK) - firstDay + WEEK) % WEEK;
    if (key === 'Home') {
        return msToDay(ms - offset * DAY_LENGTH_MS);
    }
    return key === 'End' ? msToDay(ms + (WEEK - 1 - offset) * DAY_LENGTH_MS) : null;
}

/**
 * Куда клавиша переводит фокус с дня; `null` — клавиша не сеточная. День за границей не
 * достаётся: фокус встаёт на ближний день в границах.
 */
export function rtDateGridKey(key: string, day: string, firstDay: number, min: string | null, max: string | null): string | null {
    const target: string | null = keyTarget(key, day, firstDay);
    if (target === null) {
        return null;
    }
    const low: string | null = min === null ? null : min.slice(0, DAY_LEN);
    const high: string | null = max === null ? null : max.slice(0, DAY_LEN);
    if (low !== null && rank(target) < rank(low)) {
        return low;
    }
    return high !== null && rank(target) > rank(high) ? high : target;
}
