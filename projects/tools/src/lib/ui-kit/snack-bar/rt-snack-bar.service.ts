import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';

import { Nullable } from '../../util';
import { RtuiSnackBarComponent } from './snack-bar.compontent';

@Injectable({
    providedIn: 'root',
})
export class RtSnackBarService {
    readonly #snackBar: MatSnackBar = inject(MatSnackBar);
    private readonly defaultConfig: Readonly<MatSnackBarConfig> = {
        duration: 5000000,
    };

    public default(
        message: string,
        action: Nullable<string> = null,
        config: MatSnackBarConfig = this.defaultConfig
    ): MatSnackBarRef<RtuiSnackBarComponent> {
        return this.#snackBar.openFromComponent(RtuiSnackBarComponent, {
            ...config,
            data: { message, action },
        });
    }

    public warning(
        message: string,
        action: Nullable<string> = null,
        config: MatSnackBarConfig = { ...this.defaultConfig, panelClass: 'snack-bar-warning' }
    ): MatSnackBarRef<RtuiSnackBarComponent> {
        config = { ...config, panelClass: 'snack-bar-warning' };
        return this.#snackBar.openFromComponent(RtuiSnackBarComponent, {
            ...config,
            data: { message, action },
        });
    }

    public danger(
        message: string,
        action: Nullable<string> = null,
        config: MatSnackBarConfig = { ...this.defaultConfig, panelClass: 'snack-bar-danger' }
    ): MatSnackBarRef<RtuiSnackBarComponent> {
        config = { ...config, panelClass: 'snack-bar-danger' };
        return this.#snackBar.openFromComponent(RtuiSnackBarComponent, {
            ...config,
            data: { message, action },
        });
    }

    public success(
        message: string,
        action: Nullable<string> = null,
        config: MatSnackBarConfig = { ...this.defaultConfig }
    ): MatSnackBarRef<RtuiSnackBarComponent> {
        config = { ...config, panelClass: 'snack-bar-success' };
        return this.#snackBar.openFromComponent(RtuiSnackBarComponent, {
            ...config,
            data: { message, action },
        });
    }

    public dismiss(): void {
        this.#snackBar.dismiss();
    }
}
