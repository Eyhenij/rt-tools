import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtSkeletonWrapperComponent } from '../../rt-skeleton-wrapper.component';
import { TRtSkeletonShape } from '../../../skeleton/rt-skeleton.component';
import { TRtSkeletonSize } from '../../../skeleton/rt-skeleton.component';
import { TRtSkeletonRadius } from '../../../skeleton/rt-skeleton.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-skeleton-wrapper',
    template: `
        <rt-skeleton-wrapper
            [width]="width"
            [height]="height"
            [shape]="shape"
            [size]="size"
            [borderRadius]="borderRadius"
            [animation]="animation"
            [isLoading]="isLoading" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtSkeletonWrapperComponent,
    ],
})
export class TestRtSkeletonWrapperComponent {
    public width: string = '100%';
    public height: string = '15px';
    public shape: TRtSkeletonShape = 'rectangle';
    public size: TRtSkeletonSize = 'md';
    public borderRadius: TRtSkeletonRadius = 'xl';
    public animation: boolean = true;
    public isLoading: boolean = false;
}
