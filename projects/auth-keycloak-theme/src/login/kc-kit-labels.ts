import { TRtKitLabelKey, TRtKitTranslator } from '@rt-tools/ui-kit-v2';

/** The kit labels the theme draws: the password eye, the clear cross, the theme switch, the hint. */
type TThemeKitLabelKey = 'uiShowPassword' | 'uiHidePassword' | 'uiClear' | 'uiClose' | 'uiHint' | 'themeToggleLabel';

/**
 * The Russian of the kit labels the theme draws. The record is full over the keys the theme
 * uses: a key the theme starts drawing is added to the type first, and the record stops compiling.
 */
const KIT_LABELS_RU: Readonly<Record<TThemeKitLabelKey, string>> = Object.freeze({
    uiShowPassword: 'Показать пароль',
    uiHidePassword: 'Скрыть пароль',
    uiClear: 'Очистить',
    uiClose: 'Закрыть',
    uiHint: 'Подсказка',
    themeToggleLabel: 'Переключить тему',
});

function isThemeKey(key: TRtKitLabelKey): key is TThemeKitLabelKey {
    return Object.hasOwn(KIT_LABELS_RU, key);
}

/**
 * The kit translator for the page locale. The kit labels follow the locale of the page, so one
 * page never mixes two languages. An empty answer makes the kit take its own English label.
 */
export function kitTranslatorFor(languageTag: string): TRtKitTranslator {
    return (key: TRtKitLabelKey): string => (languageTag === 'ru' && isThemeKey(key) ? KIT_LABELS_RU[key] : '');
}
