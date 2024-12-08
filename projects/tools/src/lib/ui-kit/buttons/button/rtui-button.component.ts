import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    InputSignal,
    InputSignalWithTransform,
    booleanAttribute,
    input,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '../../../bem';
import { Nullable } from '../../../util';
import { IElementColor, IElementSize } from '../../common';
import { RtuiIconComponent } from '../../icon';
import { RtuiSpinnerComponent } from '../../spinner';

export type IButtonType = 'button' | 'submit' | 'reset';
export type IButtonIconPosition = 'right' | 'left';

@Component({
    standalone: true,
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'button[rtuiButton]',
    templateUrl: './rtui-button.component.html',
    styleUrls: ['./rtui-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // bem
        BlockDirective,
        ElemDirective,

        // standalone components
        RtuiIconComponent,
        RtuiSpinnerComponent,
    ],
})
export class RtuiButtonComponent {
    protected readonly bemBlock: string = 'rtui-button';

    public glyph: InputSignal<Nullable<string>> = input<Nullable<string>>();
    public type: InputSignal<Nullable<IButtonType>> = input<Nullable<IButtonType>>('button');
    public size: InputSignal<Nullable<IElementSize>> = input<Nullable<IElementSize>>('md');
    public color: InputSignal<Nullable<IElementColor>> = input<Nullable<IElementColor>>('primary');
    public iconRotate: InputSignal<Nullable<string | number>> = input<Nullable<string | number>>(undefined);
    public iconPosition: InputSignal<Nullable<IButtonIconPosition>> = input<Nullable<IButtonIconPosition>>('left');
    public disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });
    public isLoading: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });
    public fullWidth: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });

    @HostBinding('attr.disabled')
    public get attrDisabled(): Nullable<string> {
        return this.disabled() || this.isLoading() ? '' : null;
    }

    @HostBinding('class')
    public get hostClasses(): Record<string, boolean> {
        return {
            [this.bemBlock]: true,
            [`${this.bemBlock}--size--${this.size()}`]: true,
            [`${this.bemBlock}--full-width`]: this.fullWidth(),
        };
    }
}
