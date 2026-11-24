import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChildren,
    input,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { RtSlotOutletDirective, TRtRadius } from '@rt-tools/ui-kit-v2/core';
import { RtSkeletonComponent, TRtSkeletonShape, TRtSkeletonSize } from '@rt-tools/ui-kit-v2/skeleton';
import { RtSkeletonWrapperContentDirective } from './rt-skeleton-wrapper-content.directive';

const BEM_BLOCK: string = 'rt-skeleton-wrapper';

/**
 * Conditional renderer: показывает `<rt-skeleton>` пока `[isLoading]="true"`, иначе рисует шаблон
 * `<ng-template rtSkeletonWrapperContent>`: в загрузке содержимое не строится. Основной use-case —
 * обёртка вокруг текстовых значений в dialog'ах с async-данными.
 *
 * @example
 * ```html
 * <rt-skeleton-wrapper [isLoading]="!tour()" width="240px" height="16px">
 *     <ng-template rtSkeletonWrapperContent>{{ tour()?.title }}</ng-template>
 * </rt-skeleton-wrapper>
 * ```
 */
@Component({
    selector: 'rt-skeleton-wrapper',
    templateUrl: './rt-skeleton-wrapper.component.html',
    styleUrls: ['./rt-skeleton-wrapper.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RtSkeletonComponent, RtSlotOutletDirective],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtSkeletonWrapperComponent {
    /** Шаблоны содержимого: рисуются, только пока обёртка не грузится. */
    protected readonly contents: Signal<readonly RtSkeletonWrapperContentDirective[]> = contentChildren(RtSkeletonWrapperContentDirective);

    public readonly width: InputSignal<string> = input<string>('100%');

    public readonly height: InputSignal<string> = input<string>('15px');

    public readonly shape: InputSignal<TRtSkeletonShape> = input<TRtSkeletonShape>('rectangle');

    public readonly size: InputSignal<TRtSkeletonSize> = input<TRtSkeletonSize>('md');

    /** Шаг скругления заглушки, передаётся в `rt-skeleton`. Пусто — скругление заглушки по умолчанию. */
    public readonly radius: InputSignal<TRtRadius | null> = input<TRtRadius | null>(null);

    public readonly animation: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    public readonly isLoading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
}
