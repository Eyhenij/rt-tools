import { MatSnackBarConfig } from '@angular/material/snack-bar';

import { Nullable } from '../../util';

export namespace IRtSnackBar {
    export interface Config extends MatSnackBarConfig {
        icon?: Nullable<string>;
        isColoredBackground?: boolean;
        action?: Nullable<string>;
        isProgressBarShown?: boolean;
    }

    export interface Data extends Config {
        message: string;
    }
}
