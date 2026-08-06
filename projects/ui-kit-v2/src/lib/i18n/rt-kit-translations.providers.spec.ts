import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Observable, of } from 'rxjs';

import { provideTransloco, Translation, TranslocoLoader, TranslocoService } from '@jsverse/transloco';

import { RT_KIT_TRANSLATIONS } from './rt-kit-translations';
import { provideRtKitTranslations } from './rt-kit-translations.providers';

/**
 * Словарь приложения: пустой, чтобы видеть только то, что положил кит. Отдаёт
 * `of(...)`, а не готовый объект: Transloco оборачивает результат в `from()`,
 * и обычный объект там падает, а отказ гасится внутренним `catchError` — язык
 * остаётся пустым молча.
 */
class EmptyLoader implements TranslocoLoader {
    public getTranslation(): Observable<Translation> {
        return of({});
    }
}

async function setup(
    overrides: Readonly<Record<string, Readonly<Record<string, string>>>> = {},
    availableLangs: string[] = ['en', 'ru']
): Promise<TranslocoService> {
    TestBed.configureTestingModule({
        providers: [
            provideTransloco({
                config: { availableLangs, defaultLang: 'en', reRenderOnLangChange: true },
                loader: EmptyLoader,
            }),
            provideRtKitTranslations(overrides),
        ],
    });
    // Провайдер раскладывает словари инициализатором приложения, а TestBed сам
    // их не гоняет — без этой строки словарь пуст, и проверялось бы ничто.
    await TestBed.inject(ApplicationInitStatus).donePromise;
    return TestBed.inject(TranslocoService);
}

describe('provideRtKitTranslations', (): void => {
    it('подписи кита читаются полным ключом с неймспейсом', async (): Promise<void> => {
        const transloco: TranslocoService = await setup();

        expect(transloco.translate('rtKit.uiClose', {}, 'en')).toBe(RT_KIT_TRANSLATIONS['en']['uiClose']);
    });

    it('каждый заявленный язык получает свой словарь', async (): Promise<void> => {
        const transloco: TranslocoService = await setup({}, ['en', 'ru', 'de']);

        expect(transloco.translate('rtKit.uiClose', {}, 'ru')).toBe(RT_KIT_TRANSLATIONS['ru']['uiClose']);
        expect(transloco.translate('rtKit.uiClose', {}, 'de')).toBe(RT_KIT_TRANSLATIONS['de']['uiClose']);
    });

    it('словарь приложения перекрывает подпись кита по одному ключу', async (): Promise<void> => {
        const transloco: TranslocoService = await setup({ en: { uiClose: 'Dismiss' } });

        expect(transloco.translate('rtKit.uiClose', {}, 'en')).toBe('Dismiss');
        // Остальные ключи того же языка при этом остаются на месте.
        expect(transloco.translate('rtKit.uiCancel', {}, 'en')).toBe(RT_KIT_TRANSLATIONS['en']['uiCancel']);
    });

    it('язык, которого в пакете нет, добавляется тем же провайдером', async (): Promise<void> => {
        const transloco: TranslocoService = await setup({ fr: { uiClose: 'Fermer' } }, ['en', 'fr']);

        expect(transloco.translate('rtKit.uiClose', {}, 'fr')).toBe('Fermer');
    });

    it('язык, не заявленный приложением, Transloco считает не языком, а скоупом', async (): Promise<void> => {
        // Границу задаёт сам Transloco: `availableLangs` — единственный список,
        // по которому он отличает язык от имени скоупа. Кит раскладывает словари
        // по всем восьми, но прочитаются только заявленные приложением.
        const transloco: TranslocoService = await setup({}, ['en']);

        expect(transloco.translate('rtKit.uiClose', {}, 'de')).not.toBe(RT_KIT_TRANSLATIONS['de']['uiClose']);
    });
});
