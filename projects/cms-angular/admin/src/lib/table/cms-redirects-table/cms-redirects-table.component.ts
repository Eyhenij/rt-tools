import { CdkTableModule } from '@angular/cdk/table';
import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, Signal, computed, inject, input, output } from '@angular/core';

import { BlockDirective } from '@rt-tools/core';
import { CMS_LABELS, IRedirectListRow, REDIRECT_TYPE_TITLES, TCmsLabelMap } from '@rt-tools/cms-angular';
import {
    IRtTable,
    RtButtonDirective,
    RtEmptyStateComponent,
    RtMenuItemComponent,
    RtTableComponent,
    RtTableRowActionsDirective,
    RtTableRowDirective,
    RtTagComponent,
} from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-cms-redirects-table';

/** A row as the table draws it: the redirect kind as its status code. */
interface IRedirectTableRow extends IRedirectListRow {
    readonly typeTitle: string;
}

/** The site redirects. A row opens the edit in the side panel, deleting asks for confirmation. */
@Component({
    selector: 'rt-cms-redirects-table',
    templateUrl: './cms-redirects-table.component.html',
    styleUrl: './cms-redirects-table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        CdkTableModule,

        // rt-tools
        BlockDirective,
        RtButtonDirective,
        RtEmptyStateComponent,
        RtMenuItemComponent,
        RtTableComponent,
        RtTableRowActionsDirective,
        RtTableRowDirective,
        RtTagComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsRedirectsTableComponent {
    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);

    protected readonly rows: Signal<readonly IRedirectTableRow[]> = computed((): readonly IRedirectTableRow[] =>
        this.redirects().map((redirect: IRedirectListRow): IRedirectTableRow => {
            const row: IRedirectTableRow = { ...redirect, typeTitle: REDIRECT_TYPE_TITLES[redirect.type] };

            return row;
        })
    );

    protected readonly columns: Signal<readonly IRtTable.ColumnConfig[]> = computed((): readonly IRtTable.ColumnConfig[] => [
        { key: 'from', label: this.t().redirectsColumnFrom },
        { key: 'to', label: this.t().redirectsColumnTo },
        { key: 'type', label: this.t().redirectsColumnType },
    ]);

    public readonly redirects: InputSignal<readonly IRedirectListRow[]> = input.required<readonly IRedirectListRow[]>();
    public readonly loading: InputSignal<boolean> = input<boolean>(false);
    public readonly filtered: InputSignal<boolean> = input<boolean>(false);

    public readonly openRequested: OutputEmitterRef<IRedirectListRow> = output<IRedirectListRow>();
    public readonly removeRequested: OutputEmitterRef<IRedirectListRow> = output<IRedirectListRow>();
    public readonly searchReset: OutputEmitterRef<void> = output();
}
