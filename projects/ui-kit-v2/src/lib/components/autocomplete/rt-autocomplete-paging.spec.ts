import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { RtAutocompleteComponent } from './rt-autocomplete.component';

interface ICity {
    readonly id: string;
    readonly name: string;
}

const CITIES: ReadonlyArray<ICity> = [
    { id: 'msk', name: 'Москва' },
    { id: 'msq', name: 'Минск' },
];

const CITY_LABEL: (item: ICity | null) => string = (item: ICity | null): string => item?.name ?? '';

/** Хозяин со своей разметкой пустого результата: шаблон без хозяина не передать. */
@Component({
    selector: 'rt-autocomplete-empty-host',
    template: `
        <rt-autocomplete [suggestions]="[]" [displayWith]="label" [emptyTemplate]="empty" />
        <ng-template #empty let-query>
            <span class="own-empty">Нет «{{ query }}»</span>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAutocompleteComponent],
})
class AutocompleteEmptyHostComponent {
    public readonly label: (item: ICity | null) => string = CITY_LABEL;
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtAutocompleteComponent<ICity>> {
    return createRtFixture(RtAutocompleteComponent<ICity>, { displayWith: CITY_LABEL, suggestions: CITIES, ...inputs });
}

function type<T>(fixture: ComponentFixture<T>, text: string): void {
    const node: HTMLInputElement = qa(fixture, 'autocomplete-input')?.nativeElement as HTMLInputElement;
    node.value = text;
    node.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

function byQa(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

/** Прокрутка панели до дна: размеры задаются на узле, jsdom их не считает. */
function scrollToEnd(panel: HTMLElement): void {
    Object.defineProperty(panel, 'scrollHeight', { configurable: true, value: 400 });
    Object.defineProperty(panel, 'clientHeight', { configurable: true, value: 200 });
    panel.scrollTop = 200;
    panel.dispatchEvent(new Event('scroll'));
}

describe('RtAutocompleteComponent — загрузка, конец списка, пустой результат', (): void => {
    it('SC-UKV-872 — при первой загрузке вместо пустого результата строка со спиннером', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup({ suggestions: [], loading: true });
        type(fixture, 'Мо');

        expect(byQa('autocomplete-panel')?.getAttribute('aria-busy')).toBe('true');
        expect(byQa('autocomplete-loading')).not.toBeNull();
        expect(byQa('autocomplete-empty')).toBeNull();
    });

    it('SC-UKV-872 — при подгрузке строка со спиннером стоит под списком', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup({ loading: true });
        type(fixture, 'М');

        const rows: string[] = Array.from(byQa('autocomplete-panel')?.children ?? []).map(
            (row: Element): string => row.getAttribute('qa-dataid') ?? ''
        );
        expect(rows).toEqual(['autocomplete-option', 'autocomplete-option', 'autocomplete-loading']);
    });

    it('SC-UKV-873 — дно панели сообщается один раз на длину списка и не во время загрузки', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup();
        let ends: number = 0;
        fixture.componentInstance.scrolledToEnd.subscribe((): number => (ends += 1));
        type(fixture, 'М');
        const panel: HTMLElement = byQa('autocomplete-panel') as HTMLElement;

        scrollToEnd(panel);
        scrollToEnd(panel);
        expect(ends).toBe(1);

        setInputs(fixture, { loading: true, suggestions: [...CITIES, { id: 'kzn', name: 'Казань' }] });
        fixture.detectChanges();
        scrollToEnd(panel);
        expect(ends).toBe(1);

        setInputs(fixture, { loading: false });
        fixture.detectChanges();
        scrollToEnd(panel);
        expect(ends).toBe(2);
    });

    it('SC-UKV-873 — новый запрос с первой страницей той же длины снова сообщает о дне', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup();
        let ends: number = 0;
        fixture.componentInstance.scrolledToEnd.subscribe((): number => (ends += 1));
        type(fixture, 'М');
        scrollToEnd(byQa('autocomplete-panel') as HTMLElement);
        expect(ends).toBe(1);

        type(fixture, 'Мо');
        scrollToEnd(byQa('autocomplete-panel') as HTMLElement);
        expect(ends).toBe(2);
    });

    it('SC-UKV-874 — свой текст пустого результата', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup({ suggestions: [], emptyText: 'Нет таких ролей' });
        type(fixture, 'Мо');

        expect(textOf(byQa('autocomplete-empty'))).toBe('Нет таких ролей');
    });

    it('SC-UKV-874 — своя разметка пустого результата получает набранную строку', (): void => {
        const fixture: ComponentFixture<AutocompleteEmptyHostComponent> = createRtFixture(AutocompleteEmptyHostComponent);
        type(fixture, 'Мо');

        expect(textOf(byQa('autocomplete-empty')?.querySelector('.own-empty') as HTMLElement)).toBe('Нет «Мо»');
    });
});
