import { TestBed } from '@angular/core/testing';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';

import { TAdminLabelKey } from './admin-labels';
import { AdminLocaleService, EAdminLocale } from './admin-locale';
import { AdminTextService } from './admin-text.service';

/** Обе службы поднимаются заново на каждый случай: выбор языка служба читает при заведении. */
function services(): { locale: AdminLocaleService; text: AdminTextService } {
    TestBed.configureTestingModule({ providers: [provideRtUtils(), provideRtStorage()] });

    return { locale: TestBed.inject(AdminLocaleService), text: TestBed.inject(AdminTextService) };
}

describe('AdminTextService', () => {
    afterEach(() => {
        TestBed.resetTestingModule();
        localStorage.clear();
    });

    it('SC-MB-402 — подпись приходит из словаря на выбранном языке', () => {
        const { locale, text }: { locale: AdminLocaleService; text: AdminTextService } = services();

        expect(text.text('signOut')).toBe('Выйти');

        locale.setLocale(EAdminLocale.En);

        expect(text.text('signOut')).toBe('Sign out');
    });

    it('SC-MB-402 — длинная подпись переведена целиком, а не наполовину', () => {
        const { locale, text }: { locale: AdminLocaleService; text: AdminTextService } = services();
        const key: TAdminLabelKey = 'setupHint';

        expect(text.text(key)).toContain('Записей в приёмнике');

        locale.setLocale(EAdminLocale.En);

        expect(text.text(key)).toContain('holds no records yet');
    });

    it('SC-MB-403 — ненайденный ключ виден, а не пуст', () => {
        const { locale, text }: { locale: AdminLocaleService; text: AdminTextService } = services();

        // Сначала положительная половина: ключ, который в английском наборе есть, приходит текстом.
        locale.setLocale(EAdminLocale.En);

        expect(text.text('signOut')).toBe('Sign out');

        // А ключ, которого в нём ещё нет, — признаком: его переводят задачи RT-2210 и RT-2211.
        expect(text.text('columnTree')).toBe('«columnTree»');
    });
});
