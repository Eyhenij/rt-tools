import { IRtIcon } from '../icon';

export namespace IRtPageHeader {
    /**
     * Описание пункта верхней навигации — раздела первого уровня или пункта
     * панели второго.
     *
     * Форма пункта решается его полями:
     * - `columns` с хотя бы одним пунктом внутри → кнопка-триггер с указателем
     *   раскрытия; панель открывается наведением, `route` родителя игнорируется,
     *   родитель подсвечивается при активном вложенном адресе;
     * - `route` задан и `!disabled` → анкор с `[routerLink]`/`routerLinkActive`;
     * - иначе → `<button>`: `itemClick` у доступного, ничего у недоступного.
     */
    export interface Item {
        readonly id: string;
        readonly label: string;
        /** У пункта панели иконку носит заголовок его группы, а не он сам. */
        readonly icon?: IRtIcon.Name;
        readonly route?: string;
        /** По умолчанию `false`. */
        readonly routerLinkActiveExact?: boolean;
        readonly disabled?: boolean;
        /**
         * Непросмотренное: пункт с признаком показывает точку у правого края.
         * У раздела с панелью точка горит и от признака любого пункта внутри.
         */
        readonly unread?: boolean;
        /** Панель второго уровня: колонка → группа → пункт. */
        readonly columns?: ReadonlyArray<Column>;
    }

    /** Колонка панели. Ширина панели считается числом колонок, а не содержимым. */
    export interface Column {
        readonly id: string;
        readonly groups: ReadonlyArray<Group>;
    }

    /** Группа пунктов внутри колонки. Без `label` группа идёт без заголовка. */
    export interface Group {
        readonly id: string;
        readonly label?: string;
        readonly icon?: IRtIcon.Name;
        readonly items: ReadonlyArray<Item>;
    }

    /**
     * Юзер-блок справа от навигации.
     *
     * `avatar` — заранее посчитанные инициалы (одна буква в верхнем регистре);
     * fallback'ом берётся первая буква `name`.
     */
    export interface User {
        readonly name: string;
        readonly avatar?: string;
    }
}
