import { ChangeDetectionStrategy, Component, InputSignal, Signal, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { CMS_LABELS, TCmsLabelMap } from '@rt-tools/cms-angular';
import {
    RtIconButtonComponent,
    RtInputComponent,
    RtPaginationComponent,
    RtToolbarComponent,
    RtToolbarLeftDirective,
    RtToolbarRightDirective,
} from '@rt-tools/ui-kit-v2';
import { IPageModel } from '@rt-tools/utils';

import { CMS_LIST_PAGE_HOST } from '../list-page.tokens';
import { IListPage, IListQuery } from '../list-query.model';

const BEM_BLOCK: string = 'rt-cms-list-page';

/**
 * The markup of a list screen: the title with a hint, the action bar with the search on the left,
 * the scroll area with the table and the page switch.
 *
 * The screen declares the table itself and puts it inside: columns, cells, the row menu and the
 * narrow-screen cards are all of the section. It must not be wrapped: the table collects its
 * columns by its own content query, and through a go-between they do not reach it.
 *
 * The markup takes no state input — it finds the screen by {@link CMS_LIST_PAGE_HOST} and reads the
 * state from it. Otherwise every list would declare a state input and four handlers for the events
 * of the bar and the page switch.
 */
@Component({
    selector: 'rt-cms-list-page',
    templateUrl: './cms-list-page.component.html',
    styleUrl: './cms-list-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,
        RtIconButtonComponent,
        RtInputComponent,
        RtPaginationComponent,
        RtToolbarComponent,
        RtToolbarLeftDirective,
        RtToolbarRightDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsListPageComponent {
    /** The screen whose list this is: the markup reads its state and gives it the actions. */
    protected readonly host: IListPage.Host = inject(CMS_LIST_PAGE_HOST);

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);

    protected readonly loading: Signal<boolean> = computed((): boolean => this.host.store.loading());

    protected readonly search: Signal<string> = computed((): string => this.host.store.query().search);

    protected readonly pageModel: Signal<IPageModel> = computed((): IPageModel => {
        const query: IListQuery = this.host.store.query();
        const model: IPageModel = { pageNumber: query.pageNumber, pageSize: query.pageSize, totalCount: this.host.store.total() };

        return model;
    });

    public readonly title: InputSignal<string> = input.required<string>();

    /** The line under the title; empty — no line. */
    public readonly hint: InputSignal<string> = input<string>('');

    /** The start of the test anchors: the `qa-dataid` of the title, the search and the page switch are built from it. */
    public readonly qaPrefix: InputSignal<string> = input.required<string>();

    /** The hint in the empty search field: the section names by it the field the server searches by. */
    public readonly searchPlaceholder: InputSignal<string> = input<string>('');
}
