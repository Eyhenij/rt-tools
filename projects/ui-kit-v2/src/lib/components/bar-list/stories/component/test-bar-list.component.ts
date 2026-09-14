import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtBarListComponent } from '../../rt-bar-list.component';
import { IRtBarList } from '../../rt-bar-list.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-bar-list',
    template: `
        <app-story-presets fill caption="Полосы в обоих наборах">
            <ng-template>
                <rt-bar-list [rows]="rows" [title]="title" [emptyText]="emptyText" />
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtBarListComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtBarListComponent {
    public rows: ReadonlyArray<IRtBarList.Row> = [];
    public title: string = 'Заголовок';
    public emptyText: string = 'Ничего не найдено';
}
