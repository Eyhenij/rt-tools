import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { IRtHybridTree } from '../hybrid-tree/rt-hybrid-tree.model';
import { RtTreeNodeEndDirective } from '../tree/rt-tree.directives';
import { RtTreeSelectorUnderSearchDirective } from '../tree-selector/rt-tree-selector.directives';
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

/** Разметка под поиском и шаблон конца строки, отданные гибридному селектору. */
@Component({
    selector: 'rt-hybrid-tree-selector-slots-host',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtHybridTreeSelectorComponent, RtTreeSelectorUnderSearchDirective, RtTreeNodeEndDirective],
    template: `
        <rt-hybrid-tree-selector expandOnStart="all" [nodes]="nodes">
            <ng-template rtTreeSelectorUnderSearch>
                <span qa-dataid="under-search-mark">scope</span>
            </ng-template>
            <ng-template rtTreeNodeEnd let-node>
                <span qa-dataid="end-mark">{{ node.value }}</span>
            </ng-template>
        </rt-hybrid-tree-selector>
    `,
})
class HybridSlotsHostComponent {
    protected readonly nodes: ReadonlyArray<IRtHybridTree.Node<string>> = NODES;
}

describe('RtHybridTreeSelectorComponent', (): void => {
    it('SC-UKV-845: the hybrid selector draws the content under the search and the end template in every row', async (): Promise<void> => {
        const fixture: ComponentFixture<HybridSlotsHostComponent> = TestBed.createComponent(HybridSlotsHostComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        const root: HTMLElement = fixture.nativeElement as HTMLElement;
        const rows: Element[] = Array.from(root.querySelectorAll('rt-hybrid-tree [qa-dataid="tree-row"]'));

        expect(root.querySelector('[qa-dataid="tree-selector-under-search"] [qa-dataid="under-search-mark"]')).not.toBeNull();
        expect(rows.length).toBe(4);
        expect(rows.map((row: Element): string => row.querySelector('[qa-dataid="end-mark"]')?.textContent ?? '')).toEqual(
            rows.map((row: Element): string => row.getAttribute('data-value') ?? '')
        );
    });

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
