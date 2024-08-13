import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

import { IRtSnackBar } from './snack-bar-config.interface';
import { RtuiSnackBarComponent } from './snack-bar.compontent';

@Injectable({
    providedIn: 'root',
})
export class RtSnackBarService {
    readonly #snackBar: MatSnackBar = inject(MatSnackBar);
    private readonly defaultConfig: Readonly<IRtSnackBar.Config> = {
        duration: 5000,
        isColoredBackground: false,
    };

    public default(message: string, config: IRtSnackBar.Config = {}): MatSnackBarRef<RtuiSnackBarComponent> {
        const fullConfig: IRtSnackBar.Config = { ...this.defaultConfig, ...config };
        return this.#snackBar.openFromComponent(RtuiSnackBarComponent, {
            ...fullConfig,
            data: { message, ...fullConfig },
        });
    }

    public warning(message: string, config: IRtSnackBar.Config = {}): MatSnackBarRef<RtuiSnackBarComponent> {
        const fullConfig: IRtSnackBar.Config = { ...this.defaultConfig, ...config };
        return this.#snackBar.openFromComponent(RtuiSnackBarComponent, {
            ...fullConfig,
            panelClass: config.isColoredBackground ? 'snack-bar-warning-colored' : 'snack-bar-warning',
            data: { message, ...fullConfig, icon: config.icon || 'warning' },
        });
    }

    public danger(message: string, config: IRtSnackBar.Config = {}): MatSnackBarRef<RtuiSnackBarComponent> {
        const fullConfig: IRtSnackBar.Config = { ...this.defaultConfig, ...config };
        return this.#snackBar.openFromComponent(RtuiSnackBarComponent, {
            ...fullConfig,
            panelClass: config.isColoredBackground ? 'snack-bar-danger-colored' : 'snack-bar-danger',
            data: { message, ...fullConfig, icon: config.icon || 'error' },
        });
    }

    public success(message: string, config: IRtSnackBar.Config = {}): MatSnackBarRef<RtuiSnackBarComponent> {
        const fullConfig: IRtSnackBar.Config = { ...this.defaultConfig, ...config };
        return this.#snackBar.openFromComponent(RtuiSnackBarComponent, {
            ...fullConfig,
            panelClass: config.isColoredBackground ? 'snack-bar-success-colored' : 'snack-bar-success',
            data: { message, ...fullConfig, icon: config.icon || 'check' },
        });
    }

    public dismiss(): void {
        this.#snackBar.dismiss();
    }
}
