import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtSkeletonComponent } from '../../rt-skeleton.component';
import { TRtSkeletonShape } from '../../rt-skeleton.component';
import { TRtSkeletonSize } from '../../rt-skeleton.component';
import { TRtRadius } from '../../../radius/rt-radius.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-skeleton',
    template: `
        <rt-skeleton [shape]="shape" [size]="size" [width]="width" [height]="height" [radius]="radius" [animation]="animation" />
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
    public radius: TRtRadius | null = null;
    public animation: boolean = true;
}
