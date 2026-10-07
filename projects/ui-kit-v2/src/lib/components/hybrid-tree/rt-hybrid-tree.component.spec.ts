import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtHybridTreeComponent } from './rt-hybrid-tree.component';
import { IRtHybridTree } from './rt-hybrid-tree.model';

/**
 * `rt-hybrid-tree` через нарисованную разметку: радио групп «один лист», «выбрать всё» и число
 * выбранного у группы без отметки. Расчёт выбора проверяет спека логики рядом; клавиши, поиск и
 * разметку приложения — спека `rt-tree`, у которого дерево их берёт.
 */
const TREE: ReadonlyArray<IRtHybridTree.Node<string>> = [
    {
        label: 'Grouping',
        value: 'grouping',
        children: [
            { label: 'Hotel', value: 'hotel' },
            { label: 'Segment', value: 'segment' },
        ],
    },
    {
        label: 'This Year',
        value: 'ty',
        single: true,
        children: [
            { label: 'Revenue', value: 'ty-rev' },
            { label: 'Rooms', value: 'ty-rooms' },
        ],
    },
];

type TFixture = ComponentFixture<RtHybridTreeComponent<string>>;

function setup(inputs: Readonly<Record<string, unknown>> = {}): TFixture {
    return createRtFixture(RtHybridTreeComponent<string>, { nodes: TREE, ...inputs });
}

function host(fixture: TFixture): HTMLElement {
    return fixture.nativeElement as HTMLElement;
}

function rowOf(fixture: TFixture, value: string): HTMLElement {
    return host(fixture).querySelector(`[qa-dataid="tree-row"][data-value="${value}"]`) as HTMLElement;
}

function click(fixture: TFixture, value: string): void {
    rowOf(fixture, value).click();
    fixture.detectChanges();
}

function openAll(fixture: TFixture): void {
    fixture.componentInstance.expandAll();
    fixture.detectChanges();
}

describe('RtHybridTreeComponent', (): void => {
    it('SC-UKV-691: a single group draws radios and keeps one leaf, the free group keeps checkboxes', (): void => {
        const fixture: TFixture = setup({ value: ['hotel', 'ty-rev'] });
        openAll(fixture);
        expect(rowOf(fixture, 'ty-rooms').querySelector('[qa-dataid="tree-row-radio"]')).not.toBeNull();
        expect(rowOf(fixture, 'ty').querySelector('[qa-dataid="tree-row-radio"]')).not.toBeNull();
        expect(rowOf(fixture, 'hotel').querySelector('[qa-dataid="tree-row-checkbox"]')).not.toBeNull();

        click(fixture, 'ty-rooms');

        expect([...fixture.componentInstance.value()].sort()).toEqual(['hotel', 'ty-rooms']);
    });

    it('SC-UKV-693: a click on the single group chooses its first leaf and a second one clears it', (): void => {
        const fixture: TFixture = setup();
        openAll(fixture);

        click(fixture, 'ty');
        expect(fixture.componentInstance.value()).toEqual(['ty-rev']);

        click(fixture, 'ty');
        expect(fixture.componentInstance.value()).toEqual([]);
    });

    it('SC-UKV-694: select-all ticks the free leaves and leaves the single group as it was', (): void => {
        const fixture: TFixture = setup({ showSelectAll: true });
        openAll(fixture);
        (host(fixture).querySelector('[qa-dataid="tree-select-all"]') as HTMLElement).click();
        fixture.detectChanges();

        expect([...fixture.componentInstance.value()].sort()).toEqual(['hotel', 'segment']);
    });

    it('SC-UKV-697: a group without a mark ends with the count of its chosen leaves', (): void => {
        const fixture: TFixture = setup({ branchMarks: false, value: ['hotel', 'segment'] });

        expect(rowOf(fixture, 'grouping').querySelector('[qa-dataid="tree-row-count"]')?.textContent?.trim()).toBe('2');
        expect(rowOf(fixture, 'ty')).not.toBeNull();
        expect(rowOf(fixture, 'ty').querySelector('[qa-dataid="tree-row-count"]')).toBeNull();
    });
});
