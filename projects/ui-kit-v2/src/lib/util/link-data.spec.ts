import { ERtLinkState, IRtLinkData, rtLinkData } from './link-data';

const STATES: ERtLinkState[] = [ERtLinkState.Pending, ERtLinkState.Opened, ERtLinkState.Failed];

describe('rtLinkData', (): void => {
    it('SC-UKV-1488 — блок без названия или без адреса не даёт карточки', (): void => {
        expect(rtLinkData({ url: '/reports' })).toBeNull();
        expect(rtLinkData({ title: '  ', url: '/reports' })).toBeNull();
        expect(rtLinkData({ title: 'Продажи' })).toBeNull();
        expect(rtLinkData({ title: 'Продажи', url: 42 })).toBeNull();
        expect(rtLinkData('Продажи')).toBeNull();
        expect(rtLinkData(null)).toBeNull();
        expect(rtLinkData([{ title: 'Продажи', url: '/reports' }])).toBeNull();
    });

    it('SC-UKV-1489 — испорченная необязательная часть пропадает, чужое состояние не даёт статуса', (): void => {
        const read: IRtLinkData | null = rtLinkData({
            title: '  Продажи  ',
            url: ' /reports ',
            section: 7,
            icon: '',
            state: 'done',
            reason: 'Нет доступа',
        });

        expect(read).toEqual({ title: 'Продажи', url: '/reports', section: null, icon: 'link', state: null, reason: null });
    });

    it('SC-UKV-1489 — раздел, значок и причина приходят без пробелов по краям', (): void => {
        const read: IRtLinkData | null = rtLinkData({
            title: 'Продажи',
            url: '/reports',
            section: ' Отчёты · Продажи ',
            icon: ' chart-bar ',
            state: 'failed',
            reason: ' Нет доступа ',
        });

        expect(read).toEqual({
            title: 'Продажи',
            url: '/reports',
            section: 'Отчёты · Продажи',
            icon: 'chart-bar',
            state: ERtLinkState.Failed,
            reason: 'Нет доступа',
        });
    });

    it('SC-UKV-1489 — причина есть только у отказа, отказ без причины остаётся отказом', (): void => {
        const read: (IRtLinkData | null)[] = STATES.map((state: ERtLinkState): IRtLinkData | null =>
            rtLinkData({ title: 'Продажи', url: '/reports', state, reason: 'Нет доступа' })
        );

        expect(read.map((data: IRtLinkData | null): ERtLinkState | null | undefined => data?.state)).toEqual(STATES);
        expect(read.map((data: IRtLinkData | null): string | null | undefined => data?.reason)).toEqual([null, null, 'Нет доступа']);
        expect(rtLinkData({ title: 'Продажи', url: '/reports', state: 'failed' })?.state).toBe(ERtLinkState.Failed);
        expect(rtLinkData({ title: 'Продажи', url: '/reports', state: 'failed' })?.reason).toBeNull();
    });
});
