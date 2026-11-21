import { IRtSourcesData, rtSourcesData } from './sources-data';

describe('rtSourcesData', (): void => {
    it('SC-UKV-1548 — источник без названия отбрасывается, остальные остаются по порядку', (): void => {
        const read: IRtSourcesData | null = rtSourcesData({
            items: [{ detail: 'Ноябрь' }, { title: '  ' }, { title: 7 }, 'Продажи', null, { title: 'Отчёт «Продажи»' }],
        });

        expect(read?.items.map((item: { title: string }): string => item.title)).toEqual(['Отчёт «Продажи»']);
    });

    it('SC-UKV-1549 — блок без списка или без единого источника не даёт данных', (): void => {
        expect(rtSourcesData({})).toBeNull();
        expect(rtSourcesData({ items: 'a' })).toBeNull();
        expect(rtSourcesData({ items: [] })).toBeNull();
        expect(rtSourcesData({ items: [{ detail: 'x' }, { title: ' ' }] })).toBeNull();
        expect(rtSourcesData(null)).toBeNull();
        expect(rtSourcesData([{ title: 'Продажи' }])).toBeNull();
    });

    it('SC-UKV-1550 — испорченная необязательная часть пропадает', (): void => {
        const read: IRtSourcesData | null = rtSourcesData({
            items: [
                { title: 'Продажи', detail: 5, url: '', icon: 3 },
                { title: 'Склад', detail: '  ', url: '   ' },
            ],
        });

        expect(read?.items).toEqual([
            { title: 'Продажи', detail: null, url: null, icon: 'file' },
            { title: 'Склад', detail: null, url: null, icon: 'file' },
        ]);
    });

    it('SC-UKV-1550 — название, уточнение, адрес и значок приходят без пробелов по краям', (): void => {
        const read: IRtSourcesData | null = rtSourcesData({
            items: [{ title: '  Продажи  ', detail: ' Ноябрь ', url: ' /r ', icon: ' chart-bar ' }],
        });

        expect(read?.items).toEqual([{ title: 'Продажи', detail: 'Ноябрь', url: '/r', icon: 'chart-bar' }]);
    });

    it('SC-UKV-1561 — одинаковые источники не склеиваются', (): void => {
        const read: IRtSourcesData | null = rtSourcesData({ items: [{ title: 'Продажи' }, { title: 'Продажи' }] });

        expect(read?.items.length).toBe(2);
    });
});
