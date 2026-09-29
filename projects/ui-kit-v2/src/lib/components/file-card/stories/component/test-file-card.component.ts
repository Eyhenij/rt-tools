import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtFileCardComponent } from '../../rt-file-card.component';
import { IRtFileCard } from '../../rt-file-card.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-file-card',
    template: `
        <app-story-presets fill caption="Карточка файла в обоих наборах">
            <ng-template>
                <rt-file-card
                    [name]="name"
                    [sizeBytes]="sizeBytes"
                    [size]="size"
                    [showDownload]="showDownload"
                    [showRemove]="showRemove"
                    [showRename]="showRename"
                    [disabled]="disabled" />
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFileCardComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtFileCardComponent {
    public name: string = 'Название';
    public sizeBytes: number | null = null;
    public size: IRtFileCard.Size = 'md';
    public showDownload: boolean = false;
    public showRemove: boolean = false;
    public showRename: boolean = false;
    public disabled: boolean = false;
}
