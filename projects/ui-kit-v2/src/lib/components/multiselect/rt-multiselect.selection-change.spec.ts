import { signal, ChangeDetectionStrategy, Component, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldTree, FormField, form } from '@angular/forms/signals';

import { createRtFixture, el, qa } from '../../../testing/rt-kit-testing';
import { IRtSelect } from '../select/rt-select.model';
import { RtMultiselectComponent } from './rt-multiselect.component';

const OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Москва', value: 'msk' },
    { label: 'Минск', value: 'msq' },
    { label: 'Казань', value: 'kzn' },
];

/** Поле под реактивной формой: событие сравнивается с тем, что получила форма. */
@Component({
    selector: 'rt-multiselect-selection-host',
    template: '<rt-multiselect [formControl]="control" [options]="opts" (selectionChange)="events.push($event)" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMultiselectComponent, ReactiveFormsModule],
})
class MultiselectSelectionHostComponent {
    public readonly control: FormControl<ReadonlyArray<string> | null> = new FormControl<ReadonlyArray<string> | null>([]);
    public readonly opts: ReadonlyArray<IRtSelect.Option<string>> = OPTIONS;
    public readonly events: Array<ReadonlyArray<string>> = [];
}

interface IFilter {
    cities: ReadonlyArray<string>;
}

/** Поле под сигнальной формой: модель задаётся снаружи, как её задаёт хранилище. */
@Component({
    selector: 'rt-multiselect-selection-signal-host',
    template: '<rt-multiselect [formField]="filter.cities" [options]="opts" (selectionChange)="events.push($event)" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMultiselectComponent, FormField],
})
class MultiselectSelectionSignalHostComponent {
    public readonly model: WritableSignal<IFilter> = signal<IFilter>({ cities: [] });
    public readonly filter: FieldTree<IFilter> = form(this.model);
    public readonly opts: ReadonlyArray<IRtSelect.Option<string>> = OPTIONS;
    public readonly events: Array<ReadonlyArray<string>> = [];
}

function setupHost(): ComponentFixture<MultiselectSelectionHostComponent> {
    return createRtFixture(MultiselectSelectionHostComponent);
}

function trigger<T>(fixture: ComponentFixture<T>): HTMLButtonElement {
    return qa(fixture, 'multiselect-trigger')?.nativeElement as HTMLButtonElement;
}

/** Панель списка живёт в оверлее CDK — ищем её в документе. */
function options(): HTMLElement[] {
    return Array.from(document.querySelectorAll('[qa-dataid="multiselect-option"]'));
}

function setValue(fixture: ComponentFixture<MultiselectSelectionHostComponent>, value: ReadonlyArray<string>): void {
    fixture.componentInstance.control.setValue(value);
    fixture.detectChanges();
}

describe('RtMultiselectComponent — selectionChange', (): void => {
    afterEach((): void => {
        document.querySelector('[qa-dataid="multiselect-panel"]')?.closest('.cdk-overlay-container')?.replaceChildren();
    });

    it('SC-UKV-1707 — writeValue из формы события не даёт', (): void => {
        const fixture: ComponentFixture<MultiselectSelectionHostComponent> = setupHost();

        setValue(fixture, ['msq', 'kzn']);

        expect(fixture.componentInstance.events).toEqual([]);
    });

    it('SC-UKV-1707 — пункт в панели даёт событие с тем же массивом, что получила форма', (): void => {
        const fixture: ComponentFixture<MultiselectSelectionHostComponent> = setupHost();
        trigger(fixture).click();
        fixture.detectChanges();

        options()[0].click();
        fixture.detectChanges();
        options()[1].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual([['msk'], ['msk', 'msq']]);
        expect(fixture.componentInstance.events[1]).toBe(fixture.componentInstance.control.value);
    });

    it('SC-UKV-1707 — пункт, выбранный клавишами, даёт событие', (): void => {
        const fixture: ComponentFixture<MultiselectSelectionHostComponent> = setupHost();
        trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        fixture.detectChanges();

        trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual([['msk']]);
        expect(fixture.componentInstance.control.value).toEqual(['msk']);
    });

    it('SC-UKV-1707 — снятый чип даёт событие с оставшимися значениями', (): void => {
        const fixture: ComponentFixture<MultiselectSelectionHostComponent> = setupHost();
        setValue(fixture, ['msk', 'msq']);

        el(fixture, '[qa-dataid="tag-close"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual([['msq']]);
        expect(fixture.componentInstance.events[0]).toBe(fixture.componentInstance.control.value);
    });

    it('SC-UKV-1707 — крестик даёт пустой массив — то же, что ушло в форму', (): void => {
        const fixture: ComponentFixture<MultiselectSelectionHostComponent> = setupHost();
        setValue(fixture, ['msk', 'msq']);

        el(fixture, '[qa-dataid="multiselect-clear"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual([[]]);
        expect(fixture.componentInstance.events[0]).toBe(fixture.componentInstance.control.value);
    });

    it('SC-UKV-1707 — отключённое поле на очистку события не даёт', (): void => {
        const fixture: ComponentFixture<MultiselectSelectionHostComponent> = setupHost();
        setValue(fixture, ['msk']);
        fixture.componentInstance.control.disable();
        fixture.detectChanges();

        const multiselect: RtMultiselectComponent<string> = fixture.debugElement.children[0]
            .componentInstance as RtMultiselectComponent<string>;
        (multiselect as unknown as { clear: () => void }).clear();
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual([]);
        expect(fixture.componentInstance.control.value).toEqual(['msk']);
    });

    it('SC-UKV-1707 — модель сигнальной формы, заданная снаружи, события не даёт, снятый чип — даёт', (): void => {
        const fixture: ComponentFixture<MultiselectSelectionSignalHostComponent> = createRtFixture(MultiselectSelectionSignalHostComponent);

        fixture.componentInstance.model.set({ cities: ['msk', 'msq'] });
        fixture.detectChanges();
        expect(fixture.componentInstance.events).toEqual([]);

        el(fixture, '[qa-dataid="tag-close"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual([['msq']]);
        expect(fixture.componentInstance.model().cities).toEqual(['msq']);
    });
});
