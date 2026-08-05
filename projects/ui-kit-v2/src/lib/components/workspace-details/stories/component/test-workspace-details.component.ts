import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtWorkspaceDetailsComponent } from '../../rt-workspace-details.component';
import { IRtWorkspaceDetails } from '../../rt-workspace-details.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-workspace-details',
    template: `
        <rt-workspace-details
            [title]="title"
            [entityId]="entityId"
            [loading]="loading"
            [busy]="busy"
            [rows]="rows"
            [agentEdit]="agentEdit"
            [money]="money"
            [toggles]="toggles"
            [toggleHint]="toggleHint"
            [transition]="transition"
            [audit]="audit"
            [actions]="actions"
            [error]="error" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtWorkspaceDetailsComponent,
    ],
})
export class TestRtWorkspaceDetailsComponent {
    public title: string | null = 'Заголовок';
    public entityId: number | null = null;
    public loading: boolean = false;
    public busy: boolean = false;
    public rows: readonly IRtWorkspaceDetails.Row[] = [];
    public agentEdit: IRtWorkspaceDetails.AgentEdit | null = null;
    public money: readonly IRtWorkspaceDetails.MoneyRow[] = [];
    public toggles: readonly IRtWorkspaceDetails.Toggle[] = [];
    public toggleHint: string | null = null;
    public transition: IRtWorkspaceDetails.Transition | null = null;
    public audit: IRtWorkspaceDetails.Audit | null = null;
    public actions: readonly IRtWorkspaceDetails.Action[] = [];
    public error: string | null = null;
}
