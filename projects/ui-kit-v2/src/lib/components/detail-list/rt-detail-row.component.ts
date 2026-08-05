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

import { RtSkeletonWrapperComponent } from '../skeleton-wrapper';

const BEM_BLOCK: string = 'rt-detail-row';

/**
 * Одна read-only строка «лейбл + значение» в stacked-раскладке: приглушённый
 * лейбл сверху, значение снизу. Единый паттерн info-строки для всех асайдов
 * (раньше — пять разных реализаций).
 *
 * Значение проецируется через `<ng-content>` — допустим текст, дата через pipe
 * или `rt-tag`. При `[loading]="true"` значение замещается скелетоном (потребитель
 * не оборачивает `rt-skeleton-wrapper` вручную).
 */
@Component({
    selector: 'rt-detail-row',
    templateUrl: './rt-detail-row.component.html',
    styleUrl: './rt-detail-row.component.scss',
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
    },
})
export class RtDetailRowComponent {
    public readonly label: InputSignal<string> = input<string>('');

    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
}
