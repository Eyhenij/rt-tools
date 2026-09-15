/**
 * Решения раздела ролей и панели прав человека, вынесенные из экранов.
 *
 * Чистые функции без каркаса: их зовут переводы, панели и их тесты, а проверяются они вызовом —
 * без `TestBed` и без подмены зависимостей.
 */
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { IPermissionEdit, RIGHTS, rightsOf, TRight } from '@rt/message-bus-common';

import { EAccessWord } from './role.model';

/**
 * Вопрос перед удалением роли.
 *
 * Называет роль и то, что вернуть её нельзя, а не спрашивает «вы уверены»: человек решает по
 * имени и по цене, а не по слову «да».
 */
export function roleDeleteQuestion(name: string): string {
    return adminLabel('roleDeleteQuestion', { name });
}

/**
 * Можно ли удалить роль: только ту, которую никто не держит.
 *
 * Приёмник отказывает и сам; здесь решается, рисовать ли пункт — недоступное действие в меню не
 * рисуется вовсе, а не стоит серым.
 */
export function roleCanDelete(people: number): boolean {
    return people === 0;
}

/** Слово по одной правке: нет правки — решает роль. */
function wordOf(edit: IPermissionEdit | undefined): EAccessWord {
    if (edit === undefined) {
        return EAccessWord.ByRole;
    }

    return edit.granted ? EAccessWord.Granted : EAccessWord.Revoked;
}

/**
 * Слово на каждое право набора по точечным правкам человека.
 *
 * Права без правки решает роль; правка с признаком «дано» — слово «дано», без него — «отнято».
 * Набор проходится целиком, чтобы у каждого права было слово: панель показывает все права, а не
 * только те, что правились.
 */
export function accessWordsOf(edits: readonly IPermissionEdit[]): Readonly<Record<TRight, EAccessWord>> {
    const words: Partial<Record<TRight, EAccessWord>> = {};

    RIGHTS.forEach((right: TRight): void => {
        words[right] = wordOf(edits.find((one: IPermissionEdit): boolean => one.right === right));
    });

    return words as Readonly<Record<TRight, EAccessWord>>;
}

/** Точечные правки из слов: слово «по роли» правки не даёт, остальные два — по одной на право. */
export function editsOfWords(words: Readonly<Record<TRight, EAccessWord>>): IPermissionEdit[] {
    return RIGHTS.filter((right: TRight): boolean => words[right] !== EAccessWord.ByRole).map((right: TRight): IPermissionEdit => ({
        right,
        granted: words[right] === EAccessWord.Granted,
    }));
}

/**
 * Что выходит из роли и слов: есть ли право у человека.
 *
 * Считается тем же сложением, что у приёмника, из общей либы: панель показывает исход до
 * сохранения, и второе сложение разошлось бы с первым молча.
 */
export function accessOutcome(roleRights: readonly TRight[] | null, words: Readonly<Record<TRight, EAccessWord>>): ReadonlySet<TRight> {
    return rightsOf(roleRights, editsOfWords(words));
}
