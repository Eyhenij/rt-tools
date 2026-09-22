import { ChangeDetectionStrategy, Component, signal, Signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { EFilterOperatorType, IFilterModel, IPageModel } from '@rt-tools/utils';

import { createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtDataTableConfigService } from '../data-table/rt-data-table-config.service';
import { ERtDataTableColumnType, IRtDataTable } from '../data-table/rt-data-table.model';
import { RtDataListComponent } from './rt-data-list.component';

interface IEntity extends Record<string, unknown> {
    id: number;
    title: string;
}

const ROWS: IEntity[] = [{ id: 1, title: 'Анна' }];

const COLUMNS: Array<IRtDataTable.Column<IEntity>> = [
    {
        align: 'left',
        propName: 'title',
        type: ERtDataTableColumnType.TEXT,
        copyable: false,
        filterable: true,
        header: { align: 'left', label: 'Название' },
    },
];

/** Двойник службы настроек: заглушка и вид загрузки от состава колонок не зависят. */
const CONFIG_STUB: { tableConfig: Signal<IRtDataTable.Config.Data<IEntity>>; updateConfig: () => void } = {
    tableConfig: signal({ isVerticalScrollbarShown: false, isHorizontalScrollbarShown: true, columns: COLUMNS }),
    updateConfig: (): void => undefined,
};

const PAGE: IPageModel = { pageNumber: 1, pageSize: 10, totalCount: 0, hasPrev: false, hasNext: false };

@Component({
    selector: 'rt-test-data-list-host',
    template: `
        <rt-data-list
            tableConfigStorageKey="orders"
            isFiltersShown
            [entities]="rows()"
            [pageModel]="page"
            [currentSortModel]="null"
            [filterModel]="filters()"
            [loading]="loading()"
            [fetching]="fetching()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataListComponent],
})
class DataListHostComponent {
    public readonly rows: WritableSignal<IEntity[]> = signal<IEntity[]>([]);
    public readonly filters: WritableSignal<Array<IFilterModel<'title'>>> = signal<Array<IFilterModel<'title'>>>([]);
    public readonly loading: WritableSignal<boolean> = signal(false);
    public readonly fetching: WritableSignal<boolean> = signal(false);
    public readonly page: IPageModel = PAGE;
}

async function setup(
    patch: (host: DataListHostComponent) => void = (): void => undefined
): Promise<ComponentFixture<DataListHostComponent>> {
    const fixture: ComponentFixture<DataListHostComponent> = createRtFixture(
        DataListHostComponent,
        {},
        { providers: [{ provide: RtDataTableConfigService, useValue: CONFIG_STUB }], skipInitialDetect: true }
    );

    patch(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
}

describe('RtDataListComponent', () => {
    it('SC-UKV-309 — заглушка стоит только без строк и без условий отбора', async (): Promise<void> => {
        const fixture: ComponentFixture<DataListHostComponent> = await setup();

        expect(textOf(qa(fixture, 'data-list-placeholder'))).toContain('No Data Found');
        expect(qa(fixture, 'data-table-filter-row')).toBeNull();

        fixture.componentInstance.filters.set([{ propName: 'title', value: 'Анна', operatorType: EFilterOperatorType.CONTAINS }]);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(qa(fixture, 'data-list-placeholder')).toBeNull();
        expect(qa(fixture, 'data-table-filter-row')).not.toBeNull();
    });

    it('SC-UKV-316 — первая загрузка и дозагрузка выглядят по-разному', async (): Promise<void> => {
        const fixture: ComponentFixture<DataListHostComponent> = await setup((host: DataListHostComponent) => host.loading.set(true));

        expect(qa(fixture, 'data-list-loading')).not.toBeNull();
        expect(qa(fixture, 'data-table-row')).toBeNull();

        fixture.componentInstance.loading.set(false);
        fixture.componentInstance.rows.set(ROWS);
        fixture.componentInstance.fetching.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(qa(fixture, 'data-list-loading')).toBeNull();
        expect(qa(fixture, 'data-list-fetching')).not.toBeNull();
        expect(qa(fixture, 'data-table-row')).not.toBeNull();
    });
});
