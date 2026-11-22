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

import { ISortModel } from '@rt-tools/utils';

import { createRtFixture, el } from '../../../../testing/rt-kit-testing';
import { IRtTable } from '../rt-table.model';
import { RtTableComponent } from '../rt-table.component';
import { RtTableSortHeaderContentDirective } from './rt-table-sort-header-content.directive';
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
                <th *cdkHeaderCellDef cdk-header-cell rtSortHeader="title"><ng-template rtTableSortHeaderContent>Название</ng-template></th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
            </ng-container>
            <ng-container cdkColumnDef="city">
                <th *cdkHeaderCellDef cdk-header-cell rtSortHeader="city"><ng-template rtTableSortHeaderContent>Город</ng-template></th>
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
        RtTableSortHeaderContentDirective,
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

describe('RtTableSortHeaderContentDirective', (): void => {
    it('SC-UKV-1731: подпись сортируемой колонки стоит один раз, внутри кнопки перед стрелкой', (): void => {
        const fixture: ComponentFixture<SortHeaderHostComponent> = setup();
        const button: HTMLButtonElement | null = sortButton(fixture, 'title');
        const first: ChildNode | undefined = Array.from(button?.childNodes ?? []).find(
            (node: ChildNode): boolean => node.nodeType === Node.ELEMENT_NODE || (node.textContent ?? '').trim() !== ''
        );

        expect([header(fixture, 'title').textContent?.split('Название').length, first?.textContent?.trim()]).toEqual([2, 'Название']);
    });

    it('SC-UKV-1731: несортируемая колонка рисует подпись один раз и без кнопки', (): void => {
        const fixture: ComponentFixture<SortHeaderHostComponent> = setup();

        expect([header(fixture, 'city').textContent?.trim(), sortButton(fixture, 'city')]).toEqual(['Город', null]);
    });
});
