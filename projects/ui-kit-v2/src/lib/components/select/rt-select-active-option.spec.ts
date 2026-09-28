import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtAutocompleteComponent } from '../autocomplete/rt-autocomplete.component';
import { RtMultiselectComponent } from '../multiselect/rt-multiselect.component';
import { RtSelectComponent } from './rt-select.component';
import { IRtSelect } from './rt-select.model';

const OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Москва', value: 'msk' },
    { label: 'Минск', value: 'msq' },
    { label: 'Казань', value: 'kzn' },
];

const CITIES: ReadonlyArray<string> = ['Москва', 'Минск', 'Мурманск'];

const NEAREST: ScrollIntoViewOptions = { block: 'nearest' };

/** Опции живут в оверлее CDK — ищутся в документе. */
function options(qaId: string): HTMLElement[] {
    return Array.from(document.querySelectorAll(`[qa-dataid="${qaId}"]`));
}

function press<T>(fixture: ComponentFixture<T>, node: HTMLElement, name: string): void {
    node.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    fixture.detectChanges();
}

describe('rtScrollActiveOptionIntoView', (): void => {
    /** В среде спеки у узлов нет `scrollIntoView`: он ставится на время теста и помнит, кого прокручивали. */
    let scroll: jest.Mock;

    beforeEach((): void => {
        scroll = jest.fn();
        HTMLElement.prototype.scrollIntoView = scroll;
    });

    afterEach((): void => {
        Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
    });

    it('SC-UKV-382 — выбор одного: опция, подсвеченная клавишами, прокручивается в панель', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = createRtFixture(RtSelectComponent<string>, { options: OPTIONS });
        const trigger: HTMLElement = qa(fixture, 'select-trigger')?.nativeElement as HTMLElement;

        press(fixture, trigger, 'ArrowDown');
        expect(scroll.mock.contexts).toEqual([options('select-option')[0]]);

        press(fixture, trigger, 'ArrowDown');
        press(fixture, trigger, 'ArrowUp');

        const [first, second]: HTMLElement[] = options('select-option');
        expect(scroll.mock.contexts).toEqual([first, second, first]);
        expect(scroll.mock.calls).toEqual([[NEAREST], [NEAREST], [NEAREST]]);
    });

    it('SC-UKV-382 — выбор нескольких: опция, подсвеченная клавишами, прокручивается в панель', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = createRtFixture(RtMultiselectComponent<string>, {
            options: OPTIONS,
        });
        const trigger: HTMLElement = qa(fixture, 'multiselect-trigger')?.nativeElement as HTMLElement;

        press(fixture, trigger, 'ArrowDown');
        press(fixture, trigger, 'ArrowDown');

        const [first, second]: HTMLElement[] = options('multiselect-option');
        expect(scroll.mock.contexts).toEqual([first, second]);
        expect(scroll.mock.calls).toEqual([[NEAREST], [NEAREST]]);
    });

    it('SC-UKV-382 — подсказки: подсказка, подсвеченная клавишами, прокручивается в панель, без подсветки — нет', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<string>> = createRtFixture(RtAutocompleteComponent<string>, {
            suggestions: CITIES,
        });
        const field: HTMLInputElement = qa(fixture, 'autocomplete-input')?.nativeElement as HTMLInputElement;

        field.value = 'м';
        field.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(options('autocomplete-option').length).toBe(3);
        expect(scroll).not.toHaveBeenCalled();

        press(fixture, field, 'ArrowDown');
        press(fixture, field, 'ArrowDown');
        press(fixture, field, 'ArrowUp');

        const [first, second]: HTMLElement[] = options('autocomplete-option');
        expect(scroll.mock.contexts).toEqual([first, second, first]);
    });

    it('SC-UKV-382 — среда без `scrollIntoView` подсветку не ломает', (): void => {
        Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
        const fixture: ComponentFixture<RtSelectComponent<string>> = createRtFixture(RtSelectComponent<string>, { options: OPTIONS });
        const trigger: HTMLElement = qa(fixture, 'select-trigger')?.nativeElement as HTMLElement;

        press(fixture, trigger, 'ArrowDown');

        expect(options('select-option')[0].classList.contains('rt-select__option--active')).toBe(true);
    });
});
