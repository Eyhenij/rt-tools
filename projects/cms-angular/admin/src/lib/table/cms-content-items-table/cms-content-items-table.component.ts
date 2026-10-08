import { CdkTableModule } from '@angular/cdk/table';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, Signal, computed, inject, input, output } from '@angular/core';

import { BlockDirective } from '@rt-tools/core';
import { EContentItemStatus } from '@rt-tools/cms-contract';
import { CMS_LABELS, CONTENT_ITEM_STATUS_LABELS, IContentItemListRow, TCmsLabelMap } from '@rt-tools/cms-angular';
import {
    IRtTable,
    RtButtonDirective,
    RtEmptyStateComponent,
    RtIconButtonComponent,
    RtMenuItemComponent,
    RtTableComponent,
    RtTableRowActionsDirective,
    RtTableRowDirective,
    RtTagComponent,
} from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-cms-content-items-table';

/** A row as the table draws it: the status label is read in the current language. */
interface IContentItemTableRow extends IContentItemListRow {
    readonly statusTitle: string;
}

/**
 * The pages of one content type. The table does not know what to do after a press: it tells the
 * screen. The star toggles featured without opening the page; deleting asks for confirmation.
 */
@Component({
    selector: 'rt-cms-content-items-table',
    templateUrl: './cms-content-items-table.component.html',
    styleUrl: './cms-content-items-table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        CdkTableModule,
        DatePipe,

        // rt-tools
        BlockDirective,
        RtButtonDirective,
        RtEmptyStateComponent,
        RtIconButtonComponent,
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
export class CmsContentItemsTableComponent {
    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);

    protected readonly Status: typeof EContentItemStatus = EContentItemStatus;

    protected readonly rows: Signal<readonly IContentItemTableRow[]> = computed((): readonly IContentItemTableRow[] => {
        const labels: TCmsLabelMap = this.t();

        return this.items().map((item: IContentItemListRow): IContentItemTableRow => {
            const row: IContentItemTableRow = { ...item, statusTitle: labels[CONTENT_ITEM_STATUS_LABELS[item.status]] };

            return row;
        });
    });

    protected readonly columns: Signal<readonly IRtTable.ColumnConfig[]> = computed((): readonly IRtTable.ColumnConfig[] => [
        { key: 'featured', label: this.t().itemsColumnFeatured },
        { key: 'name', label: this.t().itemsColumnName },
        { key: 'slug', label: this.t().itemsColumnSlug },
        { key: 'locale', label: this.t().itemsColumnLocale },
        { key: 'status', label: this.t().itemsColumnStatus },
        { key: 'updatedAt', label: this.t().itemsColumnUpdated },
    ]);

    public readonly items: InputSignal<readonly IContentItemListRow[]> = input.required<readonly IContentItemListRow[]>();
    public readonly loading: InputSignal<boolean> = input<boolean>(false);
    /** A search is on: "no pages yet" is false then — the list is empty because none matched. */
    public readonly filtered: InputSignal<boolean> = input<boolean>(false);

    public readonly openRequested: OutputEmitterRef<IContentItemListRow> = output<IContentItemListRow>();
    public readonly featuredToggled: OutputEmitterRef<IContentItemListRow> = output<IContentItemListRow>();
    public readonly removeRequested: OutputEmitterRef<IContentItemListRow> = output<IContentItemListRow>();
    public readonly searchReset: OutputEmitterRef<void> = output();
}
