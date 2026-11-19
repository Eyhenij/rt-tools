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
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

function setup(): ComponentFixture<RtAutocompleteComponent<string>> {
    const providers: Provider[] = [{ provide: BreakpointsService, useValue: new BreakpointsStub() }];
    return createRtFixture(RtAutocompleteComponent<string>, { suggestions: CITIES, ariaLabel: 'Регион' }, { providers });
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

describe('Автокомплит в нижней шторке', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1441 — нажатие на поле открывает шторку с поиском, не дожидаясь набора', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<string>> = setup();

        tapField(fixture);

        expect(document.querySelector('.rt-popover-sheet')).not.toBeNull();
        expect(sheetSearch()).not.toBeNull();
        expect(document.querySelectorAll('.rt-popover-sheet [qa-dataid="autocomplete-option"]').length).toBe(3);
    });

    it('SC-UKV-1442 — набор в поиске шторки просит подсказки, а короткий набор шторку не закрывает', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<string>> = setup();
        const queries: string[] = [];
        fixture.componentInstance.complete.subscribe((event: IRtAutocomplete.CompleteEvent): void => {
            queries.push(event.query);
        });
        tapField(fixture);

        const search: HTMLInputElement = sheetSearch() as HTMLInputElement;
        search.value = 'Гру';
        search.dispatchEvent(new Event('input'));
        settle(fixture);
        search.value = '';
        search.dispatchEvent(new Event('input'));
        settle(fixture);

        expect(queries).toContain('Гру');
        expect(document.querySelector('.rt-popover-sheet')).not.toBeNull();
    });

    it('SC-UKV-1443 — выбор подсказки в шторке ставит значение и закрывает шторку', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<string>> = setup();
        let chosen: string | null = null;
        fixture.componentInstance.registerOnChange((value: string | null): void => {
            chosen = value;
        });
        tapField(fixture);

        (document.querySelectorAll('.rt-popover-sheet [qa-dataid="autocomplete-option"]')[2] as HTMLElement).click();
        settle(fixture);

        expect(chosen).toBe('Груновка');
        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
    });
});
