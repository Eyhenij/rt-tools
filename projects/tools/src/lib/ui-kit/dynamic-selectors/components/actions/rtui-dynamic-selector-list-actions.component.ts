import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { Nullable, RtIconOutlinedDirective } from '../../../../util';

@Component({
    selector: 'rtui-dynamic-selector-list-actions',
    templateUrl: './rtui-dynamic-selector-list-actions.component.html',
    styleUrls: ['./rtui-dynamic-selector-list-actions.component.scss'],
    imports: [MatIcon, MatButton, RtIconOutlinedDirective, BlockDirective, ElemDirective, MatIconButton, MatTooltip],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiDynamicSelectorListActionsComponent {
    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input.required<Nullable<boolean>, Nullable<boolean>>({
        transform: booleanAttribute,
    });
    public isResetButtonDisabled: InputSignalWithTransform<boolean, boolean> = input.required<boolean, boolean>({
        transform: booleanAttribute,
    });
    public isClearButtonDisabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    public readonly resetAction: OutputEmitterRef<void> = output<void>();
    public readonly clearAction: OutputEmitterRef<void> = output<void>();

    public onReset(): void {
        this.resetAction.emit();
    }

    public onClear(): void {
        this.clearAction.emit();
    }
}
