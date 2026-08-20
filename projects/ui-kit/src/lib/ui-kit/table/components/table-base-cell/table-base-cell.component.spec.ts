import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ETableColumnTypes, ITable } from '../../util/table-column.interface';
import { TableBaseCellComponent } from './table-base-cell.component';

interface IRow extends Record<string, unknown> {
    title: unknown;
}

describe('TableBaseCellComponent', () => {
    function column(overrides: Partial<ITable.Column<IRow>> = {}): ITable.Column<IRow> {
        return {
            align: 'left',
            propName: 'title',
            type: ETableColumnTypes.TEXT,
            copyable: true,
            header: { label: 'Title' },
            ...overrides,
        } as ITable.Column<IRow>;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TableBaseCellComponent] });
    });

    function setup(value: unknown, columnOverrides: Partial<ITable.Column<IRow>> = {}): ComponentFixture<TableBaseCellComponent<IRow>> {
        const fixture: ComponentFixture<TableBaseCellComponent<IRow>> = TestBed.createComponent<TableBaseCellComponent<IRow>>(
            TableBaseCellComponent<IRow>
        );

        // Входы реактивные: присваивание полю экземпляра их не меняет.
        fixture.componentRef.setInput('row', { title: value });
        fixture.componentRef.setInput('column', column(columnOverrides));
        fixture.detectChanges();

        return fixture;
    }

    function hasCopyButton(fixture: ComponentFixture<TableBaseCellComponent<IRow>>): boolean {
        return fixture.debugElement.query(By.css('button')) !== null;
    }

    it('SC-UK-01: у пустой ячейки копируемой колонки кнопки копирования нет', () => {
        expect(hasCopyButton(setup(null))).toBe(false);
        expect(hasCopyButton(setup(undefined))).toBe(false);
    });

    it('SC-UK-02: у ячейки со значением кнопка копирования остаётся', () => {
        expect(hasCopyButton(setup('значение'))).toBe(true);
    });

    it('SC-UK-03: пустой считается и пустая строка, и пустой массив, и пустой объект', () => {
        expect(hasCopyButton(setup(''))).toBe(false);
        expect(hasCopyButton(setup([]))).toBe(false);
        expect(hasCopyButton(setup({}))).toBe(false);
    });

    it('SC-UK-04: некопируемая колонка кнопки не получает', () => {
        expect(hasCopyButton(setup('значение', { copyable: false }))).toBe(false);
    });
});
