import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { RtIconOutlinedDirective, transformStringInput } from '../../../../util';

@Component({
    selector: 'rtui-dynamic-selector-placeholder',
    templateUrl: './rtui-dynamic-selector-placeholder.component.html',
    styleUrls: ['./rtui-dynamic-selector-placeholder.component.scss'],
    imports: [MatIcon, MatButton, CdkOverlayOrigin, RtIconOutlinedDirective, BlockDirective, ElemDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiDynamicSelectorPlaceholderComponent {
    public icon: InputSignalWithTransform<string, string> = input<string, string>('', {
        transform: transformStringInput,
    });
    public description: InputSignalWithTransform<string, string> = input<string, string>('', {
        transform: transformStringInput,
    });
    public buttonTitle: InputSignalWithTransform<string, string> = input<string, string>('Add', {
        transform: transformStringInput,
    });
    public isButtonShow: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
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
