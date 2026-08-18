import { MatSnackBarConfig } from '@angular/material/snack-bar';

export namespace IRtSnackBar {
    export interface Config extends MatSnackBarConfig {
        icon?: string | null;
        isColoredBackground?: boolean;
        action?: string | null;
        isProgressBarShown?: boolean;
    }

    export interface Data extends Config {
        message: string;
    }
}
