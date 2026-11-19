import { ERtKpiDeltaUnit, ERtKpiFormat, IRtKpiItem, rtKpiItem, rtKpiItems, rtKpiValueWriter } from './kpi-data';

/**
 * Приведение карточек KPI и запись значения — чистые функции: спека зовёт их и читает ответ.
 * Пробелы `Intl` в `ru` неразрывные, поэтому ожидания сравниваются после замены их на обычный.
 */

function plain(value: string): string {
    return value.replace(/[\u00a0\u202f]/g, ' ');
}

function write(item: Record<string, unknown>, locale: string): string {
    const kpi: IRtKpiItem | null = rtKpiItem({ label: 'L', ...item });

    if (kpi === null) {
        throw new Error('the item is dropped');
    }

    return plain(rtKpiValueWriter(kpi, locale)(kpi.value));
}

describe('rtKpiValueWriter', (): void => {
    it('SC-UKV-1440 — значение пишется по роду и языку', (): void => {
        expect(write({ value: 1250.5, format: 'number' }, 'en')).toBe('1,250.5');
        expect(write({ value: 0.78, format: 'percent' }, 'en')).toBe('78.0%');
        expect(write({ value: 8400, format: 'currency', currency: 'EUR' }, 'en')).toBe('€8,400');
    });

    it('SC-UKV-1441 — от миллиона значение пишется коротко, без хвостовых нулей', (): void => {
        const rub: (value: number) => string = (value: number): string => write({ value, format: 'currency', currency: 'RUB' }, 'ru');

        expect([1000000, 1240000, 2500000, -1240000, 999999.999, 999999, 8400].map(rub)).toEqual([
            '1 млн ₽',
            '1,24 млн ₽',
            '2,5 млн ₽',
            '-1,24 млн ₽',
            '1 млн ₽',
            '999 999 ₽',
            '8 400 ₽',
        ]);
        expect(write({ value: 2500000000, format: 'number' }, 'ru')).toBe('2,5 млрд');
        expect(write({ value: 12, format: 'percent' }, 'ru')).toBe('1 200,0 %');
        expect(rub(1000000)).not.toContain(',00');
    });

    it('SC-UKV-1442 — сумма без верного кода валюты пишется числом', (): void => {
        expect(write({ value: 1200.5, format: 'currency' }, 'en')).toBe('1,200.5');
        expect(write({ value: 1200.5, format: 'currency', currency: 'rub' }, 'en')).toBe('1,200.5');
    });

    it('SC-UKV-1443 — строка стоит как пришла', (): void => {
        expect(write({ value: 'n/a', format: 'number' }, 'en')).toBe('n/a');
    });

    it('SC-UKV-1446 — неизвестный род и род без значения пишутся числом', (): void => {
        expect(write({ value: 1250.5, format: 'date' }, 'en')).toBe('1,250.5');
        expect(write({ value: 1250.5 }, 'en')).toBe('1,250.5');
    });

    it('SC-UKV-1477 — язык, который Intl не принимает, пишет значение как en', (): void => {
        expect(write({ value: 8400, format: 'currency', currency: 'EUR' }, '!!')).toBe('€8,400');
        expect(write({ value: 1240000, format: 'number' }, '!!')).toBe('1.24M');
    });
});

describe('rtKpiItems', (): void => {
    it('SC-UKV-1444 — испорченные карточки выпадают, остальные стоят по порядку', (): void => {
        const items: IRtKpiItem[] | null = rtKpiItems([
            'Выручка',
            { value: 1 },
            { label: '', value: 1 },
            { label: '   ', value: 1 },
            ...[null, NaN, Infinity, true, {}, [], ''].map((value: unknown): object => ({ label: 'X', value })),
            { label: 'Выручка', value: 1200 },
        ]);

        expect(items?.map((item: IRtKpiItem): string => item.label)).toEqual(['Выручка']);
    });

    it('SC-UKV-1445 — испорченная необязательная часть пропадает', (): void => {
        const broken: IRtKpiItem | null = rtKpiItem({ label: 'A', value: 1, delta: '12', base: 'vs LY', period: 5, growthIsGood: 'no' });
        const growing: IRtKpiItem | null = rtKpiItem({ label: 'A', value: 1, delta: 12, growthIsGood: 'no' });

        expect(broken).toMatchObject({ delta: null, period: null, growthIsGood: true });
        expect(growing).toMatchObject({ delta: 12, growthIsGood: true });
    });

    it('SC-UKV-1476 — единица дельты: пункты, а неизвестная единица считается процентом', (): void => {
        expect(rtKpiItem({ label: 'A', value: 1, delta: 10, deltaUnit: 'points' })?.deltaUnit).toBe(ERtKpiDeltaUnit.Points);
        expect(rtKpiItem({ label: 'A', value: 1, delta: 10, deltaUnit: 'pct' })?.deltaUnit).toBe(ERtKpiDeltaUnit.Percent);
    });

    it('SC-UKV-1447, SC-UKV-1482 — items не списком, пустой или без уцелевших карточек — плашка', (): void => {
        expect(rtKpiItems({ label: 'A', value: 1 })).toBeNull();
        expect(rtKpiItems([])).toBeNull();
        expect(rtKpiItems([{ label: 'A' }, 'B'])).toBeNull();
    });

    it('SC-UKV-1459 — карточка со всеми полями приводится без потерь', (): void => {
        expect(
            rtKpiItem({
                label: 'Выручка',
                value: 1240000,
                format: 'currency',
                currency: 'RUB',
                delta: -4,
                deltaUnit: 'percent',
                base: 'vs LY',
                period: 'ноябрь 2026',
                growthIsGood: false,
            })
        ).toEqual({
            label: 'Выручка',
            value: 1240000,
            format: ERtKpiFormat.Currency,
            currency: 'RUB',
            delta: -4,
            deltaUnit: ERtKpiDeltaUnit.Percent,
            base: 'vs LY',
            period: 'ноябрь 2026',
            growthIsGood: false,
        });
    });
});
