import { rtIconRef, rtIconSetsConfig, IRtIconSetsConfig } from './rt-icon-sets.logic';

describe('наборы значков', (): void => {
    it.each<[string, Parameters<typeof rtIconSetsConfig>, string]>([
        ['имя не по образцу', [[{ name: 'My Set', url: '/a' }]], 'имя пишется строчными'],
        ['двойной дефис в имени', [[{ name: 'a--b', url: '/a' }]], 'имя пишется строчными'],
        ['пустой адрес', [[{ name: 'brand', url: '  ' }]], 'пустой адрес'],
        ['незнакомый набор по умолчанию', [[], 'brand'], 'набора по умолчанию «brand»'],
        ['незнакомый запасной', [[{ name: 'brand', url: '/a', fallback: 'gone' }]], 'необъявленный набор «gone»'],
        ['запасной на себя', [[{ name: 'brand', url: '/a', fallback: 'brand' }]], 'замкнута в круг'],
        [
            'круг из двух наборов',
            [
                [
                    { name: 'one', url: '/1', fallback: 'two' },
                    { name: 'two', url: '/2', fallback: 'one' },
                ],
            ],
            'замкнута в круг',
        ],
        ['запасной у набора kit', [[{ name: 'kit', url: '/a', fallback: 'material' }]], 'запасного набора нет'],
    ])(
        'SC-UKV-1875 — %s даёт одно предупреждение и рисунок из kit',
        (_case: string, args: Parameters<typeof rtIconSetsConfig>, why: string): void => {
            const config: IRtIconSetsConfig = rtIconSetsConfig(...args);

            expect(config.warnings).toHaveLength(1);
            expect(config.warnings[0]).toContain(why);
            expect(config.defaultSet).toBe('kit');

            for (const set of config.sets.keys()) {
                expect(rtIconRef(config, set, 'wallet', false).urls.at(-1)).toBe(`${config.sets.get('kit')?.url}/wallet.svg`);
            }
        }
    );

    it('SC-UKV-1875 — незнакомое имя набора у значка берёт набор kit', (): void => {
        expect(rtIconRef(rtIconSetsConfig(), 'gone', 'close', false)).toEqual({
            id: 'rt-icon-close',
            set: 'kit',
            name: 'close',
            urls: ['/icons/close.svg'],
        });
    });

    it('SC-UKV-1889 — залитый и контурный значок набора с залитым запасным берут разные символы', (): void => {
        const config: IRtIconSetsConfig = rtIconSetsConfig([{ name: 'brand', url: '/brand', fallback: 'material' }]);
        const outline: string = rtIconRef(config, 'brand', 'search', false).id;
        const filled: string = rtIconRef(config, 'brand', 'search', true).id;

        expect(filled).not.toBe(outline);
        expect(rtIconRef(config, 'brand', 'search', true).urls).toContain('/icons-material/search.fill.svg');
    });

    it('SC-UKV-1881 — запись с именем встроенного набора меняет только названные поля', (): void => {
        const config: IRtIconSetsConfig = rtIconSetsConfig([{ name: 'material', url: '/static/material' }]);

        expect(config.warnings).toEqual([]);
        expect(rtIconRef(config, 'material', 'close', true).urls).toEqual([
            '/static/material/close.fill.svg',
            '/static/material/close.svg',
            '/icons/close.svg',
        ]);
    });
});
