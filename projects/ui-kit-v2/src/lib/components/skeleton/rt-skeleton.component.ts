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

import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';

export type TRtSkeletonShape = 'rectangle' | 'circle' | 'square';
export type TRtSkeletonSize = 'sm' | 'md' | 'lg';

const BEM_BLOCK: string = 'rt-skeleton';

/**
 * Visual primitive для loading-state'а: серая полоска с shimmer-анимацией.
 *
 * Не использовать напрямую — оборачивай реальный content в `<rt-skeleton-wrapper>`
 * с input'ом `[isLoading]`. Wrapper решает что показать (skeleton или content),
 * этот компонент только рисует placeholder.
 *
 * Скругление прямоугольника и квадрата — шаг общего входа `radius`; круг остаётся кругом.
 *
 * Shimmer через background-position keyframes; `@media (prefers-reduced-motion)`
 * убирает анимацию для пользователей с reduced-motion preference.
 */
@Component({
    selector: 'rt-skeleton',
    template: '',
    styleUrls: ['./rt-skeleton.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    host: {
        class: BEM_BLOCK,
        '[class.rt-skeleton--rectangle]': 'isRectangle',
        '[class.rt-skeleton--circle]': 'isCircle',
        '[class.rt-skeleton--square]': 'isSquare',
        '[class.rt-skeleton--sm]': 'isSizeSm',
        '[class.rt-skeleton--md]': 'isSizeMd',
        '[class.rt-skeleton--lg]': 'isSizeLg',
        '[class.rt-skeleton--animated]': 'isAnimated',
        '[style.width]': 'hostWidth',
        '[style.height]': 'hostHeight',
    },
})
export class RtSkeletonComponent {
    readonly #sizeMap: Record<TRtSkeletonSize, string> = {
        sm: '10px',
        md: '15px',
        lg: '20px',
    };

    public readonly shape: InputSignal<TRtSkeletonShape> = input<TRtSkeletonShape>('rectangle');

    public readonly size: InputSignal<TRtSkeletonSize> = input<TRtSkeletonSize>('md');

    public readonly width: InputSignal<string> = input<string>('100%');

    public readonly height: InputSignal<string> = input<string>(this.#sizeMap.sm);

    public readonly animation: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    protected get isRectangle(): boolean {
        return this.shape() === 'rectangle';
    }

    protected get isCircle(): boolean {
        return this.shape() === 'circle';
    }

    protected get isSquare(): boolean {
        return this.shape() === 'square';
    }

    protected get isSizeSm(): boolean {
        return this.size() === 'sm';
    }

    protected get isSizeMd(): boolean {
        return this.size() === 'md';
    }

    protected get isSizeLg(): boolean {
        return this.size() === 'lg';
    }

    protected get isAnimated(): boolean {
        return this.animation();
    }

    protected get hostWidth(): string {
        switch (this.shape()) {
            case 'circle':
            case 'square':
                return this.#getSizeValue();

            case 'rectangle':
            default:
                return this.width();
        }
    }

    protected get hostHeight(): string {
        switch (this.shape()) {
            case 'circle':
            case 'square':
                return this.#getSizeValue();

            case 'rectangle':
            default:
                return this.height();
        }
    }

    #getSizeValue(): string {
        return this.#sizeMap[this.size()];
    }
}
