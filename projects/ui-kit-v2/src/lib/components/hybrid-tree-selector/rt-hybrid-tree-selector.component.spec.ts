import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { IRtHybridTree } from '../hybrid-tree/rt-hybrid-tree.model';
import { RtHybridTreeSelectorComponent } from './rt-hybrid-tree-selector.component';

/**
 * `rt-hybrid-tree-selector` через нарисованную разметку: внутри стоит гибридное дерево, и группа
 * «один лист» проходит через черновик и «Применить». Поиск, кнопки и формы панели проверяет спека
 * `rt-tree-selector`, у которого селектор их берёт.
 */
const NODES: ReadonlyArray<IRtHybridTree.Node<string>> = [
    {
        label: 'This Year',
        value: 'ty',
        single: true,
        children: [
            { label: 'Revenue', value: 'ty-rev' },
            { label: 'Rooms', value: 'ty-rooms' },
        ],
    },
    { label: 'Hotel', value: 'hotel' },
];

type TFixture = ComponentFixture<RtHybridTreeSelectorComponent<string>>;

function setup(inputs: Readonly<Record<string, unknown>> = {}): TFixture {
    return createRtFixture(RtHybridTreeSelectorComponent<string>, { nodes: NODES, ...inputs });
}

function host(fixture: TFixture): HTMLElement {
    return fixture.nativeElement as HTMLElement;
}

function press(fixture: TFixture, qa: string): void {
    (host(fixture).querySelector(`[qa-dataid="${qa}"]`) as HTMLElement).click();
    fixture.detectChanges();
}

function clickRow(fixture: TFixture, value: string): void {
    (host(fixture).querySelector(`[qa-dataid="tree-row"][data-value="${value}"]`) as HTMLElement).click();
    fixture.detectChanges();
}

describe('RtHybridTreeSelectorComponent', (): void => {
    it('draws the hybrid tree inside the panel of the tree selector', (): void => {
        const fixture: TFixture = setup();

        expect(host(fixture).classList).toContain('rt-tree-selector');
        expect(host(fixture).querySelector('rt-hybrid-tree[qa-dataid="tree-selector-tree"]')).not.toBeNull();
        expect(host(fixture).querySelector('rt-tree')).toBeNull();
    });

    it('SC-UKV-698: a single group goes through the draft and Apply', (): void => {
        const fixture: TFixture = setup({ confirm: true, value: ['ty-rev'] });

        clickRow(fixture, 'ty-rooms');
        expect(fixture.componentInstance.value()).toEqual(['ty-rev']);

        press(fixture, 'tree-selector-apply');
        expect(fixture.componentInstance.value()).toEqual(['ty-rooms']);
    });
});
