import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtSkeletonComponent } from '../../rt-skeleton.component';
import { IRtSkeletonShape } from '../../rt-skeleton.component';
import { IRtSkeletonSize } from '../../rt-skeleton.component';
import { IRtSkeletonRadius } from '../../rt-skeleton.component';

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
    public shape: IRtSkeletonShape = 'rectangle';
    public size: IRtSkeletonSize = 'md';
    public width: string = '100%';
    public height: string = '';
    public borderRadius: IRtSkeletonRadius = 'xl';
    public animation: boolean = true;
}
