import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    input,
    InputSignal,
    InputSignalWithTransform,
    ViewEncapsulation,
} from '@angular/core';

export type IRtSkeletonShape = 'rectangle' | 'circle' | 'square';
export type IRtSkeletonSize = 'sm' | 'md' | 'lg';
export type IRtSkeletonRadius = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const BEM_BLOCK: string = 'rt-skeleton';

/**
 * Visual primitive для loading-state'а: серая полоска с shimmer-анимацией.
 *
 * Не использовать напрямую — оборачивай реальный content в `<rt-skeleton-wrapper>`
 * с input'ом `[isLoading]`. Wrapper решает что показать (skeleton или content),
 * этот компонент только рисует placeholder.
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
    host: {
        class: BEM_BLOCK,
    },
})
export class RtSkeletonComponent {
    readonly #sizeMap: Record<IRtSkeletonSize, string> = {
        sm: '10px',
        md: '15px',
        lg: '20px',
    };

    readonly #radiusMap: Record<IRtSkeletonRadius, string> = {
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '10px',
        xl: '999px',
    };

    public readonly shape: InputSignal<IRtSkeletonShape> = input<IRtSkeletonShape>('rectangle');

    public readonly size: InputSignal<IRtSkeletonSize> = input<IRtSkeletonSize>('md');

    public readonly width: InputSignal<string> = input<string>('100%');

    public readonly height: InputSignal<string> = input<string>(this.#sizeMap.sm);

    public readonly borderRadius: InputSignal<IRtSkeletonRadius> = input<IRtSkeletonRadius>('xl');

    public readonly animation: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    @HostBinding('class.rt-skeleton--rectangle')
    protected get isRectangle(): boolean {
        return this.shape() === 'rectangle';
    }

    @HostBinding('class.rt-skeleton--circle')
    protected get isCircle(): boolean {
        return this.shape() === 'circle';
    }

    @HostBinding('class.rt-skeleton--square')
    protected get isSquare(): boolean {
        return this.shape() === 'square';
    }

    @HostBinding('class.rt-skeleton--sm')
    protected get isSizeSm(): boolean {
        return this.size() === 'sm';
    }

    @HostBinding('class.rt-skeleton--md')
    protected get isSizeMd(): boolean {
        return this.size() === 'md';
    }

    @HostBinding('class.rt-skeleton--lg')
    protected get isSizeLg(): boolean {
        return this.size() === 'lg';
    }

    @HostBinding('class.rt-skeleton--animated')
    protected get isAnimated(): boolean {
        return this.animation();
    }

    @HostBinding('style.width')
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

    @HostBinding('style.height')
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

    @HostBinding('style.border-radius')
    protected get hostBorderRadius(): string {
        switch (this.shape()) {
            case 'circle':
                return '50%';

            case 'square':
                return this.#radiusMap.sm;

            case 'rectangle':
            default:
                return this.#radiusMap[this.borderRadius()];
        }
    }

    #getSizeValue(): string {
        return this.#sizeMap[this.size()];
    }
}
