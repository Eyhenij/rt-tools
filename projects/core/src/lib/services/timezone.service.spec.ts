import { TestBed } from '@angular/core/testing';

import { PlatformService } from './platform.service';
import { FALLBACK_TIMEZONE, RtTimezoneService } from './timezone.service';

/**
 * Среда подменяется двойником службы платформы, а не подстановкой признака среды в токен: служба
 * спрашивает среду именно у неё, и подмена ниже проверяет тот же путь, каким это идёт у
 * потребителя.
 *
 * Окружение подменяется своим `resolvedOptions`: настоящий ответ зависит от машины, на которой
 * идёт прогон, и сценарий, сверяющийся с ним, сходился бы только у того, кто его писал.
 */
function setup(isPlatformBrowser: boolean): RtTimezoneService {
    TestBed.configureTestingModule({
        providers: [RtTimezoneService, { provide: PlatformService, useValue: { isPlatformBrowser } }],
    });

    return TestBed.inject(RtTimezoneService);
}

describe('RtTimezoneService — SC-CR-05, SC-CR-06, SC-CR-07', () => {
    const original: () => Intl.ResolvedDateTimeFormatOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
    let reported: string;
    let asked: number;

    beforeEach(() => {
        reported = 'Europe/Minsk';
        asked = 0;
        Intl.DateTimeFormat.prototype.resolvedOptions = function resolvedOptions(): Intl.ResolvedDateTimeFormatOptions {
            asked += 1;

            return { ...original.call(this), timeZone: reported };
        };
    });

    afterEach(() => {
        Intl.DateTimeFormat.prototype.resolvedOptions = original;
    });

    describe('SC-CR-05 — в браузере отдаётся пояс читателя', () => {
        it('отвечает поясом, настроенным у читателя', () => {
            expect(setup(true).getCurrentTimezone()).toBe('Europe/Minsk');
        });
    });

    describe('SC-CR-06 — вне браузера отдаётся согласованный пояс', () => {
        it('отвечает согласованным поясом и окружения не спрашивает', () => {
            expect(setup(false).getCurrentTimezone()).toBe(FALLBACK_TIMEZONE);
            expect(asked).toBe(0);
        });
    });

    describe('SC-CR-07 — сменившийся пояс виден следующим обращением', () => {
        it('отвечает новым поясом, а не запомненным', () => {
            const service: RtTimezoneService = setup(true);

            expect(service.getCurrentTimezone()).toBe('Europe/Minsk');

            reported = 'Asia/Tokyo';

            expect(service.getCurrentTimezone()).toBe('Asia/Tokyo');
        });
    });
});
