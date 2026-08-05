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

import { RtSkeletonComponent } from '../skeleton/rt-skeleton.component';

const BEM_BLOCK: string = 'rt-money-row';

/**
 * Строка финансового блока: лейбл слева, сумма справа (без переноса). Модификатор
 * `[total]` выделяет итоговую строку верхней границей и полужирным начертанием.
 *
 * Сумма проецируется через `<ng-content>`. При `[loading]="true"` сумма замещается
 * скелетоном фиксированной ширины — inline-раскладка и прижатие вправо сохраняются.
 */
@Component({
    selector: 'rt-money-row',
    templateUrl: './rt-money-row.component.html',
    styleUrl: './rt-money-row.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtSkeletonComponent,
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-money-row--total]': 'total()',
    },
})
export class RtMoneyRowComponent {
    public readonly label: InputSignal<string> = input<string>('');

    public readonly total: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
}
