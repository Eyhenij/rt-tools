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
        duration: 5000,
    };

    public default(
        message: string,
        action: Nullable<string> = null,
        isDurationShown: boolean = false,
        config: MatSnackBarConfig = this.defaultConfig
    ): MatSnackBarRef<RtuiSnackBarComponent> {
        return this.#snackBar.openFromComponent(RtuiSnackBarComponent, {
            ...config,
            data: { message, action, duration: isDurationShown ? (config?.duration ?? this.defaultConfig.duration) : 0, isDurationShown },
        });
    }

    public warning(
        message: string,
        action: Nullable<string> = null,
        icon: Nullable<string> = null,
        isDurationShown: boolean = false,
        isColoredBackground: boolean = false,
        config: MatSnackBarConfig = { ...this.defaultConfig, panelClass: 'snack-bar-warning' }
    ): MatSnackBarRef<RtuiSnackBarComponent> {
        config = { ...config, panelClass: isColoredBackground ? 'snack-bar-warning-colored' : 'snack-bar-warning' };
        return this.#snackBar.openFromComponent(RtuiSnackBarComponent, {
            ...config,
            data: {
                message,
                action,
                icon,
                duration: isDurationShown ? (config?.duration ?? this.defaultConfig.duration) : 0,
                isDurationShown,
            },
        });
    }

    public danger(
        message: string,
        action: Nullable<string> = null,
        icon: Nullable<string> = null,
        isDurationShown: boolean = false,
        isColoredBackground: boolean = false,
        config: MatSnackBarConfig = { ...this.defaultConfig, panelClass: 'snack-bar-danger' }
    ): MatSnackBarRef<RtuiSnackBarComponent> {
        config = { ...config, panelClass: isColoredBackground ? 'snack-bar-danger-colored' : 'snack-bar-danger' };
        return this.#snackBar.openFromComponent(RtuiSnackBarComponent, {
            ...config,
            data: {
                message,
                action,
                icon,
                duration: isDurationShown ? (config?.duration ?? this.defaultConfig.duration) : 0,
                isDurationShown,
            },
        });
    }

    public success(
        message: string,
        action: Nullable<string> = null,
        icon: Nullable<string> = null,
        isDurationShown: boolean = false,
        isColoredBackground: boolean = false,
        config: MatSnackBarConfig = { ...this.defaultConfig }
    ): MatSnackBarRef<RtuiSnackBarComponent> {
        config = { ...config, panelClass: isColoredBackground ? 'snack-bar-success-colored' : 'snack-bar-success' };
        return this.#snackBar.openFromComponent(RtuiSnackBarComponent, {
            ...config,
            data: {
                message,
                action,
                icon,
                duration: isDurationShown ? (config?.duration ?? this.defaultConfig.duration) : 0,
                isDurationShown,
            },
        });
    }

    public dismiss(): void {
        this.#snackBar.dismiss();
    }
}
