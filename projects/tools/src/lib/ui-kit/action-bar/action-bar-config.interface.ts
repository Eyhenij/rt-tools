export namespace IRtActionBar {
    export interface Config {
        selected?: number;
        total?: number;
        buttons?: IRtActionBar.Button[];
    }

    export interface Button {
        title: string;
        action?: (payload?: object) => void;
        icon?: string;
        menu?: IRtActionBar.Button[];
        styles?: object;
    }
}
