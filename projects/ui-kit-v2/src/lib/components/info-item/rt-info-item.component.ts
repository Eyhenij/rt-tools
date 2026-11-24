import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignal,
    InputSignalWithTransform,
    ViewEncapsulation,
    contentChildren,
    Signal,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtSkeletonWrapperComponent } from '@rt-tools/ui-kit-v2/skeleton-wrapper';
import { RtSlotOutletDirective } from '@rt-tools/ui-kit-v2/core';
import { RtInfoItemContentDirective } from './rt-info-item-content.directive';

const BEM_BLOCK: string = 'rt-info-item';

@Component({
    selector: 'rt-info-item',
    templateUrl: './rt-info-item.component.html',
    styleUrl: './rt-info-item.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        RtSlotOutletDirective,
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
    /** Шаблоны значения: рисуются, только пока пункт не грузится. */
    protected readonly contents: Signal<readonly RtInfoItemContentDirective[]> = contentChildren(RtInfoItemContentDirective);

    public readonly label: InputSignal<string> = input.required<string>();

    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly grow: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
}
