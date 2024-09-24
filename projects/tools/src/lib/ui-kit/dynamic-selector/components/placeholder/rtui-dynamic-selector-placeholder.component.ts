import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    booleanAttribute,
    input,
    output,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { RtIconOutlinedDirective } from '../../../../util';

@Component({
    standalone: true,
    selector: 'rtui-dynamic-selector-placeholder',
    templateUrl: './rtui-dynamic-selector-placeholder.component.html',
    styleUrls: ['./rtui-dynamic-selector-placeholder.component.scss'],
    imports: [MatIcon, MatButton, CdkOverlayOrigin, RtIconOutlinedDirective, BlockDirective, ElemDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiDynamicSelectorPlaceholderComponent {
    public icon: InputSignal<string> = input('');
    public description: InputSignal<string> = input('');
    public isButtonShow: InputSignal<boolean> = input(true);
    public buttonTitle: InputSignal<string> = input('Add');
    public disabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isIconOutlined: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });

    public readonly submitAction: OutputEmitterRef<CdkOverlayOrigin> = output<CdkOverlayOrigin>();

    public onSubmit(trigger: CdkOverlayOrigin): void {
        this.submitAction.emit(trigger);
    }
}
