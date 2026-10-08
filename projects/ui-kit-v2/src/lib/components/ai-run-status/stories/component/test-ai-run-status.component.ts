import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtTimeline } from '../../../timeline/rt-timeline.model';

import { RtAiRunStatusComponent } from '../../rt-ai-run-status.component';
import { IRtAiRunStatus } from '../../rt-ai-run-status.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-ai-run-status',
    template: `
        <rt-ai-run-status [state]="state" [label]="label" [meta]="meta" [steps]="withSteps ? steps : []" [(expanded)]="expanded" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAiRunStatusComponent,
    ],
})
export class TestRtAiRunStatusComponent {
    public state: IRtAiRunStatus.State = 'running';
    public label: string = 'Fetching daily performance briefing';
    public meta: string = '14s';
    public withSteps: boolean = true;
    public expanded: boolean = false;

    public readonly steps: readonly IRtTimeline.Step[] = [
        { label: 'Fetching daily performance briefing', meta: '14s', status: 'complete' },
        { label: 'Working out the answer', meta: '5s', status: 'current' },
    ];
}
