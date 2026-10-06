import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { IRtTree } from '../tree/rt-tree.model';
import { RtDraggableTreeComponent } from './rt-draggable-tree.component';
import { RtDraggableTreeNodeDirective } from './rt-draggable-tree.directives';
import { IRtDraggableTree } from './rt-draggable-tree.model';

/**
 * `rt-draggable-tree` через нарисованную разметку: клавиши с Alt, выключенный узел, разметка
 * приложения и пустое дерево. Места сброса и перенос проверяет спека логики рядом.
 */
const TREE: ReadonlyArray<IRtTree.Node<string>> = [
    { label: 'Первый', value: 'one' },
    { label: 'Папка', value: 'folder', children: [{ label: 'Вложенный', value: 'inner' }] },
    { label: 'Третий', value: 'three' },
];

type TFixture = ComponentFixture<RtDraggableTreeComponent<string>>;

function setup(nodes: ReadonlyArray<IRtTree.Node<string>> = TREE): TFixture {
    return createRtFixture(RtDraggableTreeComponent<string>, { nodes });
}

function rows(fixture: ComponentFixture<unknown>): HTMLElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[qa-dataid="draggable-tree-row"]'));
}

function rowOf(fixture: ComponentFixture<unknown>, value: string): HTMLElement {
    return rows(fixture).find((row: HTMLElement): boolean => row.getAttribute('data-value') === value) as HTMLElement;
}

function topValues(fixture: TFixture): string[] {
    return fixture.componentInstance.nodes().map((node: IRtTree.Node<string>): string => node.value);
}

function highlight(fixture: TFixture, value: string): void {
    rowOf(fixture, value).click();
    fixture.detectChanges();
}

function key(fixture: TFixture, name: string, altKey: boolean = true): boolean {
    const taken: boolean = fixture.componentInstance.handleKeydown(new KeyboardEvent('keydown', { key: name, altKey, cancelable: true }));
    fixture.detectChanges();
    return taken;
}

@Component({
    selector: 'rt-draggable-tree-node-host',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDraggableTreeComponent, RtDraggableTreeNodeDirective],
    template: `
        <rt-draggable-tree [nodes]="nodes">
            <ng-template rtDraggableTreeNode let-node>
                <span qa-dataid="node-mark">{{ node.value }}</span>
            </ng-template>
        </rt-draggable-tree>
    `,
})
class NodeTemplateHostComponent {
    protected readonly nodes: ReadonlyArray<IRtTree.Node<string>> = TREE;
}

describe('RtDraggableTreeComponent', (): void => {
    it('SC-UKV-659 — Alt со стрелкой вверх двигает узел среди соседей и стоит у края', (): void => {
        const fixture: TFixture = setup([TREE[0], TREE[2], { label: 'Четвёртый', value: 'four' }]);
        const moved: IRtDraggableTree.Moved<string>[] = [];
        fixture.componentInstance.moved.subscribe((event: IRtDraggableTree.Moved<string>): number => moved.push(event));
        highlight(fixture, 'three');

        expect(key(fixture, 'ArrowUp')).toBe(true);
        expect(topValues(fixture)).toEqual(['three', 'one', 'four']);

        expect(key(fixture, 'ArrowUp')).toBe(true);
        expect(topValues(fixture)).toEqual(['three', 'one', 'four']);
        expect(moved.length).toBe(1);
        expect(moved[0].index).toBe(0);
    });

    it('SC-UKV-660 — Alt со стрелками влево и вправо выносит узел из ветки и возвращает', (): void => {
        const fixture: TFixture = setup();
        highlight(fixture, 'inner');

        key(fixture, 'ArrowLeft');
        expect(topValues(fixture)).toEqual(['one', 'folder', 'inner', 'three']);
        expect(fixture.componentInstance.nodes()[1].children).toEqual([]);

        key(fixture, 'ArrowRight');
        expect(topValues(fixture)).toEqual(['one', 'folder', 'three']);
        expect(fixture.componentInstance.nodes()[1].children?.map((node: IRtTree.Node<string>): string => node.value)).toEqual(['inner']);
        expect(rowOf(fixture, 'inner')).toBeDefined();
    });

    it('SC-UKV-661 — выключенный узел не двигается и не имеет ручки', (): void => {
        const fixture: TFixture = setup([{ label: 'Закреплён', value: 'pin', disabled: true }, ...TREE]);
        const moved: IRtDraggableTree.Moved<string>[] = [];
        fixture.componentInstance.moved.subscribe((event: IRtDraggableTree.Moved<string>): number => moved.push(event));
        highlight(fixture, 'pin');

        key(fixture, 'ArrowDown');

        expect(topValues(fixture)).toEqual(['pin', 'one', 'folder', 'three']);
        expect(moved).toEqual([]);
        expect(rowOf(fixture, 'pin').querySelector('[qa-dataid="draggable-tree-handle"]')).toBeNull();
        expect(rowOf(fixture, 'one').querySelector('[qa-dataid="draggable-tree-handle"]')).not.toBeNull();
    });

    it('SC-UKV-662 — строка берёт разметку приложения вместо подписи', (): void => {
        TestBed.configureTestingModule({ imports: [NodeTemplateHostComponent] });
        const fixture: ComponentFixture<NodeTemplateHostComponent> = TestBed.createComponent(NodeTemplateHostComponent);
        fixture.detectChanges();

        const marks: string[] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[qa-dataid="node-mark"]')).map(
            (node: Element): string => node.textContent ?? ''
        );

        expect(marks).toEqual(['one', 'folder', 'inner', 'three']);
        expect((fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="draggable-tree-label"]')).toBeNull();
    });

    it('SC-UKV-663 — пустое дерево пишет, что вариантов нет', (): void => {
        const fixture: TFixture = setup([]);
        const empty: string = (
            (fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="draggable-tree-empty"]')?.textContent ?? ''
        ).trim();

        expect(empty.length).toBeGreaterThan(0);
        expect(rows(fixture)).toEqual([]);
    });

    it('стрелки без Alt ходят по строкам и не двигают узлы', (): void => {
        const fixture: TFixture = setup();

        expect(key(fixture, 'ArrowDown', false)).toBe(true);
        expect(key(fixture, 'ArrowDown', false)).toBe(true);

        expect(rowOf(fixture, 'folder').getAttribute('aria-selected')).toBe('true');
        expect(topValues(fixture)).toEqual(['one', 'folder', 'three']);
        expect(key(fixture, 'a', false)).toBe(false);
    });
});
