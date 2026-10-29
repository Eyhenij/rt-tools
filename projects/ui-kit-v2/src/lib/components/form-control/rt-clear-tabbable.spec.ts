import { ChangeDetectionStrategy, Component, EnvironmentProviders, Provider, Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { provideRtKit } from '../../config/rt-kit-config.providers';
import { RtAutocompleteComponent } from '../autocomplete/rt-autocomplete.component';
import { RtDatePickerComponent } from '../date-picker/rt-date-picker.component';
import { RtDateRangeComponent } from '../date-range/rt-date-range.component';
import { IRtDateRange } from '../date-range/rt-date-range.model';
import { RtInputNumberComponent } from '../input-number/rt-input-number.component';
import { RtInputComponent } from '../input/rt-input.component';

/** Крестики полей, чьё место в обходе проверяется, в порядке разметки хозяев. */
const CLEARS: readonly string[] = ['input-clear', 'autocomplete-clear', 'input-number-clear', 'date-picker-clear', 'date-range-clear'];

const FIELDS: Type<unknown>[] = [
    ReactiveFormsModule,
    RtInputComponent,
    RtAutocompleteComponent,
    RtInputNumberComponent,
    RtDatePickerComponent,
    RtDateRangeComponent,
];

/** Значения, при которых крестик виден у каждого из пяти полей. */
abstract class FieldsHost {
    public readonly cities: string[] = ['Москва', 'Казань'];
    public readonly text: FormControl<string | null> = new FormControl<string | null>('Анна');
    public readonly city: FormControl<string | null> = new FormControl<string | null>('Москва');
    public readonly amount: FormControl<number | null> = new FormControl<number | null>(1250);
    public readonly day: FormControl<string | null> = new FormControl<string | null>('2026-10-29');
    public readonly range: FormControl<IRtDateRange.Value | null> = new FormControl<IRtDateRange.Value | null>({
        start: '2026-10-01',
        end: '2026-10-29',
    });
}

/** Разметка о Tab молчит: место крестика приходит из настроек кита. */
@Component({
    selector: 'rt-clear-tabbable-silent-host',
    template: `
        <rt-input [formControl]="text" />
        <rt-autocomplete [formControl]="city" [suggestions]="cities" />
        <rt-input-number [formControl]="amount" />
        <rt-date-picker [formControl]="day" />
        <rt-date-range [formControl]="range" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: FIELDS,
})
class SilentHostComponent extends FieldsHost {}

/** Разметка сама говорит «мимо крестика». */
@Component({
    selector: 'rt-clear-tabbable-off-host',
    template: `
        <rt-input [formControl]="text" [clearTabbable]="false" />
        <rt-autocomplete [formControl]="city" [suggestions]="cities" [clearTabbable]="false" />
        <rt-input-number [formControl]="amount" [clearTabbable]="false" />
        <rt-date-picker [formControl]="day" [clearTabbable]="false" />
        <rt-date-range [formControl]="range" [clearTabbable]="false" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: FIELDS,
})
class OffHostComponent extends FieldsHost {}

/** `clearTabbable` на каждом поле, настроек кита нет. */
@Component({
    selector: 'rt-clear-tabbable-on-host',
    template: `
        <rt-input clearTabbable [formControl]="text" />
        <rt-autocomplete clearTabbable [formControl]="city" [suggestions]="cities" />
        <rt-input-number clearTabbable [formControl]="amount" />
        <rt-date-picker clearTabbable [formControl]="day" />
        <rt-date-range clearTabbable [formControl]="range" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: FIELDS,
})
class OnHostComponent extends FieldsHost {}

const TABBABLE_SETTING: (Provider | EnvironmentProviders)[] = [provideRtKit({ components: { formControl: { clearTabbable: true } } })];

/** `tabindex` кнопки каждого крестика по порядку `CLEARS`; `null` — крестика не нашлось. */
function clearTabIndexes<T>(fixture: ComponentFixture<T>): (string | null)[] {
    const root: HTMLElement = fixture.nativeElement as HTMLElement;
    return CLEARS.map(
        (id: string): string | null => root.querySelector<HTMLElement>(`[qa-dataid="${id}"] [tabindex]`)?.getAttribute('tabindex') ?? null
    );
}

describe('Крестик очистки полей общей базы в порядке Tab', (): void => {
    it('SC-UKV-1081 — настройка кита ставит крестик каждого поля в порядок Tab', (): void => {
        const fixture: ComponentFixture<SilentHostComponent> = createRtFixture(SilentHostComponent, {}, { providers: TABBABLE_SETTING });

        expect(clearTabIndexes(fixture)).toEqual(['0', '0', '0', '0', '0']);
    });

    it('SC-UKV-1081 — `clearTabbable` на поле перебивает настройку кита', (): void => {
        const fixture: ComponentFixture<OffHostComponent> = createRtFixture(OffHostComponent, {}, { providers: TABBABLE_SETTING });

        expect(clearTabIndexes(fixture)).toEqual(['-1', '-1', '-1', '-1', '-1']);
    });

    it('SC-UKV-1081 — без настройки и без входа крестик вне порядка Tab, как прежде', (): void => {
        const fixture: ComponentFixture<SilentHostComponent> = createRtFixture(SilentHostComponent);

        expect(clearTabIndexes(fixture)).toEqual(['-1', '-1', '-1', '-1', '-1']);
    });

    it('SC-UKV-1082 — автокомплит, число, дата и период слушаются `clearTabbable` на поле', (): void => {
        const fixture: ComponentFixture<OnHostComponent> = createRtFixture(OnHostComponent);

        expect(clearTabIndexes(fixture)).toEqual(['0', '0', '0', '0', '0']);
    });
});
