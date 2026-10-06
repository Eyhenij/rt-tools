import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { RtTreeComponent } from './rt-tree.component';
import { RtTreeNodeEndDirective } from './rt-tree.directives';
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

describe('RtTreeComponent', (): void => {
    it('SC-UKV-639 — клик по листу кладёт его в value', (): void => {
        const fixture: TFixture = setup({ value: ['msk'] });

        rowOf(fixture, 'msq').click();
        fixture.detectChanges();

        expect(fixture.componentInstance.value()).toEqual(['msk', 'msq']);
    });

    it('SC-UKV-640 — клик по ветке выбирает её листья, повторный снимает', (): void => {
        const fixture: TFixture = setup();

        rowOf(fixture, 'ru').click();
        fixture.detectChanges();
        expect([...fixture.componentInstance.value()].sort()).toEqual(['msk', 'tvr']);

        rowOf(fixture, 'ru').click();
        fixture.detectChanges();
        expect(fixture.componentInstance.value()).toEqual([]);
    });

    it('SC-UKV-641 — частично выбранная ветка рисует флажок с чертой', (): void => {
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

    it('SC-UKV-643 — одиночный режим рисует радио', (): void => {
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
