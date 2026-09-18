import { TestBed } from '@angular/core/testing';
import { ERefusal } from '@rt/message-bus-common';
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

    it('SC-MB-402 — оба набора отвечают на каждый ключ экранов входа', () => {
        const { locale, text }: { locale: AdminLocaleService; text: AdminTextService } = services();

        // Ключи экрана входа и экрана первой записи: их переводит задача RT-2210, и ни один из
        // них не должен приходить признаком ненайденного ни на одном языке.
        const keys: readonly TAdminLabelKey[] = [
            'signInTitle',
            'signInTab',
            'signInName',
            'signInNameHint',
            'signInPassword',
            'signInPasswordHint',
            'signInSubmit',
            'signInFaultPair',
            'signInFaultForm',
            'signInFaultService',
            'setupTitle',
            'setupHint',
            'setupName',
            'setupPassword',
            'setupSubmit',
            'setupFailed',
        ];

        // Сначала положительная половина: отбор ниже узнаёт признак ненайденного — на английском
        // выборе ключ, который в наборе ещё не переведён, приходит именно им.
        locale.setLocale(EAdminLocale.En);

        expect(text.text('columnTree')).toBe('«columnTree»');

        for (const chosen of [EAdminLocale.Ru, EAdminLocale.En]) {
            locale.setLocale(chosen);

            const missing: TAdminLabelKey[] = keys.filter((key: TAdminLabelKey): boolean => text.text(key).startsWith('«'));

            expect(missing).toEqual([]);
        }
    });

    it('SC-MB-412 — у каждого кода отказа есть текст в обоих наборах', () => {
        const { locale, text }: { locale: AdminLocaleService; text: AdminTextService } = services();
        const codes: readonly ERefusal[] = Object.values(ERefusal);

        expect(codes.length).toBeGreaterThan(0);

        for (const chosen of [EAdminLocale.Ru, EAdminLocale.En]) {
            locale.setLocale(chosen);

            const missing: ERefusal[] = codes.filter((code: ERefusal): boolean => text.text(code).startsWith('«'));

            expect(missing).toEqual([]);
        }
    });

    it('SC-MB-410 — код, которого в наборе нет, виден признаком, а не пустотой', () => {
        const { text }: { locale: AdminLocaleService; text: AdminTextService } = services();

        // Сначала положительная половина: код набора приходит текстом.
        expect(text.text(ERefusal.RoleNameEmpty)).toBe('Роль ждёт имя');

        // Приёмник выкатывается отдельно от админки, и его новый код доезжает сюда именем.
        expect(text.text('невиданныйКод' as TAdminLabelKey)).toBe('«невиданныйКод»');
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
