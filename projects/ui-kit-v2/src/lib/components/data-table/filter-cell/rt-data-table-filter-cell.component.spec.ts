import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { EFilterOperatorType, IFilterModel, TFilterOperatorType } from '@rt-tools/utils';

import { createRtFixture, el, qa } from '../../../../testing/rt-kit-testing';
import { IRtDataTable } from '../rt-data-table.model';
import { RtDataTableFilterCellComponent } from './rt-data-table-filter-cell.component';

@Component({
    selector: 'rt-test-filter-cell-host',
    template: `
        <rt-data-table-filter-cell
            filterProperty="name"
            [filterType]="type()"
            [filterModel]="filters()"
            [filterOperators]="operators()"
            [filterSelectOptions]="['open', 'closed']"
            (filterChange)="onChange($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataTableFilterCellComponent],
})
class FilterHostComponent {
    public readonly type: WritableSignal<IRtDataTable.FilterType> = signal<IRtDataTable.FilterType>('text');
    public readonly filters: WritableSignal<IFilterModel<string>[]> = signal<IFilterModel<string>[]>([]);
    public readonly operators: WritableSignal<TFilterOperatorType[]> = signal<TFilterOperatorType[]>([]);
    public readonly sent: IFilterModel<string>[][] = [];

    /** Приложение отвечает на новый набор тем, что ставит его ячейке. */
    public onChange(filters: IFilterModel<string>[]): void {
        this.sent.push(filters);
        this.filters.set(filters);
    }
}

function setup(
    type: IRtDataTable.FilterType,
    operators: TFilterOperatorType[] = [],
    filters: IFilterModel<string>[] = []
): ComponentFixture<FilterHostComponent> {
    const fixture: ComponentFixture<FilterHostComponent> = createRtFixture(FilterHostComponent, {}, { skipInitialDetect: true });

    fixture.componentInstance.type.set(type);
    fixture.componentInstance.operators.set(operators);
    fixture.componentInstance.filters.set(filters);
    fixture.detectChanges();

    return fixture;
}

function typeInto(fixture: ComponentFixture<FilterHostComponent>, anchor: string, text: string): HTMLInputElement {
    const field: HTMLInputElement = el(fixture, `[qa-dataid="${anchor}"]`)?.nativeElement;

    field.value = text;
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    return field;
}

function pressEnter(fixture: ComponentFixture<FilterHostComponent>, field: HTMLElement): void {
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
}

function openOperators(fixture: ComponentFixture<FilterHostComponent>): HTMLElement[] {
    el(fixture, '[qa-dataid="data-table-filter-operator"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
    fixture.detectChanges();

    return Array.from(document.querySelectorAll<HTMLElement>('rt-menu-item'));
}

function operatorHint(fixture: ComponentFixture<FilterHostComponent>): string {
    return el(fixture, '[qa-dataid="data-table-filter-operator"] [qa-dataid="icon-button-control"]')?.attributes['aria-label'] ?? '';
}

describe('RtDataTableFilterCellComponent', () => {
    it('SC-UKV-303 — текст уходит по Enter, а очищенное поле снимает условие', () => {
        const fixture: ComponentFixture<FilterHostComponent> = setup('text');
        const field: HTMLInputElement = typeInto(fixture, 'input-control', 'ann');

        expect(fixture.componentInstance.sent).toEqual([]);

        pressEnter(fixture, field);
        typeInto(fixture, 'input-control', '');

        expect(fixture.componentInstance.sent).toEqual([[{ propertyName: 'name', operatorType: 'equals', value: 'ann' }], []]);
    });

    it('текст уходит и при уходе с поля, а повтор того же значения не спрашивает ничего', () => {
        const fixture: ComponentFixture<FilterHostComponent> = setup('text');
        const field: HTMLInputElement = typeInto(fixture, 'input-control', 'ann');

        field.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        pressEnter(fixture, field);

        expect(fixture.componentInstance.sent).toEqual([[{ propertyName: 'name', operatorType: 'equals', value: 'ann' }]]);
    });

    it('SC-UKV-304 — смена вида без значения не спрашивает ничего, а кнопка показывает новый вид', () => {
        const fixture: ComponentFixture<FilterHostComponent> = setup('text', [EFilterOperatorType.EQUALS, EFilterOperatorType.CONTAINS]);

        expect(operatorHint(fixture)).toBe('Equal');

        const items: HTMLElement[] = openOperators(fixture);

        expect(items.map((item: HTMLElement) => item.textContent?.trim())).toEqual(['Contains']);

        items[0].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.sent).toEqual([]);
        expect(operatorHint(fixture)).toBe('Contains');
    });

    it('смена вида у колонки с условием отдаёт набор с новым видом', () => {
        const fixture: ComponentFixture<FilterHostComponent> = setup(
            'text',
            [EFilterOperatorType.EQUALS, EFilterOperatorType.NOT_EQUALS, EFilterOperatorType.LESS_THAN],
            [{ propertyName: 'name', operatorType: EFilterOperatorType.EQUALS, value: 'ann' }]
        );
        const items: HTMLElement[] = openOperators(fixture);

        expect(items.map((item: HTMLElement) => item.textContent?.trim())).toEqual(['Not equal', 'Less than']);

        items[1].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.sent).toEqual([[{ propertyName: 'name', operatorType: 'lessThan', value: 'ann' }]]);
    });

    it('колонка без видов сравнения кнопки вида не рисует', () => {
        const fixture: ComponentFixture<FilterHostComponent> = setup('text');

        expect(qa(fixture, 'data-table-filter-input')).not.toBeNull();
        expect(qa(fixture, 'data-table-filter-operator')).toBeNull();
    });

    it('число уходит по Enter строкой, как у первого кита', () => {
        const fixture: ComponentFixture<FilterHostComponent> = setup('number');
        const field: HTMLInputElement = typeInto(fixture, 'input-number-control', '12');

        pressEnter(fixture, field);

        expect(fixture.componentInstance.sent).toEqual([[{ propertyName: 'name', operatorType: 'equals', value: '12' }]]);
    });

    it('дата уходит выбором дня моментом ISO, а кнопка очистки снимает условие', () => {
        const fixture: ComponentFixture<FilterHostComponent> = setup('date');

        expect(el(fixture, '[qa-dataid="data-table-filter-clear"] [qa-dataid="icon-button-control"]')?.nativeElement.disabled).toBe(true);

        typeInto(fixture, 'date-picker-control', '2025-01-01');
        el(fixture, '[qa-dataid="data-table-filter-clear"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.sent).toEqual([
            [{ propertyName: 'name', operatorType: 'equals', value: new Date(2025, 0, 1).toISOString() }],
            [],
        ]);
    });

    it('список уходит выбором пункта, подписи пунктов — с большой буквы', () => {
        const fixture: ComponentFixture<FilterHostComponent> = setup('select');

        el(fixture, '[qa-dataid="select-trigger"]')?.nativeElement.click();
        fixture.detectChanges();

        const options: HTMLElement[] = Array.from(document.querySelectorAll<HTMLElement>('[qa-dataid="select-option"]'));

        expect(options.map((option: HTMLElement) => option.textContent?.trim())).toEqual(['Open', 'Closed']);

        options[1].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.sent).toEqual([[{ propertyName: 'name', operatorType: 'equals', value: 'closed' }]]);
    });
});
