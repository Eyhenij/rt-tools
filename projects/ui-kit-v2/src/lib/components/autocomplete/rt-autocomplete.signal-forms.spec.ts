import { ChangeDetectionStrategy, Component, WritableSignal, signal, ɵINPUT_SIGNAL_BRAND_WRITE_TYPE } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FieldTree, FormField, SchemaPathTree, form, minLength } from '@angular/forms/signals';

import { createRtFixture, qa, setInputs } from '../../../testing/rt-kit-testing';
import { RtAutocompleteComponent } from './rt-autocomplete.component';

/** Что вход принимает на запись — тип, который проверяет шаблон потребителя; Jest шаблон не типизирует. */
type TInputWrite<TInput> = TInput extends { [ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]: infer TWrite } ? TWrite : never;

/**
 * Сигнальная форма пишет в `minLength` `undefined`, когда его не задала. Тип ниже не соберётся,
 * если вход перестанет это принимать: его ловит проверка типов спек.
 */
const MIN_LENGTH_TAKES_UNDEFINED: undefined extends TInputWrite<RtAutocompleteComponent<string>['minLength']> ? true : false = true;

const CITIES: ReadonlyArray<string> = ['Москва', 'Минск'];

interface IDelivery {
    city: string | null;
}

/** Поле с подсказками под сигнальной формой, которая не задала `minLength`. */
@Component({
    selector: 'rt-autocomplete-signal-host',
    template: '<rt-autocomplete [suggestions]="cities" [formField]="delivery.city" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAutocompleteComponent, FormField],
})
class AutocompleteSignalHostComponent {
    public readonly cities: ReadonlyArray<string> = CITIES;
    public readonly model: WritableSignal<IDelivery> = signal<IDelivery>({ city: null });
    public readonly delivery: FieldTree<IDelivery> = form(this.model);
}

/** Длину форма проверяет только у строки без `null`. */
interface ICityQuery {
    city: string;
}

/** То же поле, но форма требует от значения трёх букв. */
@Component({
    selector: 'rt-autocomplete-signal-min-length-host',
    template: '<rt-autocomplete [suggestions]="cities" [formField]="delivery.city" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAutocompleteComponent, FormField],
})
class AutocompleteMinLengthHostComponent {
    public readonly cities: ReadonlyArray<string> = CITIES;
    public readonly model: WritableSignal<ICityQuery> = signal<ICityQuery>({ city: '' });
    public readonly delivery: FieldTree<ICityQuery> = form(this.model, (path: SchemaPathTree<ICityQuery>): void => {
        minLength(path.city, 3);
    });
}

/** Панель подсказок живёт в оверлее CDK — ищем её в документе. */
function suggestions(): HTMLElement[] {
    return Array.from(document.querySelectorAll('[qa-dataid="autocomplete-option"]'));
}

function type<T>(fixture: ComponentFixture<T>, text: string): void {
    const node: HTMLInputElement = qa(fixture, 'autocomplete-input')?.nativeElement as HTMLInputElement;
    node.value = text;
    node.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

describe('RtAutocompleteComponent под сигнальной формой', (): void => {
    it('SC-UKV-1585 — вход minLength принимает undefined', (): void => {
        expect(MIN_LENGTH_TAKES_UNDEFINED).toBe(true);
    });

    it('SC-UKV-1585 — поле собирается, подсказки открываются с первой буквы, выбранная уходит в модель', (): void => {
        const fixture: ComponentFixture<AutocompleteSignalHostComponent> = createRtFixture(AutocompleteSignalHostComponent);

        type(fixture, 'м');
        expect(suggestions().length).toBe(CITIES.length);

        suggestions()[1].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.model()).toEqual({ city: 'Минск' });
    });

    it('SC-UKV-1585 — minLength undefined возвращает порог по умолчанию, число — как раньше', (): void => {
        const fixture: ComponentFixture<RtAutocompleteComponent<string>> = createRtFixture(RtAutocompleteComponent<string>, {
            minLength: 3,
        });
        expect(fixture.componentInstance.minLength()).toBe(3);

        setInputs(fixture, { minLength: undefined });

        expect(fixture.componentInstance.minLength()).toBe(1);
    });

    it('SC-UKV-1585 — minLength формы доходит до поля: подсказки открываются с третьей буквы', (): void => {
        const fixture: ComponentFixture<AutocompleteMinLengthHostComponent> = createRtFixture(AutocompleteMinLengthHostComponent);

        type(fixture, 'ми');
        expect(suggestions().length).toBe(0);

        type(fixture, 'мин');
        expect(suggestions().length).toBe(CITIES.length);
    });
});
