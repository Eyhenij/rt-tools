import { ChangeDetectionStrategy, Component, Signal, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { Observable, map, skip } from 'rxjs';

import { EContentItemStatus } from '@rt-tools/cms-contract';
import {
    CMS_LABELS,
    CMS_LOCALES,
    CONTENT_ITEM_STATUS_LABELS,
    IContentItemListRow,
    IContentTypeRow,
    TCmsLabelMap,
} from '@rt-tools/cms-angular';
import { IRtSelect, RtIconButtonComponent, RtSelectComponent } from '@rt-tools/ui-kit-v2';

import { IContentItemsFilter } from '../../api/content-items-api.service';
import { BaseListPageDirective } from '../../list/base-list-page.directive';
import { CmsListPageComponent } from '../../list/cms-list-page/cms-list-page.component';
import { provideCmsListPage } from '../../list/list-page.tokens';
import { ContentItemsStore } from '../../store/content-items.store';
import { ContentTypesStore } from '../../store/content-types.store';
import { NEW_ITEM_ID } from '../new-item-id.const';
import { CmsContentItemsTableComponent } from '../../table/cms-content-items-table/cms-content-items-table.component';

const BEM_BLOCK: string = 'rt-cms-content-items-page';

/**
 * The pages of one type: the search by name, the filter by status and language, fresh edits on top.
 * The page, the search and their place in the address live in the list base; the type comes from
 * the screen address.
 */
@Component({
    selector: 'rt-cms-content-items-page',
    templateUrl: './cms-content-items-page.component.html',
    styleUrl: './cms-content-items-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        RtIconButtonComponent,
        RtSelectComponent,

        // components
        CmsContentItemsTableComponent,
        CmsListPageComponent,
    ],
    providers: [ContentItemsStore, provideCmsListPage(() => CmsContentItemsPageComponent)],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsContentItemsPageComponent extends BaseListPageDirective<IContentItemListRow> {
    readonly #router: Router = inject(Router);
    readonly #route: ActivatedRoute = inject(ActivatedRoute);
    readonly #types: ContentTypesStore = inject(ContentTypesStore);
    readonly #locales: readonly string[] = inject(CMS_LOCALES);

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);

    protected readonly statusOptions: Signal<readonly IRtSelect.Option<EContentItemStatus | null>[]> = computed(
        (): readonly IRtSelect.Option<EContentItemStatus | null>[] => {
            const labels: TCmsLabelMap = this.t();

            return [
                { label: labels.itemsAnyStatus, value: null },
                ...Object.values(EContentItemStatus).map((status: EContentItemStatus): IRtSelect.Option<EContentItemStatus | null> => ({
                    label: labels[CONTENT_ITEM_STATUS_LABELS[status]],
                    value: status,
                })),
            ];
        }
    );

    /** A language is named by its code: the codes are the application's, and so are their names. */
    protected readonly localeOptions: Signal<readonly IRtSelect.Option<string>[]> = computed((): readonly IRtSelect.Option<string>[] => [
        { label: this.t().itemsAnyLocale, value: '' },
        ...this.#locales.map((locale: string): IRtSelect.Option<string> => ({ label: locale, value: locale })),
    ]);

    protected readonly title: Signal<string> = computed((): string => {
        const typeId: string = this.store.filter().contentTypeId;

        return this.#types.types().find((type: IContentTypeRow): boolean => type.id === typeId)?.name ?? this.t().itemsPages;
    });

    /** A filter by status or language also makes an empty table mean "nothing found". */
    protected readonly narrowed: Signal<boolean> = computed(
        (): boolean => this.filtered() || this.store.filter().status !== null || this.store.filter().locale !== ''
    );

    public override readonly store: ContentItemsStore = inject(ContentItemsStore);

    constructor() {
        super();
        const typeId$: Observable<string> = this.#route.paramMap.pipe(map((params: ParamMap): string => params.get('typeId') ?? ''));
        // The first type is set before the first load of the list base, the next ones reload the list themselves
        typeId$.pipe(takeUntilDestroyed()).subscribe((contentTypeId: string): void => {
            this.store.setFilter({ ...this.store.filter(), contentTypeId });
        });
        typeId$.pipe(skip(1), takeUntilDestroyed()).subscribe((): void => {
            this.store.load();
        });
        this.#types.load();
    }

    protected filterStatus(status: EContentItemStatus | null): void {
        this.#refilter({ ...this.store.filter(), status });
    }

    protected filterLocale(locale: string | null): void {
        this.#refilter({ ...this.store.filter(), locale: locale ?? '' });
    }

    protected resetFilter(): void {
        this.store.setFilter({ ...this.store.filter(), status: null, locale: '' });
        this.resetSearch();
    }

    protected async openCreate(): Promise<void> {
        await this.#openInSection(['items', NEW_ITEM_ID]);
    }

    protected async openSettings(): Promise<void> {
        await this.#openInSection(['settings']);
    }

    protected async open(row: IContentItemListRow): Promise<void> {
        await this.#openInSection(['items', row.id]);
    }

    protected toggleFeatured(row: IContentItemListRow): void {
        this.store.toggleFeatured(row);
    }

    protected remove(row: IContentItemListRow): void {
        this.store.remove(row);
    }

    /** The section routes are flat, so a path goes from the section root: the type id, then the rest. */
    async #openInSection(path: readonly string[]): Promise<void> {
        await this.#router.navigate([this.store.filter().contentTypeId, ...path], { relativeTo: this.#route.parent });
    }

    #refilter(filter: IContentItemsFilter): void {
        this.store.setFilter(filter);
        this.store.load();
    }
}
