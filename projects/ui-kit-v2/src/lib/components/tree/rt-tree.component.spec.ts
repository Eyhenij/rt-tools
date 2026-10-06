import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { RtTreeComponent } from './rt-tree.component';
import { RtTreeNodeEndDirective, RtTreeNodeMetaDirective } from './rt-tree.directives';
import { IRtTree } from './rt-tree.model';

/**
 * `rt-tree` через нарисованную разметку: клик, отметки, клавиши, разметка приложения и пустое
 * дерево. Расчёт выбора проверяет спека логики рядом.
 */
const TREE: ReadonlyArray<IRtTree.Node<string>> = [
    {
        label: 'Россия',
        value: 'ru',
        children: [
            { label: 'Москва', value: 'msk', description: 'Столица' },
            { label: 'Тверь', value: 'tvr' },
        ],
    },
    { label: 'Минск', value: 'msq' },
];

type TFixture = ComponentFixture<RtTreeComponent<string>>;

function setup(inputs: Readonly<Record<string, unknown>> = {}): TFixture {
    return createRtFixture(RtTreeComponent<string>, { nodes: TREE, ...inputs });
}

function rows(fixture: ComponentFixture<unknown>): HTMLElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[qa-dataid="tree-row"]'));
}

function rowOf(fixture: ComponentFixture<unknown>, value: string): HTMLElement {
    return rows(fixture).find((row: HTMLElement): boolean => row.getAttribute('data-value') === value) as HTMLElement;
}

function emptyText(fixture: TFixture): string {
    return ((fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="tree-empty"]')?.textContent ?? '').trim();
}

function key(fixture: TFixture, name: string): { taken: boolean; prevented: boolean } {
    const event: KeyboardEvent = new KeyboardEvent('keydown', { key: name, cancelable: true });
    const taken: boolean = fixture.componentInstance.handleKeydown(event);
    fixture.detectChanges();
    return { taken, prevented: event.defaultPrevented };
}

@Component({
    selector: 'rt-tree-end-host',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTreeComponent, RtTreeNodeEndDirective],
    template: `
        <rt-tree [nodes]="nodes">
            <ng-template rtTreeNodeEnd let-node>
                <span qa-dataid="end-mark">{{ node.value }}</span>
            </ng-template>
        </rt-tree>
    `,
})
class TreeEndHostComponent {
    protected readonly nodes: ReadonlyArray<IRtTree.Node<string>> = TREE;
}

const LEAVES: ReadonlyArray<IRtTree.Node<string>> = ['a', 'b', 'c', 'd'].map((value: string): IRtTree.Node<string> => ({
    label: value.toUpperCase(),
    value,
}));

function click(fixture: ComponentFixture<unknown>, value: string, init: MouseEventInit = {}): void {
    rowOf(fixture, value).dispatchEvent(new MouseEvent('click', { bubbles: true, ...init }));
    fixture.detectChanges();
}

function matchedIn(target: Element): string[] {
    return Array.from(target.querySelectorAll('[class*="__part--match"]')).map((part: Element): string => part.textContent ?? '');
}

@Component({
    selector: 'rt-tree-meta-host',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTreeComponent, RtTreeNodeMetaDirective],
    template: `
        <rt-tree searchTerm="msq" [filter]="false" [nodes]="nodes">
            <ng-template rtTreeNodeMeta let-node>
                <span qa-dataid="meta-mark">{{ node.value }}</span>
            </ng-template>
        </rt-tree>
    `,
})
class TreeMetaHostComponent {
    protected readonly nodes: ReadonlyArray<IRtTree.Node<string>> = [
        { label: 'Минск', value: 'msq', badges: [{ text: 'MSQ', severity: 'info' }, { text: 'Столица' }] },
    ];
}

