import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { RtuiToolbarCenterDirective, RtuiToolbarComponent } from '../../../toolbar';
import { SnackBarService } from '../../snack-bar.service';

@Component({
    standalone: true,
    selector: 'app-snack-bar',
    templateUrl: './test-snack-bar.component.html',
    styleUrls: ['./test-snack-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,

        // material
        MatButton,

        // directives
        BlockDirective,
        ElemDirective,
        RtuiToolbarComponent,
        RtuiToolbarCenterDirective,
    ],
    providers: [],
})
export class TestSnackBarComponent {
    readonly #snackBarService: SnackBarService = inject(SnackBarService);

    public openDefault(): void {
        this.#snackBarService.default('Default Snack Bar opened');
    }

    public openSuccess(): void {
        this.#snackBarService.success('Success Snack Bar opened');
    }

    public openError(): void {
        this.#snackBarService.danger('Error Snack Bar opened');
    }

    public openWarning(): void {
        this.#snackBarService.warning('Warning Snack Bar opened');
    }
}
