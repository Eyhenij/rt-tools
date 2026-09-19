/**
 * Разбор правок над ролями и над доступом человека, пришедших с экрана.
 *
 * Чистые функции без каркаса: контроллер зовёт их и отвечает найденным кодом, а проверяются они
 * вызовом — без запроса и без базы. Слова отказа здесь нет: причина названа кодом, а текст по нему
 * рисует админка на выбранном языке.
 *
 * Право судится по закрытому набору общей либы: строка не из набора — опечатка либо остаток
 * снятого права, и роль с ней разрешала бы ничего, выглядя разрешающей.
 */
import {
    ERefusal,
    hasRight,
    IPermissionEdit,
    IPersonAccessInput,
    IRefusal,
    IRoleInput,
    isRight,
    rightsOf,
    TRight,
} from '@rt/message-bus-common';

import { accountNameOk } from './account-name.util';

/** Разбор роли: либо роль, либо чего не хватило. Ровно одно из двух заполнено. */
export interface IRoleParse {
    readonly input: IRoleInput | null;
    readonly fault: IRefusal | null;
}

/** Разбор доступа: либо доступ, либо чего не хватило. Ровно одно из двух заполнено. */
export interface IAccessParse {
    readonly input: IPersonAccessInput | null;
    readonly fault: IRefusal | null;
}

/** Право, которым закрыт весь предмет; без него правка ролей и доступа не открывается. */
export const ROLES_RIGHT: TRight = 'roles:manage';

/** Поле тела запроса как есть. Не объект — полей нет. */
function fieldOf(body: unknown, key: string): unknown {
    return typeof body === 'object' && body !== null ? Reflect.get(body, key) : undefined;
}

/** Строка поля тела. Не строка и пустота читаются одинаково: поля нет. */
function stringOf(body: unknown, key: string): string {
    const raw: unknown = fieldOf(body, key);

    return typeof raw === 'string' ? raw : '';
}

/**
 * Права из списка строк: каждая — право набора, и ни одно не названо дважды.
 *
 * Повтор отбивается, а не схлопывается: два одинаковых права в одной роли значат, что экран
 * прислал не то, что показывал, и молчаливая склейка спрятала бы это.
 */
function rightsFrom(raw: unknown): { rights: TRight[]; fault: IRefusal | null } {
    const list: unknown[] = Array.isArray(raw) ? raw : [];
    const rights: TRight[] = [];

    for (const item of list) {
        if (typeof item !== 'string' || !isRight(item)) {
            return { rights, fault: { code: ERefusal.RightUnknown, params: { right: String(item) } } };
        }

        if (rights.includes(item)) {
            return { rights, fault: { code: ERefusal.RightRepeated, params: { right: item } } };
        }

        rights.push(item);
    }

    return { rights, fault: null };
}

/**
 * Роль из тела запроса: имя с обрезанными краями и права.
 *
 * Имя судится раньше прав: пустое имя — первое, что человек увидит в форме, и отказ о правах при
 * пустом имени отправил бы его чинить второе поле, оставив первое.
 */
export function roleInputOf(body: unknown): IRoleParse {
    const name: string = stringOf(body, 'name');

    if (!accountNameOk(name)) {
        return { input: null, fault: { code: ERefusal.RoleNameEmpty } };
    }

    const parsed: { rights: TRight[]; fault: IRefusal | null } = rightsFrom(fieldOf(body, 'rights'));

    return parsed.fault ? { input: null, fault: parsed.fault } : { input: { name: name.trim(), rights: parsed.rights }, fault: null };
}

/**
 * Доступ из тела запроса: ключ роли либо пусто, и точечные правки.
 *
 * Правка — пара «право и дано ли»; право одно на правку, и одно право не правится дважды: две
 * строки об одном праве не читаются ни в какую сторону.
 */
export function accessInputOf(body: unknown): IAccessParse {
    const rawRole: unknown = fieldOf(body, 'role');
    const role: string | null = typeof rawRole === 'string' && rawRole.trim().length > 0 ? rawRole.trim() : null;
    const rawEdits: unknown = fieldOf(body, 'edits');
    const list: unknown[] = Array.isArray(rawEdits) ? rawEdits : [];
    const edits: IPermissionEdit[] = [];

    for (const item of list) {
        const right: unknown = fieldOf(item, 'right');
        const granted: unknown = fieldOf(item, 'granted');

        if (typeof right !== 'string' || typeof granted !== 'boolean') {
            return { input: null, fault: { code: ERefusal.EditMalformed } };
        }

        if (!isRight(right)) {
            return { input: null, fault: { code: ERefusal.RightUnknown, params: { right } } };
        }

        if (edits.some((edit: IPermissionEdit): boolean => edit.right === right)) {
            return { input: null, fault: { code: ERefusal.RightRepeated, params: { right } } };
        }

        edits.push({ right, granted });
    }

    return { input: { role, edits }, fault: null };
}

/**
 * Останется ли право на роли после правки: набор роли и правки поверх него сложены заново.
 *
 * Считается вызовом, а не чтением хранилища: контроллер подставляет то, что собирается записать,
 * и отказывает раньше записи. Иначе следующий же переход того, кто правил, кончался бы отказом
 * той самой страницы, на которой он стоит.
 */
export function keepsRolesRight(roleRights: readonly string[] | null, edits: readonly IPermissionEdit[]): boolean {
    return hasRight(rightsOf(roleRights, edits), ROLES_RIGHT);
}
