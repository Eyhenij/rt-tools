import {
    CdkCell,
    CdkCellDef,
    CdkColumnDef,
    CdkHeaderCell,
    CdkHeaderCellDef,
    CdkHeaderRow,
    CdkHeaderRowDef,
    CdkRow,
    CdkRowDef,
} from '@angular/cdk/table';
import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { ISortModel, EListSortOrder } from '@rt-tools/utils';

import { createRtFixture, el, qa, textOf } from '../../../../testing/rt-kit-testing';
import { IRtTable } from '../rt-table.model';
import { RtTableComponent } from '../rt-table.component';
import { RtTableSortHeaderComponent } from './rt-table-sort-header.component';

interface ITourRow {
    readonly id: number;
    readonly title: string;
    readonly city: string;
}

const ROWS: ReadonlyArray<ITourRow> = [
    { id: 1, title: 'Тур в Сочи', city: 'Сочи' },
    { id: 2, title: 'Тур в Казань', city: 'Казань' },
];

/** Сортируемость колонки объявляется описанием колонок таблицы, а не самим заголовком. */
const COLUMNS_CONFIG: ReadonlyArray<IRtTable.ColumnConfig> = [
    { key: 'title', label: 'Название', sortable: true },
    { key: 'city', label: 'Город' },
];

@Component({
    selector: 'rt-table-sort-header-host',
    template: `
        <table
            rt-table
            #t="rtTable"
            ariaLabel="Туры"
            [dataSource]="rows"
            [columnsConfig]="columnsConfig"
            [sort]="sort()"
            (sortChange)="picked = $event">
            <ng-container cdkColumnDef="title">
                <th *cdkHeaderCellDef cdk-header-cell rtSortHeader="title">Название</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
            </ng-container>
            <ng-container cdkColumnDef="city">
                <th *cdkHeaderCellDef cdk-header-cell rtSortHeader="city">Город</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.city }}</td>
            </ng-container>
            <tr *cdkHeaderRowDef="t.displayedColumns()" cdk-header-row></tr>
            <tr *cdkRowDef="let row; columns: t.displayedColumns()" cdk-row></tr>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtTableComponent,
        RtTableSortHeaderComponent,
        CdkColumnDef,
        CdkHeaderCellDef,
        CdkHeaderCell,
        CdkCellDef,
        CdkCell,
        CdkHeaderRowDef,
        CdkHeaderRow,
        CdkRowDef,
        CdkRow,
    ],
})
class SortHeaderHostComponent {
    public readonly rows: ReadonlyArray<ITourRow> = ROWS;
    public readonly columnsConfig: ReadonlyArray<IRtTable.ColumnConfig> = COLUMNS_CONFIG;
    public readonly sort: WritableSignal<ISortModel<string> | null> = signal<ISortModel<string> | null>(null);
    public picked: ISortModel<string> | null = null;
}

function setup(): ComponentFixture<SortHeaderHostComponent> {
    return createRtFixture(SortHeaderHostComponent);
}

/** Ячейка шапки по ключу колонки: сортируемость видна именно на ней. */
function header(fixture: ComponentFixture<SortHeaderHostComponent>, key: string): HTMLElement {
    return el(fixture, `th[rtSortHeader="${key}"]`)?.nativeElement as HTMLElement;
}

function sortButton(fixture: ComponentFixture<SortHeaderHostComponent>, key: string): HTMLButtonElement | null {
    return header(fixture, key).querySelector('[qa-dataid="table-sort-header"]');
}

describe('RtTableSortHeaderComponent', (): void => {
    it('сортируемая колонка получает кнопку, несортируемая остаётся подписью', (): void => {
        // Пара нужна целиком: кнопка в шапке выглядит исправной и тогда, когда
        // её получают все колонки подряд.
        const fixture: ComponentFixture<SortHeaderHostComponent> = setup();

        expect(sortButton(fixture, 'title')).not.toBeNull();
        expect(sortButton(fixture, 'city')).toBeNull();
        expect(textOf(header(fixture, 'city'))).toBe('Город');
    });

    it('подпись остаётся доступным именем кнопки', (): void => {
        expect((sortButton(setup(), 'title') as HTMLButtonElement).textContent).toContain('Название');
    });

    it('без сортировки колонка объявляет отсутствие порядка', (): void => {
        expect(header(setup(), 'title').getAttribute('aria-sort')).toBe('none');
    });

    it('выбранный порядок виден и скринридеру, и глазом', (): void => {
        const fixture: ComponentFixture<SortHeaderHostComponent> = setup();

        fixture.componentInstance.sort.set({ propertyName: 'title', sortDirection: EListSortOrder.ASC });
        fixture.detectChanges();

        expect(header(fixture, 'title').getAttribute('aria-sort')).toBe('ascending');
        expect(sortButton(fixture, 'title')?.getAttribute('data-direction')).toBe(EListSortOrder.ASC);
    });

    it('сортировка по соседней колонке эту колонку не помечает', (): void => {
        const fixture: ComponentFixture<SortHeaderHostComponent> = setup();

        fixture.componentInstance.sort.set({ propertyName: 'city', sortDirection: EListSortOrder.ASC });
        fixture.detectChanges();

        expect(header(fixture, 'title').getAttribute('aria-sort')).toBe('none');
        expect(sortButton(fixture, 'title')?.getAttribute('data-direction')).toBe(null);
    });

    it('нажатие на заголовок просит таблицу сменить порядок', (): void => {
        const fixture: ComponentFixture<SortHeaderHostComponent> = setup();

        sortButton(fixture, 'title')?.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.picked?.propertyName).toBe('title');
        expect(qa(fixture, 'table-sort-header')).not.toBeNull();
    });
});
