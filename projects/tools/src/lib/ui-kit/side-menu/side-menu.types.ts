export namespace ISideMenu {
    export type ItemData = string | number | object;

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
}
