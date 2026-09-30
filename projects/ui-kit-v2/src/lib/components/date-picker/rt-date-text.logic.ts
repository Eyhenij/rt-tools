import { rtDateRead } from './rt-date-panel.logic';
import { IRtDatePicker } from './rt-date-picker.model';

/**
 * Чистая логика текста в поле даты: как значение пишется по локали и как набранный текст
 * читается обратно. Значение формы — строка ISO (`YYYY-MM-DD`, `HH:mm`, `YYYY-MM-DDTHH:mm`);
 * текст — дата в порядке языка интерфейса (`01.08.2026` под `ru`), время всегда `HH:mm`.
 */

/** День, в котором день, месяц и год различимы: по нему `Intl` называет порядок частей. */
const SAMPLE_DAY: Date = new Date(2026, 0, 31);
const DEFAULT_LAYOUT: IRtDatePicker.TextLayout = { order: ['day', 'month', 'year'], separator: '.' };
const YEAR_LEN: number = 4;
const PART_MAX_LEN: number = 2;
const DAY_GROUPS: number = 3;
const TIME_GROUPS: number = 2;
/** Знаки, которые встречаются в тексте даты любой локали, кроме цифр. */
const TEXT_RE: RegExp = /^[\d\s.,/:\-T]+$/;

function isDatePart(type: string): type is IRtDatePicker.DatePart {
    return type === 'day' || type === 'month' || type === 'year';
}

function dayText(day: string, layout: IRtDatePicker.TextLayout): string {
    const [year, month, date]: string[] = day.split('-');
    const parts: Readonly<Record<IRtDatePicker.DatePart, string>> = { day: date, month, year };
    return layout.order.map((part: IRtDatePicker.DatePart): string => parts[part]).join(layout.separator);
}

/** День ISO из трёх групп цифр в порядке локали; `null` — группы не складываются в день. */
function readDay(groups: readonly string[], layout: IRtDatePicker.TextLayout): string | null {
    const parts: Partial<Record<IRtDatePicker.DatePart, string>> = {};
    layout.order.forEach((part: IRtDatePicker.DatePart, index: number): void => {
        parts[part] = groups[index];
    });
    const { day, month, year }: Partial<Record<IRtDatePicker.DatePart, string>> = parts;
    if (day === undefined || month === undefined || year?.length !== YEAR_LEN) {
        return null;
    }
    if (day.length > PART_MAX_LEN || month.length > PART_MAX_LEN) {
        return null;
    }
    return `${year}-${month.padStart(PART_MAX_LEN, '0')}-${day.padStart(PART_MAX_LEN, '0')}`;
}

/** Время ISO из двух групп цифр: часы в один или два знака, минуты — ровно два. */
function readTime(groups: readonly string[]): string | null {
    if (groups.length !== TIME_GROUPS) {
        return null;
    }
    const [hour, minute]: readonly string[] = groups;
    if (minute.length !== PART_MAX_LEN || hour.length > PART_MAX_LEN) {
        return null;
    }
    return `${hour.padStart(PART_MAX_LEN, '0')}:${minute}`;
}

/** Значение типа из групп цифр текста; `null` — группы не складываются в значение. */
function readGroups(groups: readonly string[], type: IRtDatePicker.Type, layout: IRtDatePicker.TextLayout): string | null {
    if (type === 'time') {
        return readTime(groups);
    }
    if (type === 'date') {
        return groups.length === DAY_GROUPS ? readDay(groups, layout) : null;
    }
    if (groups.length !== DAY_GROUPS + TIME_GROUPS) {
        return null;
    }
    const day: string | null = readDay(groups.slice(0, DAY_GROUPS), layout);
    const time: string | null = readTime(groups.slice(DAY_GROUPS));
    return day === null || time === null ? null : `${day}T${time}`;
}

/** Порядок дня, месяца и года и знак между ними — по локали. */
export function rtDateLayout(locale: string): IRtDatePicker.TextLayout {
    const parts: Intl.DateTimeFormatPart[] = new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).formatToParts(SAMPLE_DAY);
    const order: IRtDatePicker.DatePart[] = parts
        .map((part: Intl.DateTimeFormatPart): string => part.type)
        .filter((type: string): type is IRtDatePicker.DatePart => isDatePart(type));
    const separator: string = parts.find((part: Intl.DateTimeFormatPart): boolean => part.type === 'literal')?.value.trim() ?? '';
    if (order.length !== DAY_GROUPS || separator === '') {
        return DEFAULT_LAYOUT;
    }
    return { order, separator };
}

/**
 * Текст поля для значения ISO; пустое значение — пустой текст. Строка, которая не читается как
 * значение этого типа, показывается как есть: она пришла из формы мимо поля и не должна пропасть.
 */
export function rtDateText(value: string, type: IRtDatePicker.Type, layout: IRtDatePicker.TextLayout): string {
    if (type === 'time' || rtDateRead(value, type) === null) {
        return value;
    }
    if (type === 'date') {
        return dayText(value, layout);
    }
    const [day, time]: string[] = value.split('T');
    return `${dayText(day, layout)} ${time}`;
}

/** Подсказка формы текста в буквах кита: `дд.мм.гггг`, `чч:мм`, `дд.мм.гггг чч:мм`. */
export function rtDateShape(type: IRtDatePicker.Type, layout: IRtDatePicker.TextLayout, letters: IRtDatePicker.ShapeLetters): string {
    const time: string = `${letters.hour}:${letters.minute}`;
    if (type === 'time') {
        return time;
    }
    const day: string = layout.order.map((part: IRtDatePicker.DatePart): string => letters[part]).join(layout.separator);
    return type === 'date' ? day : `${day} ${time}`;
}

/**
 * Читает набранный текст в значение ISO; `null` — текст не значение этого типа. Читается и
 * порядок локали, и сама форма значения: вставленная `2026-08-01` тоже становится значением.
 */
export function rtDateParse(text: string, type: IRtDatePicker.Type, layout: IRtDatePicker.TextLayout): string | null {
    const iso: string | null = rtDateRead(text, type);
    if (iso !== null) {
        return iso;
    }
    const value: string = text.trim();
    if (!TEXT_RE.test(value)) {
        return null;
    }
    const candidate: string | null = readGroups(value.match(/\d+/g) ?? [], type, layout);
    // Кандидат проверяется той же формой значения: 31.02.2026 складывается в строку, но не в день.
    return candidate === null ? null : rtDateRead(candidate, type);
}
