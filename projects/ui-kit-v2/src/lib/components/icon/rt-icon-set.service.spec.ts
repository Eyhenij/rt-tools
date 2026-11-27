import { TestBed } from '@angular/core/testing';

import { RtIconSetService } from './rt-icon-set.service';
import { provideRtIcons } from './rt-icon.providers';

describe('RtIconSetService', (): void => {
    let warn: jest.SpyInstance;

    function service(): RtIconSetService {
        TestBed.configureTestingModule({ providers: [provideRtIcons({ sets: [{ name: 'brand', url: '/brand' }] })] });

        return TestBed.inject(RtIconSetService);
    }

    beforeEach((): void => {
        warn = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
    });

    afterEach((): void => warn.mockRestore());

    it('SC-UKV-1878 — use() запоминает объявленный набор, незнакомое имя даёт kit, null снимает выбор', (): void => {
        const sets: RtIconSetService = service();

        sets.use('brand');
        expect(sets.chosen()).toBe('brand');

        sets.use('brnd');
        expect(sets.chosen()).toBe('kit');
        expect(warn).toHaveBeenCalledTimes(1);

        sets.use(null);
        expect(sets.chosen()).toBeNull();
    });

    it.each<[string | null | undefined, string | null | undefined]>([
        ['', undefined],
        [undefined, undefined],
        [null, null],
        ['brand', 'brand'],
        ['brnd', 'kit'],
    ])('SC-UKV-1891 — настройка окна %p значит %p', (named: string | null | undefined, taken: string | null | undefined): void => {
        expect(service().asked(named)).toBe(taken);
    });
});
