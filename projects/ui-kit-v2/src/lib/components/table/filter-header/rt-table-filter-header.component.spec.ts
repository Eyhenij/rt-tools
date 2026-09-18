import { ComponentFixture } from '@angular/core/testing';

import { EFilterOperatorType, IFilterModel } from '@rt-tools/utils';

import { createRtFixture, qa, qaAll, setInputs } from '../../../../testing/rt-kit-testing';
import { IRtTable } from '../rt-table.model';
import { RtTableFilterHeaderComponent } from './rt-table-filter-header.component';

const TEXT_FILTER: IRtTable.ColumnFilter = { kind: 'text' };

/** Набор условий, в котором уже есть чужая колонка: по нему видно, что наружу идёт весь набор. */
const OTHER: IFilterModel<string> = { propertyName: 'city', operatorType: EFilterOperatorType.EQUALS, value: 'Сочи' };

function filterOfTitle(value: string | number | boolean): IFilterModel<string> {
    return { propertyName: 'title', operatorType: EFilterOperatorType.EQUALS, value };
}

describe('RtTableFilterHeaderComponent', (): void => {
    let fixture: ComponentFixture<RtTableFilterHeaderComponent>;
    let reported: Array<readonly IFilterModel<string>[]>;

    function create(inputs: Readonly<Record<string, unknown>> = {}): void {
        fixture = createRtFixture(RtTableFilterHeaderComponent, { propertyName: 'title', filter: TEXT_FILTER, ...inputs });
        reported = [];
        fixture.componentInstance.filtersChange.subscribe((next: readonly IFilterModel<string>[]): void => {
            reported.push(next);
        });
        fixture.detectChanges();
    }

    /** Значение приходит от поля кита, а поле ведёт форма — тест пишет туда же, куда человек. */
    function type(value: string | number | Date | null): void {
        const control: { setValue: (next: unknown) => void } = Reflect.get(fixture.componentInstance, 'control');

        control.setValue(value);
        fixture.detectChanges();
    }

    /** Уход из поля: набранное уходит наружу здесь, а не по каждому знаку. */
    function commit(): void {
        const onCommit: () => void = Reflect.get(fixture.componentInstance, 'onCommit');

        onCommit.call(fixture.componentInstance);
        fixture.detectChanges();
    }

    /** Вид сравнения меняет пункт списка; в тесте он зовётся напрямую — список живёт в слое. */
    function chooseOperator(operatorType: EFilterOperatorType): void {
        const onOperator: (next: EFilterOperatorType) => void = Reflect.get(fixture.componentInstance, 'onOperator');

        onOperator.call(fixture.componentInstance, operatorType);
        fixture.detectChanges();
    }

    it('SC-UKV-214: отбор стоит в шапке колонки', (): void => {
        create();

        expect(qa(fixture, 'table-filter-operator')).not.toBeNull();
        expect(qa(fixture, 'table-filter-value')).not.toBeNull();
    });

    it('SC-UKV-215: колонка без настройки отбора не несёт его вовсе', (): void => {
        create({ filter: null });

        expect(qa(fixture, 'table-filter-operator')).toBeNull();
        expect(qa(fixture, 'table-filter-value')).toBeNull();
    });

    it('SC-UKV-216: вид отбора решает, какую готовую часть кита позвать', (): void => {
        create();
        expect(qa(fixture, 'table-filter-text')).not.toBeNull();

        setInputs(fixture, { filter: { kind: 'number' } });
        fixture.detectChanges();
        expect(qa(fixture, 'table-filter-number')).not.toBeNull();

        setInputs(fixture, { filter: { kind: 'select', options: [{ value: 'a', label: 'А' }] } });
        fixture.detectChanges();
        expect(qa(fixture, 'table-filter-select')).not.toBeNull();

        setInputs(fixture, { filter: { kind: 'date' } });
        fixture.detectChanges();
        expect(qa(fixture, 'table-filter-date')).not.toBeNull();
    });

    it('SC-UKV-217: предлагаются те виды сравнения, которые разрешила колонка', (): void => {
        create({
            filter: { kind: 'text', operators: [EFilterOperatorType.CONTAINS, EFilterOperatorType.EQUALS] },
        });

        qa(fixture, 'table-filter-operator')?.nativeElement.click();
        fixture.detectChanges();

        expect(qaAll(fixture, 'table-filter-operator-item')).toHaveLength(2);
    });

    it('SC-UKV-218: выбранное значение уходит наружу вместе со всем набором условий', (): void => {
        create({ filters: [OTHER] });

        type('Сочи');
        commit();

        expect(reported).toHaveLength(1);
        expect(reported[0]).toHaveLength(2);
        expect(reported[0]).toContain(OTHER);
    });

    it('SC-UKV-219: пустое значение снимает колонку с отбора, а не уходит пустым условием', (): void => {
        create({ filters: [OTHER, filterOfTitle('Сочи')] });

        type('');
        commit();

        expect(reported).toHaveLength(1);
        expect(reported[0]).toEqual([OTHER]);
    });

    it('SC-UKV-220: повтор уже выбранного значения не сообщает ничего', (): void => {
        create({ filters: [filterOfTitle('Сочи')] });

        type('Сочи');
        commit();

        expect(reported).toHaveLength(0);
    });

    it('SC-UKV-221: смена вида сравнения без значения не сообщает ничего', (): void => {
        create();

        chooseOperator(EFilterOperatorType.CONTAINS);

        expect(reported).toHaveLength(0);
    });

    it('SC-UKV-222: смена вида сравнения при заданном значении уходит наружу', (): void => {
        create({ filters: [filterOfTitle('Сочи')] });

        chooseOperator(EFilterOperatorType.CONTAINS);

        expect(reported).toHaveLength(1);
        expect(reported[0][0]).toEqual({ propertyName: 'title', operatorType: EFilterOperatorType.CONTAINS, value: 'Сочи' });
    });

    it('SC-UKV-223: дата сверяется в том виде, в каком хранится', (): void => {
        const day: Date = new Date('2026-09-18T00:00:00.000Z');

        create({ filter: { kind: 'date' }, filters: [filterOfTitle(day.toISOString())] });

        type(day);

        expect(reported).toHaveLength(0);
    });

    it('SC-UKV-224: отбор сам строк не отбирает — наружу уходит только набор условий', (): void => {
        create({ filters: [OTHER] });

        type('Сочи');
        commit();

        expect(reported).toHaveLength(1);
        expect(fixture.componentInstance.filters()).toEqual([OTHER]);
    });

    it('SC-UKV-225: очистка видна только там, где есть что очищать', (): void => {
        create();
        expect(qa(fixture, 'table-filter-clear')).toBeNull();

        setInputs(fixture, { filters: [filterOfTitle('Сочи')] });
        fixture.detectChanges();

        expect(qa(fixture, 'table-filter-clear')).not.toBeNull();
    });
    it('SC-UKV-227: набранное значение уходит наружу по уходу из поля, а не по каждому знаку', (): void => {
        create({ filters: [OTHER] });

        type('С');
        type('Со');
        type('Сочи');

        expect(reported).toHaveLength(0);

        commit();

        expect(reported).toHaveLength(1);
        expect(reported[0]).toHaveLength(2);
    });

    it('SC-UKV-228: выбранное из списка уходит наружу сразу', (): void => {
        create({ filter: { kind: 'select', options: [{ value: 'new', label: 'Новая' }] } });

        type('new');

        expect(reported).toHaveLength(1);
        expect(reported[0][0].value).toBe('new');
    });

    it('SC-UKV-229: пустое поле несёт подсказку из словаря кита', (): void => {
        create();
        expect(qa(fixture, 'table-filter-text')?.componentInstance.placeholder()).not.toBe('');

        setInputs(fixture, { filter: { kind: 'select', options: [{ value: 'a', label: 'А' }] } });
        fixture.detectChanges();

        expect(qa(fixture, 'table-filter-select')?.componentInstance.placeholder()).not.toBe('');
    });
});
