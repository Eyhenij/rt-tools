import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtCollapsibleTextComponent } from '../../rt-collapsible-text.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-collapsible-text',
    template: `
        <app-story-presets fill caption="Свёрнутый текст в обоих наборах">
            <ng-template>
                <rt-collapsible-text [paragraphs]="paragraphs" [clampLines]="clampLines" />
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCollapsibleTextComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtCollapsibleTextComponent {
    public paragraphs: readonly string[] = ['Первый абзац.', 'Второй абзац.'];
    public clampLines: number = 6;
}
