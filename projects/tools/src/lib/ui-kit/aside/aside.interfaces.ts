import { AsideButtonsType } from './aside.enums';

export namespace IAside {
    export interface HeaderActionButton {
        name: AsideButtonsType;
        icon: string;
        color: string;
        tooltip: string;
        disabled?: boolean;
    }
}
