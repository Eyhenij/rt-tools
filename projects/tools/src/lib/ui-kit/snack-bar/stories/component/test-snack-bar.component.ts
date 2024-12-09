import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { RtuiToolbarCenterDirective, RtuiToolbarComponent, RtuiToolbarLeftDirective } from '../../../toolbar';
import { RtSnackBarService } from '../../rt-snack-bar.service';

@Component({
    selector: 'app-test-snack-bar',
    templateUrl: './test-snack-bar.component.html',
    styleUrls: ['./test-snack-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,

        // material
        MatButton,
        MatFormField,
        MatSelect,
        MatOption,
        MatLabel,

        // directives
        BlockDirective,
        ElemDirective,
        RtuiToolbarComponent,
        RtuiToolbarCenterDirective,
        RtuiToolbarLeftDirective,
    ],
})
export class TestSnackBarComponent {
    readonly #snackBarService: RtSnackBarService = inject(RtSnackBarService);

    public isProgressBarShown: boolean = false;
    public isColoredBackground: boolean = false;
    public action: string = 'Test Action';
    public defaultMessage: string = 'Default Snack Bar opened';
    public successMessage: string = 'Success Snack Bar opened';
    public errorMessage: string = 'Error Snack Bar opened';
    public warningMessage: string = 'Warning Snack Bar opened';
    public horizontalPosition: MatSnackBarHorizontalPosition = 'center';
    public verticalPosition: MatSnackBarVerticalPosition = 'bottom';

    public openDefault(): void {
        this.#snackBarService.default(this.defaultMessage, {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            action: this.action,
            isProgressBarShown: this.isProgressBarShown,
            isColoredBackground: this.isColoredBackground,
        });
    }

    public openSuccess(): void {
        this.#snackBarService.success(this.successMessage, {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            action: this.action,
            isProgressBarShown: this.isProgressBarShown,
            isColoredBackground: this.isColoredBackground,
        });
    }

    public openError(): void {
        this.#snackBarService.danger(this.errorMessage, {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            action: this.action,
            isProgressBarShown: this.isProgressBarShown,
            isColoredBackground: this.isColoredBackground,
        });
    }

    public openWarning(): void {
        this.#snackBarService.warning(this.warningMessage, {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            action: this.action,
            isProgressBarShown: this.isProgressBarShown,
            isColoredBackground: this.isColoredBackground,
        });
    }
}