describe('RtTreeComponent', (): void => {
    it('SC-UKV-668 — исключающее дерево выбирает узел кликом один и добавляет по Ctrl или Cmd', (): void => {
        const fixture: TFixture = setup({ nodes: LEAVES, value: ['a'], exclusive: true });

        click(fixture, 'b');
        expect(fixture.componentInstance.value()).toEqual(['b']);

        click(fixture, 'c', { ctrlKey: true });
        click(fixture, 'd', { metaKey: true });
        expect([...fixture.componentInstance.value()].sort()).toEqual(['b', 'c', 'd']);
    });

    it('SC-UKV-669 — группа без отметки раскрывается кликом и пробелом, выбор не меняется', (): void => {
        const fixture: TFixture = setup({ branchMarks: false });

        expect(rowOf(fixture, 'ru').querySelector('[qa-dataid="tree-row-checkbox"]')).toBeNull();
        expect(rowOf(fixture, 'msq').querySelector('[qa-dataid="tree-row-checkbox"]')).not.toBeNull();

        click(fixture, 'ru');
        expect(rowOf(fixture, 'msk')).toBeDefined();

        key(fixture, ' ');
        expect(rowOf(fixture, 'msk')).toBeUndefined();
        expect(fixture.componentInstance.value()).toEqual([]);
    });

    it('SC-UKV-670 — поиск без отбора не прячет строк и отмечает найденное', (): void => {
        const fixture: TFixture = setup({ filter: false, searchTerm: 'мин' });

        expect(rows(fixture).map((row: HTMLElement): string | null => row.getAttribute('data-value'))).toEqual(['ru', 'msq']);
        expect(matchedIn(rowOf(fixture, 'msq'))).toEqual(['Мин']);
    });

    it('SC-UKV-671 — метки узла и разметка приложения стоят под подписью', (): void => {
        TestBed.configureTestingModule({ imports: [TreeMetaHostComponent] });
        const fixture: ComponentFixture<TreeMetaHostComponent> = TestBed.createComponent(TreeMetaHostComponent);
        fixture.detectChanges();
        const meta: HTMLElement = rowOf(fixture, 'msq').querySelector('[qa-dataid="tree-row-meta"]') as HTMLElement;

        const tags: Element[] = Array.from(meta.querySelectorAll('rt-tag'));
        expect(tags.length).toBe(2);
        expect(matchedIn(tags[0])).toEqual(['MSQ']);
        expect(matchedIn(tags[1])).toEqual([]);
        expect(meta.querySelector('[qa-dataid="meta-mark"]')?.textContent).toBe('msq');
    });

    it('SC-UKV-672 — клик по листу кладёт его в value', (): void => {
        const fixture: TFixture = setup({ value: ['msk'] });

        rowOf(fixture, 'msq').click();
        fixture.detectChanges();

        expect(fixture.componentInstance.value()).toEqual(['msk', 'msq']);
    });

    it('SC-UKV-673 — клик по ветке выбирает её листья, повторный снимает', (): void => {
        const fixture: TFixture = setup();

        rowOf(fixture, 'ru').click();
        fixture.detectChanges();
        expect([...fixture.componentInstance.value()].sort()).toEqual(['msk', 'tvr']);

        rowOf(fixture, 'ru').click();
        fixture.detectChanges();
        expect(fixture.componentInstance.value()).toEqual([]);
    });

    it('SC-UKV-674 — частично выбранная ветка рисует флажок с чертой', (): void => {
        const fixture: TFixture = setup({ value: ['msk'] });
        const box: HTMLElement = rowOf(fixture, 'ru').querySelector('[qa-dataid="tree-row-checkbox"] [role="checkbox"]') as HTMLElement;

        expect(box.getAttribute('aria-checked')).toBe('mixed');
    });

    it('SC-UKV-653 — подпись и описание строки несут подсказку обрезанного текста', (): void => {
        const fixture: TFixture = setup({ value: ['msk'] });
        const tips: RtTooltipDirective[] = fixture.debugElement
            .queryAll(By.directive(RtTooltipDirective))
            .map((node: DebugElement): RtTooltipDirective => node.injector.get(RtTooltipDirective));
        const texts: string[] = tips.map((tip: RtTooltipDirective): string => tip.text());

        expect(texts).toEqual(expect.arrayContaining(['Москва', 'Столица', 'Минск']));
        expect(tips.every((tip: RtTooltipDirective): boolean => tip.whenTruncated())).toBe(true);
    });

    it('SC-UKV-652 — выбор ветки не сворачивает и не раскрывает её', (): void => {
        const fixture: TFixture = setup({ value: ['msk'] });
        expect(rowOf(fixture, 'tvr')).toBeDefined();

        rowOf(fixture, 'ru').click();
        fixture.detectChanges();
        expect(rowOf(fixture, 'ru').getAttribute('aria-expanded')).toBe('true');

        rowOf(fixture, 'ru').click();
        fixture.detectChanges();
        expect(fixture.componentInstance.value()).toEqual([]);
        expect(rowOf(fixture, 'ru').getAttribute('aria-expanded')).toBe('true');
        expect(rowOf(fixture, 'tvr')).toBeDefined();
    });

    it('SC-UKV-676 — одиночный режим рисует радио', (): void => {
        const fixture: TFixture = setup({ mode: 'single' });

        expect(rowOf(fixture, 'msq').querySelector('[qa-dataid="tree-row-radio"]')).not.toBeNull();
        expect(rowOf(fixture, 'msq').querySelector('[qa-dataid="tree-row-checkbox"]')).toBeNull();
    });

    it('SC-UKV-644 — без отметок клик по листу отдаёт picked и не трогает выбор', (): void => {
        const fixture: TFixture = setup({ mode: 'none' });
        const picked: IRtTree.Node<string>[] = [];
        fixture.componentInstance.picked.subscribe((node: IRtTree.Node<string>): number => picked.push(node));

        rowOf(fixture, 'msq').click();
        fixture.detectChanges();

        expect(picked.map((node: IRtTree.Node<string>): string => node.value)).toEqual(['msq']);
        expect(fixture.componentInstance.value()).toEqual([]);
        expect(rowOf(fixture, 'msq').querySelector('input')).toBeNull();
    });

    it('SC-UKV-646 — ветка над выбранным листом раскрыта', (): void => {
        const fixture: TFixture = setup({ value: ['tvr'] });

        expect(rowOf(fixture, 'ru').getAttribute('aria-expanded')).toBe('true');
        expect(rowOf(fixture, 'tvr')).toBeDefined();
    });

    it('SC-UKV-647 — найденная часть подписи выделена', (): void => {
        const fixture: TFixture = setup({ searchTerm: 'мин' });
        const match: HTMLElement | null = rowOf(fixture, 'msq').querySelector('.rt-tree__part--match');

        expect(rows(fixture)).toHaveLength(1);
        expect(match?.textContent).toBe('Мин');
    });

    it('SC-UKV-648 — стрелка вправо раскрывает ветку, вторая уводит на первого ребёнка', (): void => {
        const fixture: TFixture = setup();

        key(fixture, 'ArrowDown');
        expect(rowOf(fixture, 'ru').getAttribute('aria-expanded')).toBe('false');

        key(fixture, 'ArrowRight');
        expect(rowOf(fixture, 'ru').getAttribute('aria-expanded')).toBe('true');

        key(fixture, 'ArrowRight');
        expect(rowOf(fixture, 'msk').classList).toContain('rt-tree__row--highlighted');
    });

    it('SC-UKV-649 — чужая клавиша не взята и не погашена', (): void => {
        const fixture: TFixture = setup();

        expect(key(fixture, 'a')).toEqual({ taken: false, prevented: false });
        expect(key(fixture, ' ')).toEqual({ taken: false, prevented: false });
    });

    it('SC-UKV-650 — разметка приложения стоит в конце каждой строки со своим узлом', (): void => {
        TestBed.configureTestingModule({ imports: [TreeEndHostComponent] });
        const fixture: ComponentFixture<TreeEndHostComponent> = TestBed.createComponent(TreeEndHostComponent);
        fixture.detectChanges();

        const marks: string[] = rows(fixture).map(
            (row: HTMLElement): string => row.querySelector('[qa-dataid="end-mark"]')?.textContent ?? ''
        );
        expect(marks).toEqual(['ru', 'msq']);
    });

    it('SC-UKV-651 — пустое дерево называет причину', (): void => {
        const found: TFixture = setup({ searchTerm: 'нет такого' });
        const none: TFixture = setup({ nodes: [] });

        expect(emptyText(found)).toBe('Nothing found');
        expect(emptyText(none)).toBe('No options');
    });
});
