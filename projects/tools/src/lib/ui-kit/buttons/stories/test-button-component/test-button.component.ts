import { ChangeDetectionStrategy, Component, InputSignal, InputSignalWithTransform, booleanAttribute, input } from '@angular/core';

import { Nullable } from '../../../../util';
import { IElementColor, IElementSize } from '../../../common';
import { IButtonIconPosition, IButtonType, RtuiButtonComponent } from '../../button/rtui-button.component';

@Component({
    standalone: true,
    selector: 'rtui-test-button',
    templateUrl: './test-button.component.html',
    styleUrls: ['./test-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtuiButtonComponent],
    providers: [],
})
export class TestButtonComponent {
    public glyph: InputSignal<Nullable<string>> = input<Nullable<string>>();
    public type: InputSignal<Nullable<IButtonType>> = input<Nullable<IButtonType>>('button');
    public size: InputSignal<Nullable<IElementSize>> = input<Nullable<IElementSize>>('md');
    public color: InputSignal<Nullable<IElementColor>> = input<Nullable<IElementColor>>('primary');
    public iconRotate: InputSignal<Nullable<string | number>> = input<Nullable<string | number>>(undefined);
    public iconPosition: InputSignal<Nullable<IButtonIconPosition>> = input<Nullable<IButtonIconPosition>>('left');
    public disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });
    public isLoading: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });
    public fullWidth: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });
}
