import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, ChangeDetectionStrategy, Component, input, InputSignalWithTransform, numberAttribute } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'rtui-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss'],
    imports: [MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiSpinnerComponent {
    public diameter: InputSignalWithTransform<number, number> = input<number, number>(32, {
        transform: numberAttribute,
    });
    public showBox: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, { transform: booleanAttribute });
    public showBackground: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
}
