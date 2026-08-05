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

import { RtSkeletonComponent, IRtSkeletonRadius, IRtSkeletonShape, IRtSkeletonSize } from '../skeleton/rt-skeleton.component';

const BEM_BLOCK: string = 'rt-skeleton-wrapper';

/**
 * Conditional renderer: показывает `<rt-skeleton>` пока `[isLoading]="true"`,
 * иначе проецирует `<ng-content>`. Основной use-case — обёртка вокруг текстовых
 * значений и форм-полей в dialog'ах с async-данными.
 *
 * @example
 * ```html
 * <rt-skeleton-wrapper [isLoading]="!tour()" width="240px" height="16px">
 *     {{ tour()?.title }}
 * </rt-skeleton-wrapper>
 * ```
 */
@Component({
    selector: 'rt-skeleton-wrapper',
    templateUrl: './rt-skeleton-wrapper.component.html',
    styleUrls: ['./rt-skeleton-wrapper.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RtSkeletonComponent],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtSkeletonWrapperComponent {
    public readonly width: InputSignal<string> = input<string>('100%');

    public readonly height: InputSignal<string> = input<string>('15px');

    public readonly shape: InputSignal<IRtSkeletonShape> = input<IRtSkeletonShape>('rectangle');

    public readonly size: InputSignal<IRtSkeletonSize> = input<IRtSkeletonSize>('md');

    public readonly borderRadius: InputSignal<IRtSkeletonRadius> = input<IRtSkeletonRadius>('xl');

    public readonly animation: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    public readonly isLoading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
}
