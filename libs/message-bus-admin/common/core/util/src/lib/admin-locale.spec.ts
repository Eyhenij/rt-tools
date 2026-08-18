import { TestBed } from '@angular/core/testing';
import { provideRtStorage, provideRtUtils, StorageService } from '@rt-tools/core';
import { RtKitTranslator } from '@rt-tools/ui-kit-v2';

import { AdminLocaleService, EAdminLocale, EAdminStorageKeys } from './admin-locale';

/** Служба поднимается заново на каждый случай: выбор она читает один раз, при заведении. */
function localeService(): AdminLocaleService {
    TestBed.configureTestingModule({ providers: [provideRtUtils(), provideRtStorage()] });

    return TestBed.inject(AdminLocaleService);
}

/**
 * Значение кладётся в хранилище так, как его туда кладёт хранилище кита, — строкой JSON. Сырая
 * строка читалась бы как испорченная запись, и тест подтверждал бы умолчание вместо выбора.
 */
function storeLocale(value: string): void {
    localStorage.setItem(EAdminStorageKeys.Locale, JSON.stringify(value));
}

describe('AdminLocaleService', () => {
    afterEach(() => {
        TestBed.resetTestingModule();
        localStorage.clear();
    });

    it('первый заход идёт по-русски: подписи кита встают рядом с русскими заголовками', () => {
        const service: AdminLocaleService = localeService();

        expect(service.current()).toBe(EAdminLocale.Ru);
        expect(service.tag()).toBe('ru');
    });

    it('SC-MB-150 — выбор пережил перезагрузку: он прочитан из хранилища устройства', () => {
        storeLocale(EAdminLocale.En);

        expect(localeService().current()).toBe(EAdminLocale.En);
    });

    it('SC-MB-150 — выбранный язык уходит в хранилище устройства, а не только в сигнал', () => {
        const service: AdminLocaleService = localeService();

        service.setLocale(EAdminLocale.En);

        expect(service.current()).toBe(EAdminLocale.En);
        expect(TestBed.inject(StorageService).getItem<string>(EAdminStorageKeys.Locale)).toBe(EAdminLocale.En);
    });

    it('чужое значение в хранилище языком не считается — берётся русский', () => {
        storeLocale('de');

        expect(localeService().current()).toBe(EAdminLocale.Ru);
    });

    it('SC-MB-149 — русский выбор отвечает подписями приложения, английский не отвечает вовсе', () => {
        const service: AdminLocaleService = localeService();

        const ru: RtKitTranslator = service.translator();

        expect(ru('uiClose')).toBe('Закрыть');

        service.setLocale(EAdminLocale.En);

        const en: RtKitTranslator = service.translator();

        expect(en('uiClose')).toBe('');
    });
});
