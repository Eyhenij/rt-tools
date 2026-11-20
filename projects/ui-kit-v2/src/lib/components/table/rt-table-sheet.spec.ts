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
import { ApplicationRef, ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreakpointsService } from '../../platform';
import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { IRtTable } from './rt-table.model';
import { RtTableComponent } from './rt-table.component';

/** Телефон: узкая ширина и порог до 480 px. */
class PhoneBreakpointsService {
    public readonly narrow: () => boolean = (): boolean => true;
    public readonly viewportNarrow: () => boolean = (): boolean => true;
    public readonly phone: () => boolean = (): boolean => true;
}

/** Таблица со строкой отбора и выключенной шторкой. */
@Component({
    selector: 'rt-table-sheet-host',
    template: `
        <table
            rt-table
            ariaLabel="Туры"
            [dataSource]="rows"
            [columns]="columns"
            [columnsConfig]="config"
            [showFilters]="true"
            [sheet]="false">
            <ng-container cdkColumnDef="title">
                <th *cdkHeaderCellDef cdk-header-cell>Название</th>
                <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
            </ng-container>
            <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
            <tr *cdkRowDef="let row; columns: columns" cdk-row></tr>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtTableComponent,
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
class TableSheetHostComponent {
    public readonly columns: ReadonlyArray<string> = ['title'];
    public readonly config: ReadonlyArray<IRtTable.ColumnConfig> = [{ key: 'title', label: 'Название', filter: { kind: 'text' } }];
    public readonly rows: ReadonlyArray<{ title: string }> = [{ title: 'Тур в Сочи' }];
}

describe('RtTableComponent — нижняя шторка', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1491 — на телефоне с sheet=false панель вида сравнения открывается у кнопки, шторки нет', (): void => {
        const fixture: ComponentFixture<TableSheetHostComponent> = createRtFixture(
            TableSheetHostComponent,
            {},
            { providers: [{ provide: BreakpointsService, useClass: PhoneBreakpointsService }] }
        );
        fixture.detectChanges();

        qa(fixture, 'table-filter-operator')?.nativeElement.click();
        fixture.detectChanges();
        TestBed.inject(ApplicationRef).tick();

        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
        expect(document.querySelector('[qa-dataid="table-filter-operators"]')).not.toBeNull();
    });
});
