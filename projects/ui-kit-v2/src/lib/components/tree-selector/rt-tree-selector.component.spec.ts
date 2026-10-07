import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { IRtTree } from '../tree/rt-tree.model';
import { RtTreeSelectorComponent } from './rt-tree-selector.component';
import { RtTreeSelectorControlsDirective } from './rt-tree-selector.directives';

/**
 * `rt-tree-selector` через нарисованную разметку: поиск, клавиши из поля, прямая и подтверждаемая
 * формы, переключатель множественного выбора и контролы приложения. Отбор и очистку считает спека
 * логики рядом.
 */
const NODES: ReadonlyArray<IRtTree.Node<string>> = [
    {
        label: 'France',
        value: 'fr',
        children: [
            { label: 'Paris Hilton', value: 'ph' },
            { label: 'Paris Ritz', value: 'pr' },
        ],
    },
    {
        label: 'Germany',
        value: 'de',
        children: [{ label: 'Berlin Hilton', value: 'bh' }],
    },
];

type TFixture = ComponentFixture<RtTreeSelectorComponent<string>>;

function setup(inputs: Readonly<Record<string, unknown>> = {}): TFixture {
    return createRtFixture(RtTreeSelectorComponent<string>, { nodes: NODES, ...inputs });
}

function host(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
}

function rowValues(fixture: ComponentFixture<unknown>): string[] {
    return Array.from(host(fixture).querySelectorAll('[qa-dataid="tree-row"]')).map(
        (row: Element): string => row.getAttribute('data-value') ?? ''
    );
}

function click(fixture: ComponentFixture<unknown>, value: string, init: MouseEventInit = {}): void {
    const row: Element | null = host(fixture).querySelector(`[qa-dataid="tree-row"][data-value="${value}"]`);
    row?.dispatchEvent(new MouseEvent('click', { bubbles: true, ...init }));
    fixture.detectChanges();
}

function searchInput(fixture: ComponentFixture<unknown>): HTMLInputElement {
    return host(fixture).querySelector('[qa-dataid="tree-selector-search"] input') as HTMLInputElement;
}

async function type(fixture: TFixture, text: string): Promise<void> {
    const field: HTMLInputElement = searchInput(fixture);
    field.value = text;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}

function press(fixture: ComponentFixture<unknown>, key: string): void {
    searchInput(fixture).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    fixture.detectChanges();
}

function button(fixture: ComponentFixture<unknown>, qa: string): HTMLButtonElement {
    return host(fixture).querySelector(`[qa-dataid="${qa}"]`) as HTMLButtonElement;
}

function pressButton(fixture: ComponentFixture<unknown>, qa: string): void {
    button(fixture, qa).click();
    fixture.detectChanges();
}

@Component({
    selector: 'rt-tree-selector-controls-host',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTreeSelectorComponent, RtTreeSelectorControlsDirective],
    template: `
        <rt-tree-selector expandControls [nodes]="nodes">
            <ng-template rtTreeSelectorControls>
                <button qa-dataid="own-control" type="button">Group by</button>
            </ng-template>
        </rt-tree-selector>
    `,
})
class ControlsHostComponent {
    protected readonly nodes: ReadonlyArray<IRtTree.Node<string>> = NODES;
}

