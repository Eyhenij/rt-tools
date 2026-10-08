import { InjectionToken } from '@angular/core';
import { i18nBuilder } from 'keycloakify/login/i18n/noJsx';

/**
 * The page texts are the Keycloak messages themselves, so the screen says what the realm mails say.
 * The theme adds words of its own only where Keycloak has none: the password requirements, which it
 * names only as refusals.
 */
const { getI18n } = i18nBuilder
    .withThemeName<'rt'>()
    .withCustomTranslations({
        en: {
            rtRuleList: 'Password requirements',
            rtRuleLength: 'Length: at least {0}',
            rtRuleMaxLength: 'Length: at most {0}',
            rtRuleUpperCase: 'Upper case letters: at least {0}',
            rtRuleLowerCase: 'Lower case letters: at least {0}',
            rtRuleDigits: 'Digits: at least {0}',
            rtRuleSpecialChars: 'Special characters: at least {0}',
            rtRuleNotUsername: 'Not the same as the username',
            rtRuleNotEmail: 'Not the same as the email',
        },
        ru: {
            rtRuleList: 'Требования к паролю',
            rtRuleLength: 'Длина: не меньше {0}',
            rtRuleMaxLength: 'Длина: не больше {0}',
            rtRuleUpperCase: 'Заглавных букв: не меньше {0}',
            rtRuleLowerCase: 'Строчных букв: не меньше {0}',
            rtRuleDigits: 'Цифр: не меньше {0}',
            rtRuleSpecialChars: 'Спецсимволов: не меньше {0}',
            rtRuleNotUsername: 'Не совпадает с логином',
            rtRuleNotEmail: 'Не совпадает с почтой',
        },
    })
    .build();

/** The messages of the page locale. */
export type TKcMessages = ReturnType<typeof getI18n>['i18n'];

export { getI18n };

/**
 * A Keycloak message as plain text. The messages carry HTML entities — `&laquo;` in "back to
 * login" — that the standard theme inserts as markup; the theme puts text, and an entity left as
 * it is shows on the screen literally. The parser only reads the string: it runs no script.
 */
export function plainMessage(message: string): string {
    if (!message.includes('&') && !message.includes('<')) {
        return message;
    }

    return new DOMParser().parseFromString(message, 'text/html').documentElement.textContent ?? '';
}

/**
 * The text of a link back to the sign-in or to the application, or of a link forward to the next
 * step. Keycloak starts these messages with a chevron — « back, » forward — and the theme shows the
 * link as plain text without it.
 */
export function backLinkText(message: string): string {
    return message.replace(/^[\s«‹<»›>]+/u, '');
}

/** The messages of the page with every text already plain: the pages read them as they are. */
export function plainMessages(i18n: TKcMessages): TKcMessages {
    const msgStr: TKcMessages['msgStr'] = (...args: Parameters<TKcMessages['msgStr']>): string => plainMessage(i18n.msgStr(...args));
    const advancedMsgStr: TKcMessages['advancedMsgStr'] = (...args: Parameters<TKcMessages['advancedMsgStr']>): string =>
        plainMessage(i18n.advancedMsgStr(...args));

    return { ...i18n, msgStr, advancedMsgStr };
}

/** The messages of the page being drawn, already in its locale. */
export const KC_MESSAGES: InjectionToken<TKcMessages> = new InjectionToken<TKcMessages>('KC_MESSAGES');
