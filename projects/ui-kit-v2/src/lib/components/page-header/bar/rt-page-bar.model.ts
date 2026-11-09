import { IRtIcon } from '@rt-tools/ui-kit-v2/core';

export namespace IRtPageBar {
    /** Действие страницы: кнопка с иконкой в ряду, строка меню в узком виде. */
    export interface Action {
        readonly id: string;
        readonly label: string;
        readonly icon: IRtIcon.Name;
        readonly disabled?: boolean;
    }
}
