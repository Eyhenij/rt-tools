import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip, TooltipPosition } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { isString, Nullable } from '../../../../util';

@Component({
    selector: 'rtui-clear-button',
    templateUrl: './rtui-clear-button.component.html',
    styleUrls: ['./rtui-clear-button.component.scss'],
    imports: [
        // Material
        MatIcon,
        MatIconButton,
        MatTooltip,

        // BEM
        BlockDirective,
        ElemDirective,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiClearButtonComponent {
    readonly #defaultTooltipPosition: TooltipPosition = 'above';

    public isMobile: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public isButtonShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    public tooltip: InputSignalWithTransform<string, Nullable<string>> = input<string, Nullable<string>>('', {
        transform: (value: Nullable<string>) => (isString(value) ? value.trim() : ''),
    });
    public tooltipPosition: InputSignal<TooltipPosition> = input(this.#defaultTooltipPosition);

    public readonly keydownAction: OutputEmitterRef<void> = output<void>();
    public readonly clickAction: OutputEmitterRef<void> = output<void>();

    public onKeydown(): void {
        this.keydownAction.emit();
    }

    public onClick(): void {
        this.clickAction.emit();
    }
}
