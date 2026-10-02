export namespace IRtSideMenu {
    export type ItemData = string | number | object;

    /**
     * Чем подменю держится открытым: наведением или закреплением — тогда оно стоит открытым, пока
     * человек сам его не свернёт.
     */
    export type SubMenuMode = 'hover' | 'pinned';

    /** Номер пункта в списке избранного — тот же, что `id` пункта меню. */
    export type FavoriteId = Item['id'];

    /**
     * Место под скрытые кнопки строки: `always` — кнопка, ждущая наведения, держит свою ширину;
     * `none` — в покое ширины не занимает, и подпись идёт до края.
     */
    export type FavoriteActionsReserve = 'always' | 'none';

    /**
     * Число строк в заголовке блока избранного: `always` — всегда; `collapsed` — только у свёрнутого
     * блока; `never` — никогда.
     */
    export type FavoritesCount = 'always' | 'collapsed' | 'never';

    /**
     * Настройки одного меню под его номером в хранилище. Незнакомые поля кит не удаляет: их могло
     * положить приложение или следующая версия кита.
     */
    export interface Settings {
        favorites?: FavoriteId[];
        /** Пункты полосы, чей блок избранного свёрнут; блок по умолчанию развёрнут. */
        favoritesCollapsed?: Array<Item['id']>;
        subMenuMode?: SubMenuMode;
        subMenuWidth?: number;
        [field: string]: unknown;
    }

    export interface Item {
        id: string | number;

        icon?: string;
        name?: string;
        link?: string;
        submenu?: Item[];
        /** Избранное в подменю этого пункта полосы. По умолчанию выключено. */
        favorites?: boolean;
        /**
         * Пункт со ссылкой, который в избранное не ставится: своя страница раздела, дашборд,
         * действие «Создать». Звезды у него нет, и номер, сохранённый раньше, в блок не попадает.
         */
        favoriteDisabled?: boolean;
        iconButton?: {
            icon: string;
            data?: ItemData;
        };
    }

    /** Кусок подписи: отмеченный — тот, которым она совпала с запросом. */
    export interface TitlePart {
        text: string;
        matched: boolean;
    }
}
