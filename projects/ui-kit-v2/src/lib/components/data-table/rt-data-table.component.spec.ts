import { ChangeDetectionStrategy, Component, signal, Signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EListSortOrder, IFilterModel, ISortModel, TNullable } from '@rt-tools/utils';

import { createRtFixture, el, els, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtIconComponent } from '../icon/rt-icon.component';
import { RtDataTableConfigService } from './rt-data-table-config.service';
import { RtDataTableComponent } from './rt-data-table.component';
import { ERtDataTableColumnType, IRtDataTable } from './rt-data-table.model';
import { RtDataTableCustomCellsDirective, RtDataTableRowActionsDirective } from './rt-data-table-cells.directive';
import { RtDataTableIconDirective } from './rt-data-table-icon.directive';

interface IEntity extends Record<string, unknown> {
    id: number;
    title: string;
    email: string;
}

const ROWS: IEntity[] = [
    { id: 1, title: 'Анна', email: 'a@rt' },
    { id: 2, title: 'Борис', email: 'b@rt' },
];

function columnsOf(): Array<IRtDataTable.Column<IEntity>> {
    return [
        {
            align: 'left',
            propName: 'title',
            type: ERtDataTableColumnType.TEXT,
            copyable: false,
            header: { align: 'left', label: 'Название', icon: { glyph: 'info', placement: 'left' } },
            sorting: { propertyName: 'title', sortDirection: EListSortOrder.ASC },
            filterType: 'text',
        },
        {
            align: 'left',
            propName: 'email',
            type: ERtDataTableColumnType.TEXT,
            copyable: false,
            header: { align: 'left', label: 'Почта' },
        },
    ];
}

/** Двойник службы настроек: состав колонок задаёт сама спека. */
class ConfigStub {
    public readonly config: WritableSignal<IRtDataTable.Config.Data<IEntity>> = signal({
        isVerticalScrollbarShown: false,
        isHorizontalScrollbarShown: true,
        columns: columnsOf(),
    });

    public readonly tableConfig: Signal<IRtDataTable.Config.Data<IEntity>> = this.config.asReadonly();
}

