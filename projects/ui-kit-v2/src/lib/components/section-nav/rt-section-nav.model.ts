import { IRtIcon } from '@rt-tools/ui-kit-v2/core';

export namespace IRtSectionNav {
    export interface Item {
        id: string;
        icon: IRtIcon.Name;
        label: string;
        active: boolean;
    }
}
