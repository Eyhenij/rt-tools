import { AsideButtonsType } from '../enums/aside-buttons.enum';

export namespace IAside {
    export interface HeaderActionButton {
        name: AsideButtonsType;
        icon: string;
        color: string;
        tooltip: string;
        disabled?: boolean;
    }
}
