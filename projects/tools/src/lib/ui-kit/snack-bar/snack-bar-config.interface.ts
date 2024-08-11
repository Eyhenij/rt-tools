import { MatSnackBarConfig } from '@angular/material/snack-bar';

export namespace ISnackBar {
    export interface Config extends Data {
        config?: MatSnackBarConfig;
    }

    export interface Data {
        message: string;
        action?: string;
    }
}
