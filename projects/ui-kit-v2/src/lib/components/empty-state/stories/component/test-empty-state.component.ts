import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtEmptyStateComponent } from '../../rt-empty-state.component';
import { IRtIcon } from '../../../icon/rt-icon.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-empty-state',
    template: `
        <rt-empty-state [icon]="icon" [title]="title" [description]="description" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtEmptyStateComponent,
    ],
})
export class TestRtEmptyStateComponent {
    public icon: IRtIcon.Name | null = null;
    public title: string = 'Заголовок';
    public description: string | null = 'Пояснение к полю';
}
