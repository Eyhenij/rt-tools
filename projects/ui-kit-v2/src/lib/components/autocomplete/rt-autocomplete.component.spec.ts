import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture, el, hostClasses, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { IRtAutocomplete } from './rt-autocomplete.model';
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

/** Панель подсказок живёт в оверлее CDK — ищем её в документе. */
function suggestions(): HTMLElement[] {
    return Array.from(document.querySelectorAll('[qa-dataid="autocomplete-option"]'));
}

function panel(): HTMLElement | null {
    return document.querySelector('[qa-dataid="autocomplete-panel"]');
}

@Component({
    selector: 'rt-autocomplete-host',
    template: `
        <rt-autocomplete [formControl]="control" [suggestions]="items()" [displayWith]="label" (complete)="lastQuery = $event.query" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAutocompleteComponent, ReactiveFormsModule],
})
class AutocompleteHostComponent {
    public readonly control: FormControl<ICity | null> = new FormControl<ICity | null>(null);
    public readonly items: WritableSignal<ReadonlyArray<ICity>> = signal<ReadonlyArray<ICity>>([]);
    public readonly label: (item: ICity | null) => string = CITY_LABEL;
    public lastQuery: string = '';
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtAutocompleteComponent<ICity>> {
    return createRtFixture(RtAutocompleteComponent<ICity>, { displayWith: CITY_LABEL, suggestions: CITIES, ...inputs });
}

function field<T>(fixture: ComponentFixture<T>): HTMLInputElement {
    return qa(fixture, 'autocomplete-input')?.nativeElement as HTMLInputElement;
}

function type<T>(fixture: ComponentFixture<T>, text: string): void {
    const node: HTMLInputElement = field(fixture);
    node.value = text;
    node.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

describe('RtAutocompleteComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-autocomplete');
    });

    it('поле объявлено полем с подсказками', (): void => {
        const node: HTMLInputElement = field(setup());

        expect(node.getAttribute('role')).toBe('combobox');
        expect(node.getAttribute('aria-autocomplete')).toBe('list');
        expect(node.getAttribute('autocomplete')).toBe('off');
    });

    describe('запрос подсказок', (): void => {
        it('набор поднимает событие с введённой строкой и раскрывает панель', (): void => {
            // Подсказки ищет потребитель: компонент только сообщает, что набрано.
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup();
            const queries: string[] = [];
            fixture.componentInstance.complete.subscribe((event: IRtAutocomplete.CompleteEvent): void => {
                queries.push(event.query);
            });

            type(fixture, 'мос');

            expect(queries).toEqual(['мос']);
            expect(panel()).not.toBeNull();
        });

        it('строка короче порога не поднимает события и закрывает панель', (): void => {
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup({ minLength: 3 });
            const queries: string[] = [];
            type(fixture, 'мос');
            fixture.componentInstance.complete.subscribe((event: IRtAutocomplete.CompleteEvent): void => {
                queries.push(event.query);
            });

            type(fixture, 'мо');

            expect(queries).toEqual([]);
            expect(panel()).toBeNull();
        });

        it('без входа порог — один символ', (): void => {
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup();

            type(fixture, 'м');

            expect(panel()).not.toBeNull();
        });

        it('фокус сам по себе панель не раскрывает', (): void => {
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup();

            field(fixture).dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            expect(panel()).toBeNull();
        });

        it('с входом «открывать по фокусу» панель раскрывается сразу', (): void => {
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup({ openOnFocus: true });

            field(fixture).dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            expect(panel()).not.toBeNull();
        });
    });

    describe('подсказки', (): void => {
        it('рисуются подписью из переданной функции', (): void => {
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup();

            type(fixture, 'м');

            expect(suggestions().map((node: HTMLElement): string => (node.textContent ?? '').trim())).toEqual(['Москва', 'Минск']);
        });

        it('пустой список даёт строку «ничего не найдено»', (): void => {
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup({ suggestions: [] });

            type(fixture, 'ы');

            expect(document.querySelector('[qa-dataid="autocomplete-empty"]')?.textContent?.trim()).toBe('Nothing found');
        });

        it('клик по подсказке ставит значение, подставляет её подпись и закрывает панель', (): void => {
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup();
            const picks: ICity[] = [];
            fixture.componentInstance.itemSelect.subscribe((item: ICity): void => {
                picks.push(item);
            });
            type(fixture, 'м');

            suggestions()[1].click();
            fixture.detectChanges();

            expect(field(fixture).value).toBe('Минск');
            expect(picks).toEqual([CITIES[1]]);
            expect(panel()).toBeNull();
        });
    });

    describe('клавиатура', (): void => {
        function key(fixture: ComponentFixture<RtAutocompleteComponent<ICity>>, name: string): void {
            field(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
            fixture.detectChanges();
        }

        it('стрелка вниз подсвечивает первую подсказку', (): void => {
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup();
            type(fixture, 'м');

            key(fixture, 'ArrowDown');

            expect(suggestions()[0].classList.contains('rt-autocomplete__option--active')).toBe(true);
        });

        it('Enter выбирает подсвеченную подсказку', (): void => {
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup();
            type(fixture, 'м');
            key(fixture, 'ArrowDown');

            key(fixture, 'Enter');

            expect(field(fixture).value).toBe('Москва');
        });

        it('Escape закрывает панель', (): void => {
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup();
            type(fixture, 'м');

            key(fixture, 'Escape');

            expect(panel()).toBeNull();
        });

        it('при закрытой панели клавиши ничего не делают', (): void => {
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup();

            key(fixture, 'ArrowDown');

            expect(panel()).toBeNull();
        });
    });

    describe('очистка', (): void => {
        it('крестик появляется, как только в поле что-то набрано', (): void => {
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup();
            expect(qa(fixture, 'autocomplete-clear')).toBeNull();

            type(fixture, 'м');

            expect(qa(fixture, 'autocomplete-clear')).not.toBeNull();
        });

        it('крестик стирает и текст, и выбранное значение', (): void => {
            const fixture: ComponentFixture<AutocompleteHostComponent> = createRtFixture(AutocompleteHostComponent);
            fixture.componentInstance.control.setValue(CITIES[0]);
            fixture.detectChanges();

            el(fixture, '[qa-dataid="autocomplete-clear"] button')?.nativeElement.click();
            fixture.detectChanges();

            expect(field(fixture).value).toBe('');
            expect(fixture.componentInstance.control.value).toBeNull();
        });
    });

    describe('реактивная форма', (): void => {
        it('значение формы подставляет в поле его подпись', (): void => {
            const fixture: ComponentFixture<AutocompleteHostComponent> = createRtFixture(AutocompleteHostComponent);

            fixture.componentInstance.control.setValue(CITIES[1]);
            fixture.detectChanges();

            expect(field(fixture).value).toBe('Минск');
        });

        it('набор сам по себе значения в форму не пишет — пишет только выбор', (): void => {
            // Пока подсказку не выбрали, значения нет: строка в поле — это ещё
            // не объект, который ждёт форма.
            const fixture: ComponentFixture<AutocompleteHostComponent> = createRtFixture(AutocompleteHostComponent);

            type(fixture, 'мос');

            expect(fixture.componentInstance.control.value).toBeNull();
            expect(fixture.componentInstance.lastQuery).toBe('мос');
        });

        it('выбор подсказки пишет объект в форму', (): void => {
            const fixture: ComponentFixture<AutocompleteHostComponent> = createRtFixture(AutocompleteHostComponent);
            fixture.componentInstance.items.set(CITIES);
            fixture.detectChanges();
            type(fixture, 'м');

            suggestions()[0].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toBe(CITIES[0]);
        });

        it('уход фокуса помечает контрол тронутым', (): void => {
            const fixture: ComponentFixture<AutocompleteHostComponent> = createRtFixture(AutocompleteHostComponent);

            field(fixture).dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(fixture.componentInstance.control.touched).toBe(true);
        });

        it('отключение формой закрывает раскрытую панель', (): void => {
            const fixture: ComponentFixture<AutocompleteHostComponent> = createRtFixture(AutocompleteHostComponent);
            fixture.componentInstance.items.set(CITIES);
            fixture.detectChanges();
            type(fixture, 'м');

            fixture.componentInstance.control.disable();
            fixture.detectChanges();

            expect(panel()).toBeNull();
        });
    });

    describe('режим только для чтения', (): void => {
        it('подменяет поле подписью выбранного значения', (): void => {
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup();
            fixture.componentInstance.writeValue(CITIES[0]);
            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'autocomplete-readonly'))).toBe('Москва');
        });

        it('без значения рисуется прочерк', (): void => {
            const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = setup();

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'autocomplete-readonly'))).toBe('—');
        });
    });

    it('без функции подписи объект печатается как есть — поэтому её задают почти всегда', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<ICity>> = createRtFixture(RtAutocompleteComponent<ICity>, {
            suggestions: CITIES,
        });

        setInputs(fixture, { suggestions: CITIES });
        type(fixture, 'м');

        expect((suggestions()[0].textContent ?? '').trim()).toBe('[object Object]');
    });
});
