import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RtuiCheckboxComponent } from '../../rtui-checkbox.component';

@Component({
    selector: 'app-checkbox',
    templateUrl: './test-checkbox.component.html',
    styleUrls: ['./test-checkbox.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,

        // components
        RtuiCheckboxComponent,
    ],
})
export class TestCheckboxComponent {
    public value: boolean = true;
    public isIndeterminate: boolean = false;
    public disabled: boolean = false;
    public label: string = 'Label example';
    public description: string = 'Description example';

    public onChange(value: boolean): void {
        // eslint-disable-next-line no-console
        console.log('checkbox action: ', value);

        if (!value && this.isIndeterminate) {
            this.isIndeterminate = false;
        }
    }
}
