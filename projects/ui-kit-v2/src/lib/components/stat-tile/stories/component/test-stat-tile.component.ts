import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtStatTileComponent } from '../../rt-stat-tile.component';
import { IRtStatTile } from '../../rt-stat-tile.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-stat-tile',
    template: `
        <rt-stat-tile
            [label]="label"
            [value]="value"
            [secondary]="secondary"
            [deltaPrimary]="deltaPrimary"
            [deltaSecondary]="deltaSecondary"
            [hint]="hint" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtStatTileComponent,
    ],
})
export class TestRtStatTileComponent {
    public label: string = 'Сохранить';
    public value: string = 'Значение';
    public secondary: string | null = null;
    public deltaPrimary: IRtStatTile.Delta | null = null;
    public deltaSecondary: IRtStatTile.Delta | null = null;
    public hint: string | null = 'Подсказка';
}
