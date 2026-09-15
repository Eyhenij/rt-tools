/**
 * Разбор правок над учётной записью, пришедших с экрана: заведение и новый пароль.
 *
 * Чистые функции без каркаса: контроллер зовёт их и переводит найденное в код отказа, а
 * проверяются они вызовом — без запроса и без базы. Здесь же слова отказов: они уходят человеку
 * в панель как есть, и второе место, где их писать, разошлось бы с первым.
 */
import { accountNameOk } from './account-name.util';

/** Заведение записи, как его разобрал приёмник: имя, каким его назвали, и первый пароль. */
export interface INewPersonInput {
    readonly name: string;
    readonly password: string;
}

/** Чего не хватило в правке. Набор закрыт: контроллер переводит каждое в свой код отказа. */
export enum EPersonInputFault {
    NameEmpty = 'name-empty',
    PasswordEmpty = 'password-empty',
}

/** Разбор пароля: либо пароль, либо чего не хватило. Ровно одно из двух заполнено. */
export interface IPasswordParse {
    readonly password: string;
    readonly fault: EPersonInputFault | null;
}

/** Разбор заведения: либо запись, либо чего не хватило. Ровно одно из двух заполнено. */
export interface INewPersonParse {
    readonly input: INewPersonInput | null;
    readonly fault: EPersonInputFault | null;
}

/** Слова отказов: человеку в панель, и потому по-русски и про его же действие. */
export const PERSON_EDIT_SAID: Readonly<Record<EPersonInputFault, string>> = {
    [EPersonInputFault.NameEmpty]: 'заведение ждёт имя пользователя',
    [EPersonInputFault.PasswordEmpty]: 'пользователю нужен пароль: пустой не принимается',
};

/** Поле тела запроса строкой. Не строка и пустота читаются одинаково: поля нет. */
function fieldOf(body: unknown, key: string): string {
    const raw: unknown = typeof body === 'object' && body !== null ? Reflect.get(body, key) : undefined;

    return typeof raw === 'string' ? raw : '';
}

/**
 * Пароль из тела запроса. Пустой — отказ: запись без пароля выглядела бы заведённой, а войти ею
 * не смог бы никто. Края пароля не обрезаются: пробел в нём — часть пароля.
 */
export function passwordOf(body: unknown): IPasswordParse {
    const password: string = fieldOf(body, 'password');

    return { password, fault: password.length > 0 ? null : EPersonInputFault.PasswordEmpty };
}

/**
 * Заведение из тела запроса: имя с обрезанными краями и пароль как есть.
 *
 * Имя судится раньше пароля: пустое имя — первое, что человек увидит в форме, и отказ о пароле
 * при пустом имени отправил бы его чинить второе поле, оставив первое.
 */
export function newPersonOf(body: unknown): INewPersonParse {
    const name: string = fieldOf(body, 'name');

    if (!accountNameOk(name)) {
        return { input: null, fault: EPersonInputFault.NameEmpty };
    }

    const parsed: IPasswordParse = passwordOf(body);

    return parsed.fault === null
        ? { input: { name: name.trim(), password: parsed.password }, fault: null }
        : { input: null, fault: parsed.fault };
}
