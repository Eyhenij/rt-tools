import { booleanAttribute, ChangeDetectionStrategy, Component, input, InputSignalWithTransform, numberAttribute } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rtui-spinner';

@Component({
    selector: 'rtui-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss'],
    imports: [MatProgressSpinnerModule, BlockDirective, ElemDirective, ModDirective],
    host: { class: BEM_BLOCK },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiSpinnerComponent {
    public diameter: InputSignalWithTransform<number, number> = input<number, number>(32, {
        transform: numberAttribute,
    });
    public showBox: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    public showBackground: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
}