describe('RtTreeSelectorComponent', (): void => {
    it('SC-UKV-677: the search keeps the nodes with every word, opens the kept branches and marks the words', async (): Promise<void> => {
        const fixture: TFixture = setup();
        await type(fixture, 'hilton paris');
        expect(rowValues(fixture)).toEqual(['fr', 'ph']);
        const marked: string[] = Array.from(host(fixture).querySelectorAll('[class*="__part--match"]')).map((part: Element): string =>
            (part.textContent ?? '').toLowerCase()
        );
        expect(marked).toEqual(expect.arrayContaining(['paris', 'hilton']));
    });

    it('a search that found nothing says so and keeps the controls row', async (): Promise<void> => {
        const fixture: TFixture = setup();
        await type(fixture, 'nothing like it');
        expect(host(fixture).querySelector('[qa-dataid="tree-selector-empty"]')?.textContent?.trim()).toBe('Nothing found');
        expect(host(fixture).querySelector('.rt-tree-selector__controls')).not.toBeNull();
    });

    it('SC-UKV-679: the search field hands the arrows and Space to the tree and keeps its text', async (): Promise<void> => {
        const fixture: TFixture = setup({ expandOnStart: 'all' });
        await fixture.whenStable();
        fixture.detectChanges();
        await type(fixture, 'hilton');
        press(fixture, 'ArrowDown');
        press(fixture, 'ArrowDown');
        press(fixture, ' ');
        expect(fixture.componentInstance.value()).toEqual(['ph']);
        expect(searchInput(fixture).value).toBe('hilton');
    });

    it('SC-UKV-680: in the direct form a click writes the choice at once', (): void => {
        const fixture: TFixture = setup({ expandOnStart: 'all' });
        fixture.componentInstance.value.set([]);
        fixture.detectChanges();
        click(fixture, 'fr');
        expect(fixture.componentInstance.value()).toEqual(['ph', 'pr']);
        expect(button(fixture, 'tree-selector-apply')).toBeNull();
    });

    it('SC-UKV-681: in the confirming form Cancel drops the draft and Apply writes it', (): void => {
        const fixture: TFixture = setup({ confirm: true, value: ['ph'] });
        const applied: Array<ReadonlyArray<string>> = [];
        let cancelled: number = 0;
        fixture.componentInstance.applied.subscribe((value: ReadonlyArray<string>): number => applied.push(value));
        fixture.componentInstance.cancelled.subscribe((): number => (cancelled += 1));

        click(fixture, 'pr');
        expect(fixture.componentInstance.value()).toEqual(['ph']);
        pressButton(fixture, 'tree-selector-cancel');
        expect(fixture.componentInstance.value()).toEqual(['ph']);
        expect(cancelled).toBe(1);

        click(fixture, 'pr');
        pressButton(fixture, 'tree-selector-apply');
        expect(fixture.componentInstance.value()).toEqual(['ph', 'pr']);
        expect(applied).toEqual([['ph', 'pr']]);
    });

    it('SC-UKV-682: Apply is off while nothing changed and while an empty draft is not allowed', (): void => {
        const fixture: TFixture = setup({ confirm: true, emptyAllowed: false, value: ['ph'] });
        expect(button(fixture, 'tree-selector-apply').disabled).toBe(true);

        click(fixture, 'ph');
        expect(button(fixture, 'tree-selector-apply').disabled).toBe(true);
        expect(fixture.componentInstance.canApply()).toBe(false);

        click(fixture, 'pr');
        expect(button(fixture, 'tree-selector-apply').disabled).toBe(false);
        expect(fixture.componentInstance.canApply()).toBe(true);
    });

    it('SC-UKV-684: with the multi toggle off a plain click keeps one node, with it on a click adds', (): void => {
        const fixture: TFixture = setup({ multiToggle: true, value: ['ph'] });
        click(fixture, 'pr');
        expect(fixture.componentInstance.value()).toEqual(['pr']);

        const toggle: HTMLElement = host(fixture).querySelector(
            '[qa-dataid="tree-selector-multi"] [qa-dataid="toggle-switch-control"]'
        ) as HTMLElement;
        toggle.click();
        fixture.detectChanges();
        click(fixture, 'ph');
        expect([...fixture.componentInstance.value()].sort()).toEqual(['ph', 'pr']);
    });

    it('SC-UKV-685: Enter in the single confirming form applies a new node and cancels the same one', async (): Promise<void> => {
        const fixture: TFixture = setup({ confirm: true, mode: 'single', value: ['ph'] });
        const applied: Array<ReadonlyArray<string>> = [];
        fixture.componentInstance.applied.subscribe((value: ReadonlyArray<string>): number => applied.push(value));
        await type(fixture, 'ritz');
        press(fixture, 'ArrowDown');
        press(fixture, 'ArrowDown');
        press(fixture, 'Enter');
        expect(applied).toEqual([['pr']]);

        const same: TFixture = setup({ confirm: true, mode: 'single', value: ['ph'] });
        let cancelled: number = 0;
        same.componentInstance.cancelled.subscribe((): number => (cancelled += 1));
        await type(same, 'paris hilton');
        press(same, 'ArrowDown');
        press(same, 'ArrowDown');
        press(same, 'Enter');
        expect(cancelled).toBe(1);
        expect(same.componentInstance.value()).toEqual(['ph']);
    });

    it('SC-UKV-686: the application controls stand at the right end of the row, after the selector buttons', (): void => {
        const fixture: ComponentFixture<ControlsHostComponent> = TestBed.createComponent(ControlsHostComponent);
        fixture.detectChanges();
        const row: Element | null = host(fixture).querySelector('.rt-tree-selector__row');
        const children: Element[] = Array.from(row?.children ?? []);
        expect(children.map((child: Element): string => child.getAttribute('qa-dataid') ?? '')).toEqual([
            'tree-selector-expand-all',
            'tree-selector-collapse-all',
            '',
        ]);
        const own: Element | undefined = children.at(-1);
        expect(own?.classList).toContain('rt-tree-selector__own');
        expect(own?.querySelector('[qa-dataid="own-control"]')).not.toBeNull();
    });

    it('clear keeps the disabled chosen nodes and is drawn only while something is chosen', (): void => {
        const nodes: ReadonlyArray<IRtTree.Node<string>> = [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b', disabled: true },
        ];
        const fixture: TFixture = setup({ nodes, clearable: true, value: ['a', 'b'] });
        pressButton(fixture, 'tree-selector-clear');
        expect(fixture.componentInstance.value()).toEqual(['b']);

        fixture.componentInstance.value.set([]);
        fixture.detectChanges();
        expect(button(fixture, 'tree-selector-clear')).toBeNull();
    });

    it('SC-UKV-689: expand-all and collapse-all are icon buttons drawn only when asked for', (): void => {
        const plain: TFixture = setup();
        expect(host(plain).querySelector('.rt-tree-selector__row')).not.toBeNull();
        expect(button(plain, 'tree-selector-expand-all')).toBeNull();
        expect(button(plain, 'tree-selector-collapse-all')).toBeNull();

        const asked: TFixture = setup({ expandControls: true });
        const expand: HTMLButtonElement = button(asked, 'tree-selector-expand-all');
        expect(expand.classList).toContain('rt-button--icon-only');
        expect(expand.getAttribute('aria-label')).toBe('Expand all');
        expect(button(asked, 'tree-selector-collapse-all').classList).toContain('rt-button--icon-only');
    });

    it('SC-UKV-690: revert returns the draft to the choice and stands only in the confirming form', (): void => {
        const fixture: TFixture = setup({ confirm: true, revertable: true, expandOnStart: 'all', value: ['ph'] });
        expect(button(fixture, 'tree-selector-revert').disabled).toBe(true);

        click(fixture, 'bh');
        expect(button(fixture, 'tree-selector-apply').disabled).toBe(false);
        expect(button(fixture, 'tree-selector-revert').disabled).toBe(false);

        pressButton(fixture, 'tree-selector-revert');
        expect(button(fixture, 'tree-selector-apply').disabled).toBe(true);
        expect(button(fixture, 'tree-selector-revert').disabled).toBe(true);
        expect(fixture.componentInstance.value()).toEqual(['ph']);

        const direct: TFixture = setup({ revertable: true });
        expect(host(direct).querySelector('.rt-tree-selector__row')).not.toBeNull();
        expect(button(direct, 'tree-selector-revert')).toBeNull();
    });

    it('clear is an icon button with a trash can', (): void => {
        const fixture: TFixture = setup({ clearable: true, value: ['ph'] });
        const clear: HTMLButtonElement = button(fixture, 'tree-selector-clear');
        expect(clear.classList).toContain('rt-button--icon-only');
        expect(clear.getAttribute('aria-label')).toBe('Clear selection');
    });

    it('SC-UKV-700: a disabled selector switches off the field and the buttons and keeps the choice', (): void => {
        const fixture: TFixture = setup({
            disabled: true,
            confirm: true,
            clearable: true,
            revertable: true,
            expandControls: true,
            expandOnStart: 'all',
            value: ['ph'],
        });
        expect(searchInput(fixture).disabled).toBe(true);
        [
            'tree-selector-expand-all',
            'tree-selector-collapse-all',
            'tree-selector-clear',
            'tree-selector-revert',
            'tree-selector-cancel',
        ].forEach((qa: string): void => expect(button(fixture, qa).disabled).toBe(true));

        click(fixture, 'bh');
        expect(button(fixture, 'tree-selector-apply').disabled).toBe(true);
        expect(fixture.componentInstance.canApply()).toBe(false);
        expect(fixture.componentInstance.value()).toEqual(['ph']);
    });
});
