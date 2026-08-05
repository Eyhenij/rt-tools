import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtAsideComponent } from '../../rt-aside.component';
import { IRtAsideSize } from '../../rt-aside.component';
import { IRtAsideContentLayout } from '../../rt-aside.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-aside',
    template: `
        <rt-aside [size]="size" [contentLayout]="contentLayout" [width]="width" [ariaLabel]="ariaLabel" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAsideComponent,
    ],
})
export class TestRtAsideComponent {
    public size: IRtAsideSize = 'md';
    public contentLayout: IRtAsideContentLayout = 'default';
    public width: string | null = null;
    public ariaLabel: string | null = null;
}
