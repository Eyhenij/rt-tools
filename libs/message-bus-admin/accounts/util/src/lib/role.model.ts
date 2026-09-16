/**
 * Роль приёмника и доступ человека, какими их читает админка.
 *
 * Сторона контракта своей копии здесь не заводит: формы объявлены один раз, на обе стороны, и
 * берутся из общей либы. Своя копия расходилась бы с приёмом молча, а компилируется из двух одна.
 *
 * У роли уровень один: строка списка и есть вся роль — ключ, имя, права и число людей; панель
 * читает ту же форму по ключу из адреса. Подписи прав и вопрос удаления лежат готовыми полями,
 * а не считаются в шаблоне: шаблон методов не зовёт.
 */
import { IPersonAccessView, IRoleView, TRight } from '@rt/message-bus-common';

export namespace IRole {
    /** Строка списка и запись панели: у роли они совпадают. */
    export namespace Short {
        /** Сторона контракта. */
        export type Api = IRoleView;

        /** Сторона экрана. */
        export interface State {
            /** Ключ роли: им она называется в адресе панели. Человеку не показывается. */
            readonly key: string;
            /** Имя, как его видит человек. */
            readonly name: string;
            /** Права роли из закрытого набора. */
            readonly rights: readonly TRight[];
            /** Права словами, через запятую. Роль без прав говорит об этом словами, а не пустотой. */
            readonly rightsLabel: string;
            /** Сколько записей держат роль. */
            readonly people: number;
            /** Можно ли удалить: роль, которую держат, не удаляется, и пункт меню не рисуется. */
            readonly canDelete: boolean;
            /** Вопрос перед удалением: называет роль и то, что вернуть её нельзя. */
            readonly deleteQuestion: string;
        }
    }
}

/** Одно из трёх слов о праве у человека: решает роль, дано лично, отнято лично. */
export enum EAccessWord {
    ByRole = 'by-role',
    Granted = 'granted',
    Revoked = 'revoked',
}

export namespace IPersonAccess {
    /** Сторона контракта. */
    export type Api = IPersonAccessView;

    /** Сторона экрана: слово на каждое право набора и права, которые из всего выходят. */
    export interface State {
        readonly name: string;
        /** Ключ роли. Пусто — роли нет. */
        readonly role: string | null;
        /** Слово на каждое право набора. */
        readonly words: Readonly<Record<TRight, EAccessWord>>;
        /** Что выходит из роли и слов вместе. */
        readonly rights: readonly TRight[];
    }
}
