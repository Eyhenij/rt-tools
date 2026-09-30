export namespace IRtSideMenu {
    export type ItemData = string | number | object;

    /**
     * Чем подменю держится открытым: наведением или закреплением — тогда оно стоит открытым, пока
     * человек сам его не свернёт.
     */
    export type SubMenuMode = 'hover' | 'pinned';

    /**
     * Настройки одного меню под его номером в хранилище. Незнакомые поля кит не удаляет: их могло
     * положить приложение или следующая версия кита.
     */
    export interface Settings {
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
