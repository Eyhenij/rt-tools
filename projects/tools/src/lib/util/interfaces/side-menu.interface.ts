export namespace ISideMenu {
    export interface Item {
        id: string | number;

        icon?: string;
        name?: string;
        link?: string;
        submenu?: Item[];
        iconButton?: {
            icon: string;
            data?: any;
        };
    }
}
