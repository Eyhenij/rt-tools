import { MatSnackBarConfig } from '@angular/material/snack-bar';

import { INullable } from '@rt-tools/utils';

export namespace IRtSnackBar {
    export interface Config extends MatSnackBarConfig {
        icon?: INullable<string>;
        isColoredBackground?: boolean;
        action?: INullable<string>;
        isProgressBarShown?: boolean;
    }

    export interface Data extends Config {
        message: string;
    }
}
