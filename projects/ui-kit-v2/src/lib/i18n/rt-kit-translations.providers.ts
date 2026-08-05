import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';

import { TranslocoService } from '@jsverse/transloco';

import { RT_KIT_TRANSLATIONS } from './rt-kit-translations';

/**
 * Неймспейс, под которым лежат подписи кита. Он же — префикс ключа в разметке:
 * `'rtKit.uiClose' | transloco`.
 */
export const RT_KIT_TRANSLATION_NAMESPACE: string = 'rtKit';

/**
 * Подключает словари кита к Transloco приложения.
 *
 * Кит рисует часть подписей сам — кнопки диалогов, тексты ошибок поля,
 * расшифровки иконок для скринридера, — и без этого провайдера на экране
 * остались бы ключи. Словари вшиты в пакет: сеть за ними не ходит и копировать
 * ассеты не нужно.
 *
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *     providers: [provideTransloco({ config, loader }), provideRtKitTranslations()],
 * };
 * ```
 *
 * Ключи ложатся в общий словарь языка под собственным неймспейсом, а не
 * скоупом Transloco: скоуп, объявленный на корне, приписался бы и ко всем
 * ключам приложения. Загрузку своих словарей это не задевает — они прилетают
 * позже и домешиваются рядом.
 *
 * Раскладываются все восемь языков, но прочитаются только заявленные в
 * `availableLangs` приложения: язык вне этого списка Transloco считает не
 * языком, а именем скоупа, и ключ по нему не найдётся.
 *
 * @param translations Свои словари поверх вшитых: ключи ложатся сверху по
 *   каждому языку отдельно. Так переопределяется одна подпись, а не весь набор,
 *   и так же добавляется язык, которого в пакете нет.
 */
export function provideRtKitTranslations(
    translations: Readonly<Record<string, Readonly<Record<string, string>>>> = {}
): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideAppInitializer((): void => {
            const transloco: TranslocoService = inject(TranslocoService);
            const langs: string[] = [...new Set([...Object.keys(RT_KIT_TRANSLATIONS), ...Object.keys(translations)])];
            for (const lang of langs) {
                transloco.setTranslation(
                    { [RT_KIT_TRANSLATION_NAMESPACE]: { ...RT_KIT_TRANSLATIONS[lang], ...translations[lang] } },
                    lang,
                    // Разметки на экране ещё нет — перерисовывать нечего, а
                    // событие на каждый из языков подняло бы её восемь раз.
                    { emitChange: false }
                );
            }
        }),
    ]);
}
