import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtIconComponent } from '../../../icon';
import { RtTooltipDirective } from '../../../tooltip';
import { RtExpansionPanelContentDirective } from '../../rt-expansion-panel-content.directive';
import { RtExpansionPanelComponent } from '../../rt-expansion-panel.component';
import { IRtExpansionPanel } from '../../rt-expansion-panel.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда, а не в сам
 * компонент. Три панели подряд — чтобы было видно, что соседние раскрываются независимо. В пакет
 * обёртка не уезжает.
 */
@Component({
    selector: 'app-expansion-panel',
    templateUrl: './test-expansion-panel.component.html',
    styleUrl: './test-expansion-panel-matrix.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // directives
        BlockDirective,
        ElemDirective,
        RtExpansionPanelContentDirective,
        RtTooltipDirective,

        // components
        RtExpansionPanelComponent,
        RtIconComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtExpansionPanelComponent {
    public appearance: IRtExpansionPanel.Appearance = 'card';
    public expanded: boolean = true;
    public disabled: boolean = false;
    public hideToggle: boolean = false;
}
