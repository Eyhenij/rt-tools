import { IRtIcon } from '../icon';

export namespace IRtSectionNav {
    export interface Item {
        id: string;
        icon: IRtIcon.Name;
        label: string;
        active: boolean;
    }
}
