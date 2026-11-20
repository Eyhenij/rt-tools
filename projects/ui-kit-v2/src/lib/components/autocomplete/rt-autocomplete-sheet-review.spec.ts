import { ApplicationRef, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { IRtAutocomplete } from './rt-autocomplete.model';
import { RtAutocompleteComponent } from './rt-autocomplete.component';

const CITIES: ReadonlyArray<string> = ['Грузия', 'Грузино-Имеретинская обл.', 'Груновка'];

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = signal<boolean>(true);
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

let stub: BreakpointsStub;

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtAutocompleteComponent<string>> {
    stub = new BreakpointsStub();
    const providers: Provider[] = [{ provide: BreakpointsService, useValue: stub }];
    return createRtFixture(RtAutocompleteComponent<string>, { suggestions: CITIES, ariaLabel: 'Регион', ...inputs }, { providers });
}

function settle<T>(fixture: ComponentFixture<T>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

function tapField(fixture: ComponentFixture<RtAutocompleteComponent<string>>): void {
    const field: HTMLInputElement = (fixture.nativeElement as HTMLElement).querySelector(
        '[qa-dataid="autocomplete-input"]'
    ) as HTMLInputElement;
    field.dispatchEvent(new FocusEvent('focus'));
    settle(fixture);
}

function sheetSearch(): HTMLInputElement | null {
    return document.querySelector<HTMLInputElement>('[qa-dataid="autocomplete-sheet-search"] input');
}

describe('Автокомплит в нижней шторке — замечания ревью', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1495 — порог ширины, пересечённый при открытой шторке, не убирает из неё поиск', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<string>> = setup();
        tapField(fixture);
        expect(sheetSearch()).not.toBeNull();

        stub.phone.set(false);
        settle(fixture);

        expect(sheetSearch()).not.toBeNull();
        expect(document.querySelectorAll('[qa-dataid="autocomplete-sheet-search"]').length).toBe(1);
    });

    it('SC-UKV-1495 — порог ширины, пересечённый при открытой панели у поля, не добавляет в неё поиск', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<string>> = setup();
        stub.phone.set(false);
        const field: HTMLInputElement = (fixture.nativeElement as HTMLElement).querySelector(
            '[qa-dataid="autocomplete-input"]'
        ) as HTMLInputElement;
        field.value = 'Гру';
        field.dispatchEvent(new Event('input'));
        settle(fixture);
        expect(document.querySelector('[qa-dataid="autocomplete-panel"]')).not.toBeNull();

        stub.phone.set(true);
        settle(fixture);

        expect(sheetSearch()).toBeNull();
    });

    it('SC-UKV-1502 — поиск шторки несёт роль combobox и связи со списком, как основное поле', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<string>> = setup();
        tapField(fixture);
        const search: HTMLInputElement = sheetSearch() as HTMLInputElement;
        const list: HTMLElement = document.querySelector('[qa-dataid="autocomplete-panel"]') as HTMLElement;

        expect(search.getAttribute('role')).toBe('combobox');
        expect(search.getAttribute('aria-controls')).toBe(list.id);
        expect(search.getAttribute('aria-expanded')).toBe('true');
        expect(search.getAttribute('aria-autocomplete')).toBe('list');

        search.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        settle(fixture);

        const active: HTMLElement = document.querySelector('.rt-autocomplete__option--active') as HTMLElement;
        expect(search.getAttribute('aria-activedescendant')).toBe(active.id);
    });

    it('SC-UKV-1503 — нажатие на поле на телефоне просит подсказки, только если текст не короче minLength', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<string>> = setup({ minLength: 3 });
        const queries: string[] = [];
        fixture.componentInstance.complete.subscribe((event: IRtAutocomplete.CompleteEvent): void => {
            queries.push(event.query);
        });

        tapField(fixture);

        expect(queries).toEqual([]);
        expect(document.querySelector('.rt-popover-sheet')).not.toBeNull();
    });

    it('SC-UKV-1503 — текст не короче minLength уходит запросом при нажатии на поле', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<string>> = setup({ minLength: 3 });
        fixture.componentInstance.writeValue('Грузия');
        const queries: string[] = [];
        fixture.componentInstance.complete.subscribe((event: IRtAutocomplete.CompleteEvent): void => {
            queries.push(event.query);
        });

        tapField(fixture);

        expect(queries).toEqual(['Грузия']);
    });

    it('SC-UKV-1498 — закрытая шторка возвращает фокус полю, и это не нажатие: запрос не повторяется, шторка не открывается', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<string>> = setup();
        fixture.componentInstance.writeValue('Грузия');
        const queries: string[] = [];
        fixture.componentInstance.complete.subscribe((event: IRtAutocomplete.CompleteEvent): void => {
            queries.push(event.query);
        });
        tapField(fixture);
        sheetSearch()?.focus();

        (document.querySelector('[qa-dataid="bottom-sheet-backdrop"]') as HTMLElement).click();
        settle(fixture);

        expect(queries).toEqual(['Грузия']);
        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
    });
});
