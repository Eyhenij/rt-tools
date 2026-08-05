import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignal,
    InputSignalWithTransform,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtSkeletonWrapperComponent } from '../skeleton-wrapper/rt-skeleton-wrapper.component';

const BEM_BLOCK: string = 'rt-info-item';

@Component({
    selector: 'rt-info-item',
    templateUrl: './rt-info-item.component.html',
    styleUrl: './rt-info-item.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtSkeletonWrapperComponent,
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-info-item--grow]': 'grow()',
    },
})
export class RtInfoItemComponent {
    public readonly label: InputSignal<string> = input.required<string>();

    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly grow: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
}
