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

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { INullable } from '@rt-tools/utils';
import { RtIconOutlinedDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rtui-dynamic-selector-list-actions';

@Component({
    selector: 'rtui-dynamic-selector-list-actions',
    host: { class: BEM_BLOCK },
    templateUrl: './rtui-dynamic-selector-list-actions.component.html',
    styleUrls: ['./rtui-dynamic-selector-list-actions.component.scss'],
    imports: [MatIcon, MatButton, RtIconOutlinedDirective, BlockDirective, ElemDirective, ModDirective, MatIconButton, MatTooltip],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiDynamicSelectorListActionsComponent {
    public isMobile: InputSignalWithTransform<INullable<boolean>, INullable<boolean>> = input.required<
        INullable<boolean>,
        INullable<boolean>
    >({
        transform: booleanAttribute,
    });
    public isResetButtonDisabled: InputSignalWithTransform<boolean, boolean> = input.required<boolean, boolean>({
        transform: booleanAttribute,
    });
    public isClearButtonDisabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public disabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });

    public readonly resetAction: OutputEmitterRef<void> = output<void>();
    public readonly clearAction: OutputEmitterRef<void> = output<void>();

    public onReset(): void {
        this.resetAction.emit();
    }

    public onClear(): void {
        this.clearAction.emit();
    }
}
