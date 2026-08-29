import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { EListSortOrder, ISortModel } from '@rt-tools/utils';
import { ETableColumnTypes, ITable } from '../../util/table-column.interface';
import { RtTableConfigService } from '../../util/table-config.service';
import { RtuiTableComponent } from './rtui-table.component';

interface IRow extends Record<string, unknown> {
    id: string;
    title: string;
}

describe('RtuiTableComponent', () => {
    function column(propName: keyof IRow): ITable.Column<IRow> {
        return {
            align: 'left',
            propName,
            type: ETableColumnTypes.TEXT,
            header: { label: String(propName) },
        } as ITable.Column<IRow>;
    }

    // Колонки таблица берёт у службы настройки, а та ходит в IndexedDB: двойник отдаёт
    // объявленный набор без хранилища.
    function setup(): { fixture: ComponentFixture<RtuiTableComponent<IRow, 'title', 'id'>>; emitted: Array<ISortModel<'title'>> } {
        TestBed.configureTestingModule({
            imports: [RtuiTableComponent],
            providers: [
                {
                    provide: RtTableConfigService,
                    useValue: {
                        tableConfig: signal({
                            isVerticalScrollbarShown: false,
                            isHorizontalScrollbarShown: false,
                            columns: [column('title')],
                        }),
                    },
                },
            ],
        });

        const fixture: ComponentFixture<RtuiTableComponent<IRow, 'title', 'id'>> = TestBed.createComponent<
            RtuiTableComponent<IRow, 'title', 'id'>
        >(RtuiTableComponent<IRow, 'title', 'id'>);
        const emitted: Array<ISortModel<'title'>> = [];

        fixture.componentRef.setInput('entities', []);
        fixture.componentRef.setInput('currentSortModel', null);
        fixture.componentRef.setInput('appearance', 'outline');
        fixture.componentInstance.sortChange.subscribe((model: ISortModel<'title'>) => emitted.push(model));

        return { fixture, emitted };
    }

    it('SC-UK-13: сортировка по объявленной колонке уходит потребителю', () => {
        const { fixture, emitted } = setup();

        fixture.componentInstance.onSortChange({ propertyName: 'title', sortDirection: EListSortOrder.ASC });

        expect(emitted).toEqual([{ propertyName: 'title', sortDirection: EListSortOrder.ASC }]);
    });

    it('SC-UK-14: сортировка по колонке, которой у таблицы нет, наружу не уходит', () => {
        const { fixture, emitted } = setup();

        fixture.componentInstance.onSortChange({ propertyName: 'unknown', sortDirection: EListSortOrder.DESC });

        expect(emitted).toEqual([]);
    });
});
