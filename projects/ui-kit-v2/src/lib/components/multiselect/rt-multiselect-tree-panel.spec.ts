import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { IRtSelect } from '../select/rt-select.model';
import { RtMultiselectComponent } from './rt-multiselect.component';

/**
 * Дерево опций в панели `rt-multiselect`: выбор листьев веткой, флажок ветки и подпись фишки.
 * Расчёт строк проверяет спека общего модуля дерева.
 */
const TREE: ReadonlyArray<IRtSelect.Option<string>> = [
    {
        label: 'Россия',
        value: 'ru',
        children: [
            { label: 'Москва', value: 'msk' },
            { label: 'Тверь', value: 'tvr' },
            { label: 'Сочи', value: 'aer', disabled: true },
        ],
    },
    { label: 'Минск', value: 'msq' },
];

function rows(): HTMLElement[] {
    return Array.from(document.querySelectorAll('[qa-dataid="multiselect-option"]'));
}

function checkboxOf(row: HTMLElement): HTMLInputElement {
    return row.querySelector('[qa-dataid="multiselect-option-checkbox"]') as HTMLInputElement;
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtMultiselectComponent<string>> {
    return createRtFixture(RtMultiselectComponent<string>, { options: TREE, ...inputs });
}

function open<T>(fixture: ComponentFixture<T>): void {
    (qa(fixture, 'multiselect-trigger')?.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
}

/** Что семья отдала форме — тем же путём, каким его видит `formControl`. */
function changesOf<T>(fixture: ComponentFixture<RtMultiselectComponent<T>>): unknown[] {
    const changes: unknown[] = [];
    fixture.componentInstance.registerOnChange((value: unknown): void => {
        changes.push(value);
    });
    return changes;
}

function click<T>(fixture: ComponentFixture<T>, row: HTMLElement): void {
    row.click();
    fixture.detectChanges();
}

describe('RtMultiselectComponent — дерево опций', (): void => {
    it('SC-UKV-408 — у плоского списка нет ни стрелок, ни места под них', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup({ options: [{ label: 'Минск', value: 'msq' }] });

        open(fixture);

        expect(document.querySelector('[qa-dataid="multiselect-option-toggle"]')).toBeNull();
        expect(document.querySelector('.rt-multiselect__toggle-space')).toBeNull();
    });

    it('SC-UKV-412 — клик по ветке выбирает её включённые листья без неё самой, повторный снимает', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();
        const changes: unknown[] = changesOf(fixture);
        open(fixture);

        click(fixture, rows()[0]);
        click(fixture, rows()[0]);

        expect(changes).toEqual([['msk', 'tvr'], []]);
    });

    it('SC-UKV-413 — флажок ветки выводится из её листьев: частичный, включённый, выключенный', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();
        fixture.componentInstance.writeValue(['msk']);
        fixture.detectChanges();
        open(fixture);

        const branch: HTMLInputElement = checkboxOf(rows()[0]);
        expect(branch.indeterminate).toBe(true);
        expect(branch.checked).toBe(false);

        click(fixture, rows()[2]);
        expect(checkboxOf(rows()[0]).checked).toBe(true);
        expect(checkboxOf(rows()[0]).indeterminate).toBe(false);

        click(fixture, rows()[0]);
        expect(checkboxOf(rows()[0]).checked).toBe(false);
        expect(checkboxOf(rows()[0]).indeterminate).toBe(false);
    });

    it('клик по стрелке раскрывает ветку и ничего не выбирает', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();
        const changes: unknown[] = changesOf(fixture);
        open(fixture);
        expect(rows().length).toBe(2);

        (document.querySelector('[qa-dataid="multiselect-option-toggle"]') as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(rows().length).toBe(5);
        expect(changes).toEqual([]);
    });

    it('SC-UKV-417 — фишка берёт подпись листа из глубины дерева', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup();
        fixture.componentInstance.writeValue(['tvr']);
        fixture.detectChanges();

        const chip: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="tag-text"]') as HTMLElement;
        expect(chip.textContent?.trim()).toBe('Тверь');
        expect(fixture.componentInstance.displayText()).toBe('Тверь');
    });
});
