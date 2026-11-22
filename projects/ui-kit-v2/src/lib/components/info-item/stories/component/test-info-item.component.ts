import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtInfoItemContentDirective } from '../../rt-info-item-content.directive';
import { RtInfoItemComponent } from '../../rt-info-item.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-info-item',
    template: `
        <rt-info-item [label]="label" [loading]="loading" [grow]="grow">
            <ng-template rtInfoItemContent>{{ value }}</ng-template>
        </rt-info-item>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtInfoItemComponent,
        RtInfoItemContentDirective,
    ],
})
export class TestRtInfoItemComponent {
    public label: string = 'Тариф';

    /** Значение у компонента приходит проекцией — контрол вешается сюда, а не на вход. */
    public value: string = 'Годовой';
    public loading: boolean = false;
    public grow: boolean = false;
}
