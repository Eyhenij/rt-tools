import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtSkeletonComponent } from '../../rt-skeleton.component';
import { TRtSkeletonShape } from '../../rt-skeleton.component';
import { TRtSkeletonSize } from '../../rt-skeleton.component';
import { TRtSkeletonRadius } from '../../rt-skeleton.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-skeleton',
    template: `
        <rt-skeleton
            [shape]="shape"
            [size]="size"
            [width]="width"
            [height]="height"
            [borderRadius]="borderRadius"
            [animation]="animation" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtSkeletonComponent,
    ],
})
export class TestRtSkeletonComponent {
    public shape: TRtSkeletonShape = 'rectangle';
    public size: TRtSkeletonSize = 'md';
    public width: string = '100%';
    public height: string = '';
    public borderRadius: TRtSkeletonRadius = 'xl';
    public animation: boolean = true;
}
