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
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // Material
        MatIcon,
        MatIconButton,
        MatTooltip,

        // BEM
        BlockDirective,
        ElemDirective,
    ],
})
export class RtuiClearButtonComponent {
    readonly #defaultTooltipPosition: TooltipPosition = 'above';

    public isMobile: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(false, {
        transform: booleanAttribute,
    });
    public isButtonShown: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(true, {
        transform: booleanAttribute,
    });
    public tooltip: InputSignalWithTransform<Nullable<string>, string> = input<Nullable<string>, string>(null, {
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
