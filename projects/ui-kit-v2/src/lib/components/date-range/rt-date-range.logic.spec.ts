import { ERtCalendarDayState, IRtCalendar } from '../calendar/rt-calendar.model';
import { IRtDatePicker } from '../date-picker/rt-date-picker.model';
import { rtDateLayout } from '../date-picker/rt-date-text.logic';
import {
    rtRangeDates,
    rtRangeDays,
    rtRangeMonth,
    rtRangeOrder,
    rtRangeParse,
    rtRangePlural,
    rtRangePresetCells,
    rtRangePresetOf,
    rtRangePresets,
    rtRangeRead,
    rtRangeShape,
    rtRangeText,
} from './rt-date-range.logic';
import { ERtDateRangePreset, IRtDateRange } from './rt-date-range.model';

const RU: IRtDatePicker.TextLayout = rtDateLayout('ru');
const RU_LETTERS: IRtDatePicker.ShapeLetters = { day: 'дд', month: 'мм', year: 'гггг', hour: 'чч', minute: 'мм' };
const CTX: IRtDateRange.MonthContext = { locale: 'ru', today: '2026-10-01', start: null, end: null, hover: null, min: null, max: null };

function stateOf(month: IRtCalendar.Month, key: string): ERtCalendarDayState | undefined {
    return month.days.find((day: IRtCalendar.Day): boolean => day.key === key)?.state;
}

function presetOf(cell: IRtDateRange.PresetCell): ERtDateRangePreset {
    return cell.preset;
}

