import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtMoneyRowComponent } from '../../rt-money-row.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-money-row',
    template: `
        <app-story-presets fill caption="Строка суммы в обоих наборах">
            <ng-template>
                <rt-money-row [label]="label" [total]="total" [loading]="loading" />
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMoneyRowComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtMoneyRowComponent {
    public label: string = 'Сохранить';
    public total: boolean = false;
    public loading: boolean = false;
}