@Component({
    selector: 'rt-test-data-table-host',
    template: `
        <rt-data-table
            [entities]="rows()"
            [currentSortModel]="sort()"
            [filterModel]="filters()"
            [isFiltersShown]="filtersShown()"
            [isTableRowsClickable]="true"
            (sortChange)="asked.push($event)"
            (rowClick)="pressed.push($event.row)">
            @if (withCustomCell()) {
                <ng-container [rtDataTableCustomCells]="{ email: emailTpl }" />
            }

            @if (withActions()) {
                <ng-template rtDataTableRowActions>
                    <b qa-dataid="row-action">Удалить</b>
                </ng-template>
            }

            @if (withIconTemplate()) {
                <ng-template rtDataTableIcon let-name>
                    <b qa-dataid="own-icon">{{ name }}</b>
                </ng-template>
            }
        </rt-data-table>

        <ng-template #emailTpl let-row>
            <i qa-dataid="own-cell">{{ row.email }}</i>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataTableComponent, RtDataTableCustomCellsDirective, RtDataTableIconDirective, RtDataTableRowActionsDirective],
})
class TableHostComponent {
    public readonly rows: WritableSignal<IEntity[]> = signal<IEntity[]>(ROWS);
    public readonly sort: WritableSignal<TNullable<ISortModel<'title'>>> = signal<TNullable<ISortModel<'title'>>>(null);
    public readonly filters: WritableSignal<IFilterModel<'title'>[]> = signal<IFilterModel<'title'>[]>([]);
    public readonly filtersShown: WritableSignal<boolean> = signal(false);
    public readonly withCustomCell: WritableSignal<boolean> = signal(false);
    public readonly withActions: WritableSignal<boolean> = signal(false);
    public readonly withIconTemplate: WritableSignal<boolean> = signal(false);
    public readonly asked: ISortModel<string>[] = [];
    public readonly pressed: IEntity[] = [];
}

let config: ConfigStub;

function setup(inputs: Partial<Record<string, boolean>> = {}): ComponentFixture<TableHostComponent> {
    config = new ConfigStub();

    const fixture: ComponentFixture<TableHostComponent> = createRtFixture(
        TableHostComponent,
        {},
        { providers: [{ provide: RtDataTableConfigService, useValue: config }], skipInitialDetect: true }
    );

    fixture.componentInstance.filtersShown.set(!!inputs['filtersShown']);
    fixture.componentInstance.withCustomCell.set(!!inputs['withCustomCell']);
    fixture.componentInstance.withActions.set(!!inputs['withActions']);
    fixture.componentInstance.withIconTemplate.set(!!inputs['withIconTemplate']);
    fixture.detectChanges();

    return fixture;
}

describe('RtDataTableComponent', () => {
    it('рисует строку на каждую запись и ячейку на каждую видимую колонку', () => {
        const fixture: ComponentFixture<TableHostComponent> = setup();

        expect(qaAll(fixture, 'data-table-row').length).toBe(2);
        expect(qaAll(fixture, 'data-table-cell').map(textOf)).toEqual(['Анна', 'a@rt', 'Борис', 'b@rt']);
    });

    it('SC-UKV-305 — скрытая колонка не рисует ни ячейки, ни ячейки отбора', () => {
        const fixture: ComponentFixture<TableHostComponent> = setup({ filtersShown: true });
        const hidden: Array<IRtDataTable.Column<IEntity>> = columnsOf().map((column: IRtDataTable.Column<IEntity>) =>
            column.propName === 'email' ? { ...column, hidden: true } : column
        );

        config.config.update((value: IRtDataTable.Config.Data<IEntity>) => ({ ...value, columns: hidden }));
        fixture.detectChanges();

        expect(qaAll(fixture, 'data-table-header-cell').length).toBe(1);
        expect(qaAll(fixture, 'data-table-cell').map(textOf)).toEqual(['Анна', 'Борис']);
        expect(els(fixture, 'rt-data-table-filter-cell').length).toBe(1);
    });

    it('колонка типа «custom» рисуется шаблоном приложения, а не готовой ячейкой', () => {
        const fixture: ComponentFixture<TableHostComponent> = setup({ withCustomCell: true });
        const columns: Array<IRtDataTable.Column<IEntity>> = columnsOf().map((column: IRtDataTable.Column<IEntity>) =>
            column.propName === 'email' ? { ...column, type: ERtDataTableColumnType.CUSTOM } : column
        );

        config.config.update((value: IRtDataTable.Config.Data<IEntity>) => ({ ...value, columns }));
        fixture.detectChanges();

        expect(qaAll(fixture, 'own-cell').map(textOf)).toEqual(['a@rt', 'b@rt']);
        expect(els(fixture, 'rt-data-table-cell').length).toBe(2);
    });

    it('строка отбора рисуется по просьбе приложения, и колонка без отбора держит пустую ячейку', () => {
        const fixture: ComponentFixture<TableHostComponent> = setup({ filtersShown: true });

        expect(qa(fixture, 'data-table-filter-row')).not.toBeNull();
        expect(els(fixture, 'rt-data-table-filter-cell').length).toBe(1);
    });

    it('порядок просят только для колонки, которая у таблицы есть', () => {
        const fixture: ComponentFixture<TableHostComponent> = setup();
        const table: RtDataTableComponent<IEntity, 'title', 'title'> = fixture.debugElement.query(
            By.directive(RtDataTableComponent)
        ).componentInstance;

        table.onSortChange({ propertyName: 'title', sortDirection: EListSortOrder.ASC });
        table.onSortChange({ propertyName: 'phone', sortDirection: EListSortOrder.ASC });

        expect(fixture.componentInstance.asked).toEqual([{ propertyName: 'title', sortDirection: 'asc' }]);
    });

    it('SC-UKV-322 — шаблон значка приложения рисует значок шапки вместо набора кита', () => {
        const fixture: ComponentFixture<TableHostComponent> = setup({ withIconTemplate: true });

        expect(qaAll(fixture, 'own-icon').map(textOf)).toEqual(['info']);
        expect(fixture.debugElement.query(By.directive(RtIconComponent))).toBeNull();
    });

    it('SC-UKV-260 — меню строки рисует полосу действий и ячейку «Actions» в шапке', () => {
        const fixture: ComponentFixture<TableHostComponent> = setup({ withActions: true });

        expect(textOf(qa(fixture, 'data-table-actions-header'))).toBe('Actions');
        expect(qaAll(fixture, 'data-table-actions').length).toBe(2);
    });

    it('таблица без действий строки полосы не рисует', () => {
        const fixture: ComponentFixture<TableHostComponent> = setup();

        expect(qa(fixture, 'data-table-actions-header')).toBeNull();
        expect(qaAll(fixture, 'data-table-actions').length).toBe(0);
    });

    it('SC-UKV-261 — нажатие на кнопку меню не доходит до строки, а строку помечает активной', () => {
        const fixture: ComponentFixture<TableHostComponent> = setup({ withActions: true });

        el(fixture, '[qa-dataid="data-table-row-menu"] [qa-dataid="icon-button-control"]')?.nativeElement.dispatchEvent(
            new MouseEvent('mousedown', { bubbles: true })
        );
        el(fixture, '[qa-dataid="data-table-row-menu"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.pressed).toEqual([]);
        expect(qaAll(fixture, 'data-table-row')[0].nativeElement.className).toContain('rt-data-table__row--active');
    });

    it('SC-UKV-259 — пункты меню строки приходят шаблоном приложения', () => {
        const fixture: ComponentFixture<TableHostComponent> = setup({ withActions: true });

        el(fixture, '[qa-dataid="data-table-row-menu"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
        fixture.detectChanges();

        expect(document.querySelector('[qa-dataid="row-action"]')?.textContent).toBe('Удалить');
    });
});
