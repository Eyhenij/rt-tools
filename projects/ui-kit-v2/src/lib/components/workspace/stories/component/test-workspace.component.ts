import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtWorkspaceComponent } from '../../rt-workspace.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-workspace',
    template: `
        <rt-workspace
            [storageKey]="storageKey"
            [hasActive]="hasActive"
            [listMinWidth]="listMinWidth"
            [listMaxWidth]="listMaxWidth"
            [listDefaultWidth]="listDefaultWidth"
            [asideMinWidth]="asideMinWidth"
            [asideMaxWidth]="asideMaxWidth"
            [asideDefaultWidth]="asideDefaultWidth"
            [centerMinWidth]="centerMinWidth" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtWorkspaceComponent,
    ],
})
export class TestRtWorkspaceComponent {
    public storageKey: string | null = null;
    public hasActive: boolean = false;
    public listMinWidth: number = 240;
    public listMaxWidth: number = 480;
    public listDefaultWidth: number = 320;
    public asideMinWidth: number = 280;
    public asideMaxWidth: number = 560;
    public asideDefaultWidth: number = 360;
    public centerMinWidth: number = 360;
}
