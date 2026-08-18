import { TAsideButtonsType } from './aside.enums';

export namespace IAside {
    export interface HeaderActionButton {
        name: TAsideButtonsType;
        icon: string;
        color: string;
        tooltip: string;
        disabled?: boolean;
    }
}
