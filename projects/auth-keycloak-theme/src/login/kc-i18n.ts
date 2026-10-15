import { InjectionToken } from '@angular/core';
import { i18nBuilder } from 'keycloakify/login/i18n/noJsx';

/**
 * The page texts are the Keycloak messages themselves, so the screen says what the realm mails say.
 * The theme adds words of its own only where Keycloak has none: the password requirements, which it
 * names only as refusals, the password placeholders, the provider row of the registration and the
 * Russian refusal for a password equal to the address. The Keycloakify build puts these messages
 * into the theme bundle of the server too, so a refusal Keycloak renders reads them.
 *
 * Every locale the theme ships carries the full set. A locale left out takes the English set of the
 * theme, and that set overrides Keycloak's own text for the same key: the German registration title
 * and refusal came out in English that way.
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
            rtPasswordPlaceholder: 'Enter the password',
            rtPasswordConfirmPlaceholder: 'Repeat the password',
            rtRegisterProviders: 'Or sign up with',
            invalidPasswordNotEmailMessage: 'Invalid password: must not be equal to the email.',
            registerTitle: 'Register',
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
            rtPasswordPlaceholder: 'Введите пароль',
            rtPasswordConfirmPlaceholder: 'Повторите пароль',
            rtRegisterProviders: 'Или зарегистрируйтесь через',
            invalidPasswordNotEmailMessage: 'Некорректный пароль: пароль не должен совпадать с почтой.',
            registerTitle: 'Регистрация',
        },
        de: {
            rtRuleList: 'Passwortanforderungen',
            rtRuleLength: 'Länge: mindestens {0}',
            rtRuleMaxLength: 'Länge: höchstens {0}',
            rtRuleUpperCase: 'Großbuchstaben: mindestens {0}',
            rtRuleLowerCase: 'Kleinbuchstaben: mindestens {0}',
            rtRuleDigits: 'Ziffern: mindestens {0}',
            rtRuleSpecialChars: 'Sonderzeichen: mindestens {0}',
            rtRuleNotUsername: 'Nicht identisch mit dem Benutzernamen',
            rtRuleNotEmail: 'Nicht identisch mit der E-Mail-Adresse',
            rtPasswordPlaceholder: 'Passwort eingeben',
            rtPasswordConfirmPlaceholder: 'Passwort wiederholen',
            rtRegisterProviders: 'Oder registrieren mit',
            invalidPasswordNotEmailMessage: 'Ungültiges Passwort: darf nicht identisch mit der E-Mail-Adresse sein.',
            registerTitle: 'Registrierung',
        },
        th: {
            rtRuleList: 'ข้อกำหนดของรหัสผ่าน',
            rtRuleLength: 'ความยาว: อย่างน้อย {0} ตัวอักษร',
            rtRuleMaxLength: 'ความยาว: ไม่เกิน {0} ตัวอักษร',
            rtRuleUpperCase: 'ตัวพิมพ์ใหญ่: อย่างน้อย {0} ตัว',
            rtRuleLowerCase: 'ตัวพิมพ์เล็ก: อย่างน้อย {0} ตัว',
            rtRuleDigits: 'ตัวเลข: อย่างน้อย {0} ตัว',
            rtRuleSpecialChars: 'อักขระพิเศษ: อย่างน้อย {0} ตัว',
            rtRuleNotUsername: 'ไม่ซ้ำกับชื่อผู้ใช้',
            rtRuleNotEmail: 'ไม่ซ้ำกับอีเมล',
            // eslint-disable-next-line sonarjs/no-hardcoded-passwords -- a text, not a password: the script puts no spaces between words
            rtPasswordPlaceholder: 'กรอกรหัสผ่าน',
            // eslint-disable-next-line sonarjs/no-hardcoded-passwords -- a text, not a password: the script puts no spaces between words
            rtPasswordConfirmPlaceholder: 'กรอกรหัสผ่านอีกครั้ง',
            rtRegisterProviders: 'หรือลงทะเบียนด้วย',
            invalidPasswordNotEmailMessage: 'รหัสผ่านไม่ถูกต้อง: ต้องไม่เหมือนกับอีเมล',
            registerTitle: 'ลงทะเบียน',
        },
        'zh-CN': {
            rtRuleList: '密码要求',
            rtRuleLength: '长度：至少 {0} 个字符',
            rtRuleMaxLength: '长度：最多 {0} 个字符',
            rtRuleUpperCase: '大写字母：至少 {0} 个',
            rtRuleLowerCase: '小写字母：至少 {0} 个',
            rtRuleDigits: '数字：至少 {0} 个',
            rtRuleSpecialChars: '特殊字符：至少 {0} 个',
            rtRuleNotUsername: '不能与用户名相同',
            rtRuleNotEmail: '不能与电子邮箱相同',
            rtPasswordPlaceholder: '输入密码',
            rtPasswordConfirmPlaceholder: '再次输入密码',
            rtRegisterProviders: '或通过以下方式注册',
            // eslint-disable-next-line sonarjs/no-hardcoded-passwords -- a text, not a password: the script puts no spaces between words
            invalidPasswordNotEmailMessage: '无效的密码：不能与电子邮箱地址相同。',
            registerTitle: '注册',
        },
        'zh-TW': {
            rtRuleList: '密碼要求',
            rtRuleLength: '長度：至少 {0} 個字元',
            rtRuleMaxLength: '長度：最多 {0} 個字元',
            rtRuleUpperCase: '大寫字母：至少 {0} 個',
            rtRuleLowerCase: '小寫字母：至少 {0} 個',
            rtRuleDigits: '數字：至少 {0} 個',
            rtRuleSpecialChars: '特殊字元：至少 {0} 個',
            rtRuleNotUsername: '不可與使用者名稱相同',
            rtRuleNotEmail: '不可與電子信箱相同',
            rtPasswordPlaceholder: '輸入密碼',
            rtPasswordConfirmPlaceholder: '再次輸入密碼',
            rtRegisterProviders: '或透過以下方式註冊',
            // eslint-disable-next-line sonarjs/no-hardcoded-passwords -- a text, not a password: the script puts no spaces between words
            invalidPasswordNotEmailMessage: '無效的密碼：不可與電子信箱相同。',
            registerTitle: '註冊',
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
