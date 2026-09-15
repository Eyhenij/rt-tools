/**
 * Права: закрытый набор и сложение роли с точечными правками.
 *
 * Набор закрыт кодом, а не таблицей в хранилище: право называет объявление операции, и объявление
 * ссылается на имя, которое есть. Строка таблицы прав позволила бы завести право, которого не
 * читает ни одна операция, — и от опечатки такую строку не отличить ничем.
 *
 * Лежит в общей либе, потому что имя права называют обе стороны: приёмник закрывает им операцию,
 * админка — пункт меню и адрес раздела. Второй список имён разошёлся бы с первым молча, и обе
 * стороны остались бы зелёными: одна закрывает своим именем, другая спрашивает своим.
 *
 * Сложение вынесено сюда чистой функцией, потому что решение здесь одно и проверяется вызовом:
 * проверка доступа остаётся тонкой обёрткой, которая читает хранилище и зовёт это.
 */

/** Право: пара «раздел и действие». Набор закрыт — здесь он весь. */
export type TRight =
    | 'postmortems:read'
    | 'postmortems:manage'
    | 'proposals:read'
    | 'proposals:manage'
    | 'summaries:read'
    | 'usage:read'
    | 'invites:read'
    | 'invites:manage'
    | 'accounts:read'
    | 'accounts:manage'
    | 'roles:manage';

/**
 * Все права набора одним перечнем.
 *
 * Нужен не для показа, а для отбора: и роль, и точечная правка приезжают строками из хранилища,
 * и строка, которой в наборе нет, — опечатка либо остаток снятого права. Такая строка правом не
 * считается и в сложение не попадает.
 */
export const RIGHTS: readonly TRight[] = Object.freeze([
    'postmortems:read',
    'postmortems:manage',
    'proposals:read',
    'proposals:manage',
    'summaries:read',
    'usage:read',
    'invites:read',
    'invites:manage',
    'accounts:read',
    'accounts:manage',
    'roles:manage',
] as const);

/** Есть ли такое право в наборе. Строка не из набора правом не считается нигде. */
export function isRight(name: string): name is TRight {
    return (RIGHTS as readonly string[]).includes(name);
}

/** Точечная правка права у одного человека: дано или отнято поверх роли. */
export interface IPermissionEdit {
    readonly right: string;
    readonly granted: boolean;
}

/**
 * Права человека: права его роли, поверх которых легли точечные правки.
 *
 * Роли нет — прав нет ни одного: человек вошёл и не видит ни одного раздела. Это законное
 * состояние, а не поломка: заведение и назначение роли разведены во времени.
 *
 * Правка с `granted: false` снимает право, которое роль даёт. Именно колонкой, а не отсутствием
 * строки: иначе отнять данное ролью нечем.
 */
export function rightsOf(roleRights: readonly string[] | null, edits: readonly IPermissionEdit[] = []): ReadonlySet<TRight> {
    const rights: Set<TRight> = new Set<TRight>((roleRights ?? []).filter(isRight));

    edits.forEach((edit: IPermissionEdit): void => {
        if (!isRight(edit.right)) {
            return;
        }

        if (edit.granted) {
            rights.add(edit.right);
        } else {
            rights.delete(edit.right);
        }
    });

    return rights;
}

/**
 * Дано ли право.
 *
 * Право, о котором роль молчит, считается не данным: молчание — не разрешение, и отсутствующее
 * право неотличимо от прямо отнятого.
 */
export function hasRight(rights: ReadonlySet<TRight>, right: TRight): boolean {
    return rights.has(right);
}
