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

import { RtSkeletonComponent } from '@rt-tools/ui-kit-v2/skeleton';
import { RtSlotOutletDirective } from '@rt-tools/ui-kit-v2/core';
import { RtMoneyRowContentDirective } from './rt-money-row-content.directive';

const BEM_BLOCK: string = 'rt-money-row';

/**
 * Строка финансового блока: лейбл слева, сумма справа (без переноса). Модификатор
 * `[total]` выделяет итоговую строку верхней границей и полужирным начертанием.
 *
 * Сумма приходит шаблоном `<ng-template rtMoneyRowContent>`. При `[loading]="true"` сумма замещается
 * скелетоном фиксированной ширины — inline-раскладка и прижатие вправо сохраняются.
 */
@Component({
    selector: 'rt-money-row',
    templateUrl: './rt-money-row.component.html',
    styleUrl: './rt-money-row.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        RtSlotOutletDirective,
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
    /** Шаблоны суммы: рисуются, только пока строка не грузится. */
    protected readonly contents: Signal<readonly RtMoneyRowContentDirective[]> = contentChildren(RtMoneyRowContentDirective);

    public readonly label: InputSignal<string> = input<string>('');

    public readonly total: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
}
