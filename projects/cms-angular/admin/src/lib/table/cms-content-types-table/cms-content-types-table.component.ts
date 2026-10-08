import { CdkTableModule } from '@angular/cdk/table';
import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, Signal, computed, inject, input, output } from '@angular/core';

import { BlockDirective } from '@rt-tools/core';
import { CMS_LABELS, IContentTypeRow, TCmsLabelMap } from '@rt-tools/cms-angular';
import {
    IRtTable,
    RtEmptyStateComponent,
    RtMenuItemComponent,
    RtTableComponent,
    RtTableRowActionsDirective,
    RtTableRowDirective,
} from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-cms-content-types-table';

/** The content types. A row opens the pages of the type, the row menu — its settings. */
@Component({
    selector: 'rt-cms-content-types-table',
    templateUrl: './cms-content-types-table.component.html',
    styleUrl: './cms-content-types-table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        CdkTableModule,

        // rt-tools
        BlockDirective,
        RtEmptyStateComponent,
        RtMenuItemComponent,
        RtTableComponent,
        RtTableRowActionsDirective,
        RtTableRowDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsContentTypesTableComponent {
    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);

    protected readonly columns: Signal<readonly IRtTable.ColumnConfig[]> = computed((): readonly IRtTable.ColumnConfig[] => [
        { key: 'name', label: this.t().typesColumnType },
        { key: 'description', label: this.t().typesColumnDescription },
    ]);

    public readonly types: InputSignal<readonly IContentTypeRow[]> = input.required<readonly IContentTypeRow[]>();
    public readonly loading: InputSignal<boolean> = input<boolean>(false);

    public readonly openRequested: OutputEmitterRef<IContentTypeRow> = output<IContentTypeRow>();
    public readonly settingsRequested: OutputEmitterRef<IContentTypeRow> = output<IContentTypeRow>();
}
