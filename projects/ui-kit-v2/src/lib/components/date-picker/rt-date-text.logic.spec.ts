import { IRtDatePicker } from './rt-date-picker.model';
import { rtDateLayout, rtDateParse, rtDateShape, rtDateText } from './rt-date-text.logic';

const RU: IRtDatePicker.TextLayout = rtDateLayout('ru');
const US: IRtDatePicker.TextLayout = rtDateLayout('en-US');
const RU_LETTERS: IRtDatePicker.ShapeLetters = { day: 'дд', month: 'мм', year: 'гггг', hour: 'чч', minute: 'мм' };

describe('rt-date-text.logic', (): void => {
    it('SC-UKV-430 — порядок частей и знак между ними берутся из локали', (): void => {
        expect(RU).toEqual({ order: ['day', 'month', 'year'], separator: '.' });
        expect(US).toEqual({ order: ['month', 'day', 'year'], separator: '/' });
    });

    it('SC-UKV-430 — значение пишется в порядке локали, время всегда часами и минутами', (): void => {
        expect(rtDateText('2026-08-01', 'date', RU)).toBe('01.08.2026');
        expect(rtDateText('2026-08-01', 'date', US)).toBe('08/01/2026');
        expect(rtDateText('2026-08-01T09:30', 'datetime-local', RU)).toBe('01.08.2026 09:30');
        expect(rtDateText('09:30', 'time', US)).toBe('09:30');
        expect(rtDateText('', 'date', RU)).toBe('');
    });

    it('строка, которая не читается как значение, показывается как есть, а не пропадает', (): void => {
        expect(rtDateText('2026-02-31', 'date', RU)).toBe('2026-02-31');
        expect(rtDateText('завтра', 'datetime-local', RU)).toBe('завтра');
    });

    it('SC-UKV-430 — подсказка показывает форму текста буквами кита', (): void => {
        expect(rtDateShape('date', RU, RU_LETTERS)).toBe('дд.мм.гггг');
        expect(rtDateShape('time', RU, RU_LETTERS)).toBe('чч:мм');
        expect(rtDateShape('datetime-local', RU, RU_LETTERS)).toBe('дд.мм.гггг чч:мм');
    });

    it('SC-UKV-430 — набранный текст читается в порядке локали', (): void => {
        expect(rtDateParse('15.08.2026', 'date', RU)).toBe('2026-08-15');
        expect(rtDateParse('08/15/2026', 'date', US)).toBe('2026-08-15');
        expect(rtDateParse('1.8.2026', 'date', RU)).toBe('2026-08-01');
        expect(rtDateParse('01.08.2026 9:05', 'datetime-local', RU)).toBe('2026-08-01T09:05');
        expect(rtDateParse('9:05', 'time', RU)).toBe('09:05');
    });

    it('SC-UKV-419 — форма значения тоже читается: вставленная ISO-строка становится значением', (): void => {
        expect(rtDateParse('2026-08-01', 'date', RU)).toBe('2026-08-01');
        expect(rtDateParse('2026-08-01T09:30', 'datetime-local', US)).toBe('2026-08-01T09:30');
    });

    it('SC-UKV-419 — текст, который не складывается в значение, не читается', (): void => {
        expect(rtDateParse('31.02.2026', 'date', RU)).toBeNull();
        expect(rtDateParse('01.08.26', 'date', RU)).toBeNull();
        expect(rtDateParse('завтра', 'date', RU)).toBeNull();
        expect(rtDateParse('01.08.2026', 'datetime-local', RU)).toBeNull();
        expect(rtDateParse('25:00', 'time', RU)).toBeNull();
        expect(rtDateParse('9:5', 'time', RU)).toBeNull();
    });
});
