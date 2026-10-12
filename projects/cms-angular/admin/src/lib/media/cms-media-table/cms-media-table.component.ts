import { CdkTableModule } from '@angular/cdk/table';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, Signal, computed, inject, input, output } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { CMS_LABELS, CmsLabelPipe, IMediaFileRow, TCmsLabelMap } from '@rt-tools/cms-angular';
import {
    IRtTable,
    RtButtonDirective,
    RtConfirmDirective,
    RtCopyCellComponent,
    RtEmptyStateComponent,
    RtIconButtonComponent,
    RtTableComponent,
    RtTableRowDirective,
} from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-cms-media-table';

/**
 * The media library files. The table does not know what happens after a delete: it tells the
 * decision, and the screen carries it out. Deleting asks for confirmation in place: the server does
 * not delete a file a page refers to, but a free one goes for good.
 */
@Component({
    selector: 'rt-cms-media-table',
    templateUrl: './cms-media-table.component.html',
    styleUrl: './cms-media-table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        CdkTableModule,
        DatePipe,

        // rt-tools
        BlockDirective,
        CmsLabelPipe,
        ElemDirective,
        RtButtonDirective,
        RtConfirmDirective,
        RtCopyCellComponent,
        RtEmptyStateComponent,
        RtIconButtonComponent,
        RtTableComponent,
        RtTableRowDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsMediaTableComponent {
    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);

    /** The columns are declared to the kit: the narrow-screen card uses their labels. */
    protected readonly columns: Signal<readonly IRtTable.ColumnConfig[]> = computed((): readonly IRtTable.ColumnConfig[] => [
        { key: 'preview', label: this.t().mediaColumnPreview },
        { key: 'name', label: this.t().mediaColumnFile },
        { key: 'dimensions', label: this.t().mediaColumnSize },
        { key: 'createdAt', label: this.t().mediaColumnUploaded },
        { key: 'url', label: this.t().mediaColumnLink },
        { key: 'actions', label: '' },
    ]);

    public readonly files: InputSignal<readonly IMediaFileRow[]> = input.required<readonly IMediaFileRow[]>();
    public readonly loading: InputSignal<boolean> = input<boolean>(false);

    /** A search is on: "no files yet" is false then — the list is empty because none matched. */
    public readonly filtered: InputSignal<boolean> = input<boolean>(false);

    public readonly removeRequested: OutputEmitterRef<IMediaFileRow> = output<IMediaFileRow>();
    public readonly searchReset: OutputEmitterRef<void> = output();
}