describe('rt-date-range.logic', (): void => {
    it('SC-UKV-468 — два дня встают по порядку, а из формы читается только пара дней по порядку', (): void => {
        expect(rtRangeOrder('2026-10-15', '2026-10-12')).toEqual({ start: '2026-10-12', end: '2026-10-15' });
        expect(rtRangeOrder('2026-10-12', '2026-10-12')).toEqual({ start: '2026-10-12', end: '2026-10-12' });
        expect(rtRangeRead({ start: '2026-10-12', end: '2026-10-15' })).toEqual({ start: '2026-10-12', end: '2026-10-15' });
        expect(rtRangeRead({ start: '2026-10-15', end: '2026-10-12' })).toBeNull();
        expect(rtRangeRead({ start: '2026-02-31', end: '2026-03-01' })).toBeNull();
        expect(rtRangeRead(null)).toBeNull();
        expect(rtRangeRead('2026-10-12')).toBeNull();
    });

    it('SC-UKV-469 — диапазон пишется двумя датами в порядке языка, подсказка — буквами кита', (): void => {
        expect(rtRangeText({ start: '2026-10-12', end: '2026-10-15' }, RU)).toBe('12.10.2026 — 15.10.2026');
        expect(rtRangeText(null, RU)).toBe('');
        expect(rtRangeShape(RU, RU_LETTERS)).toBe('дд.мм.гггг — дд.мм.гггг');
    });

    it('SC-UKV-469 — набранный текст читается двумя датами через тире, иначе не читается', (): void => {
        const august: IRtDateRange.Value = { start: '2026-08-01', end: '2026-08-15' };
        expect(rtRangeParse('01.08.2026 — 15.08.2026', RU)).toEqual(august);
        expect(rtRangeParse('1.8.2026–15.8.2026', RU)).toEqual(august);
        expect(rtRangeParse('01.08.2026 - 15.08.2026', RU)).toEqual(august);
        expect(rtRangeParse('2026-08-01 — 2026-08-15', RU)).toEqual(august);
        expect(rtRangeParse('15.08.2026 — 01.08.2026', RU)).toEqual(august);
        expect(rtRangeParse('01.08.2026', RU)).toBeNull();
        expect(rtRangeParse('01.08.2026 — завтра', RU)).toBeNull();
        expect(rtRangeParse('31.02.2026 — 01.03.2026', RU)).toBeNull();
    });

    it('SC-UKV-472 — выбранное начало залито, а до дня под указателем тянется светлый будущий диапазон', (): void => {
        const started: IRtCalendar.Month = rtRangeMonth('2026-10', { ...CTX, start: '2026-10-12' });
        expect(stateOf(started, '2026-10-12')).toBe(ERtCalendarDayState.Chosen);
        expect(stateOf(started, '2026-10-13')).toBe(ERtCalendarDayState.Free);

        const hovered: IRtCalendar.Month = rtRangeMonth('2026-10', { ...CTX, start: '2026-10-12', hover: '2026-10-19' });
        expect(stateOf(hovered, '2026-10-12')).toBe(ERtCalendarDayState.Start);
        expect(stateOf(hovered, '2026-10-13')).toBe(ERtCalendarDayState.InRange);
        expect(stateOf(hovered, '2026-10-19')).toBe(ERtCalendarDayState.InRange);
        expect(stateOf(hovered, '2026-10-20')).toBe(ERtCalendarDayState.Free);

        const back: IRtCalendar.Month = rtRangeMonth('2026-10', { ...CTX, start: '2026-10-12', hover: '2026-10-10' });
        expect(stateOf(back, '2026-10-10')).toBe(ERtCalendarDayState.InRange);
        expect(stateOf(back, '2026-10-12')).toBe(ERtCalendarDayState.End);
    });

    it('SC-UKV-472 — готовый диапазон не следует за указателем, а диапазон в один день залит', (): void => {
        const done: IRtCalendar.Month = rtRangeMonth('2026-10', { ...CTX, start: '2026-10-12', end: '2026-10-15', hover: '2026-10-20' });
        expect(stateOf(done, '2026-10-15')).toBe(ERtCalendarDayState.End);
        expect(stateOf(done, '2026-10-16')).toBe(ERtCalendarDayState.Free);

        const single: IRtCalendar.Month = rtRangeMonth('2026-10', { ...CTX, start: '2026-10-12', end: '2026-10-12' });
        expect(stateOf(single, '2026-10-12')).toBe(ERtCalendarDayState.Chosen);
    });

    it('SC-UKV-473 — быстрые варианты считаются от сегодня, а не лежащий в границах выключен', (): void => {
        const ranges: Readonly<Record<ERtDateRangePreset, IRtDateRange.Value>> = rtRangePresets('2026-09-30');
        expect(ranges[ERtDateRangePreset.Today]).toEqual({ start: '2026-09-30', end: '2026-09-30' });
        expect(ranges[ERtDateRangePreset.Yesterday]).toEqual({ start: '2026-09-29', end: '2026-09-29' });
        expect(ranges[ERtDateRangePreset.Last7]).toEqual({ start: '2026-09-24', end: '2026-09-30' });
        expect(ranges[ERtDateRangePreset.Last30]).toEqual({ start: '2026-09-01', end: '2026-09-30' });
        expect(ranges[ERtDateRangePreset.ThisMonth]).toEqual({ start: '2026-09-01', end: '2026-09-30' });
        expect(ranges[ERtDateRangePreset.LastMonth]).toEqual({ start: '2026-08-01', end: '2026-08-31' });
        expect(rtRangePresets('2026-03-01')[ERtDateRangePreset.LastMonth]).toEqual({ start: '2026-02-01', end: '2026-02-28' });

        const cells: IRtDateRange.PresetCell[] = rtRangePresetCells('2026-09-30', '2026-09-01', null);
        expect(cells.map(presetOf)).toEqual(Object.values(ERtDateRangePreset));
        expect(cells.filter((cell: IRtDateRange.PresetCell): boolean => cell.disabled).map(presetOf)).toEqual([
            ERtDateRangePreset.LastMonth,
        ]);
        expect(rtRangePresetOf({ start: '2026-09-24', end: '2026-09-30' }, '2026-09-30')).toBe(ERtDateRangePreset.Last7);
        expect(rtRangePresetOf({ start: '2026-09-23', end: '2026-09-30' }, '2026-09-30')).toBeNull();
    });

    it('SC-UKV-474 — число дней считает оба края', (): void => {
        expect(rtRangeDays({ start: '2026-10-12', end: '2026-10-15' })).toBe(4);
        expect(rtRangeDays({ start: '2026-10-12', end: '2026-10-12' })).toBe(1);
        expect(rtRangeDays({ start: '2026-03-28', end: '2026-03-30' })).toBe(3);
    });

    it('SC-UKV-478 — даты итога и форма числа дней идут по локали', (): void => {
        const range: IRtDateRange.Value = { start: '2026-10-12', end: '2026-10-15' };
        expect(rtRangeDates(range, 'ru')).toBe('12–15 октября');
        // Между датами английской строки — узкие пробелы, а не обычные.
        expect(rtRangeDates(range, 'en')).toMatch(/^October 12\s–\s15$/);
        expect(rtRangeDates({ start: '2026-12-30', end: '2027-01-03' }, 'ru')).toContain('2027');
        expect(rtRangePlural(4, 'ru')).toBe('few');
        expect(rtRangePlural(1, 'ru')).toBe('one');
        expect(rtRangePlural(7, 'ru')).toBe('many');
        expect(rtRangePlural(4, 'en')).toBe('other');
    });
});
