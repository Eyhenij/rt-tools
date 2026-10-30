import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtColorPaletteComponent } from '../color-palette/rt-color-palette.component';
import { RtInputComponent } from '../input/rt-input.component';
import { RtSelectComponent } from '../select/rt-select.component';
import { IRtSelect } from '../select/rt-select.model';
import { RtTextareaComponent } from '../textarea/rt-textarea.component';
import { RtFieldComponent } from './rt-field.component';

/**
 * Материальный набор кладёт подпись поля внутрь контрола. Положение подписи jsdom не считает: здесь
 * проверяются признаки, по которым правило набора её двигает, и сами правила в источнике.
 */

const FIELD_STYLES: string = ['rt-field.component.scss', 'rt-field-label-inside.scss']
    .map((file: string): string => readFileSync(join(__dirname, file), 'utf8'))
    .join('\n');
const SELECT_STYLES: string = readFileSync(join(__dirname, '../select/rt-select.component.scss'), 'utf8');
const PRESET: string = readFileSync(join(__dirname, '../../../styles/_preset-material.scss'), 'utf8');

const OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [{ label: 'Москва', value: 'msk' }];

/** Три контрола в полях: признак значения у поля один на всех. */
@Component({
    selector: 'rt-field-material-host',
    template: `
        <rt-field label="Имя" [readonly]="readonly()" [loading]="loading()">
            <rt-input [formControl]="name" />
        </rt-field>
        <rt-field label="Заметка">
            <rt-textarea [formControl]="note" />
        </rt-field>
        <rt-field label="Город">
            <rt-select [formControl]="city" [options]="options" />
        </rt-field>
        <rt-field label="Цвет">
            <rt-color-palette [formControl]="color" />
        </rt-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtFieldComponent, RtInputComponent, RtTextareaComponent, RtSelectComponent, RtColorPaletteComponent, ReactiveFormsModule],
})
class MaterialFieldHostComponent {
    public readonly name: FormControl<string | null> = new FormControl<string | null>('', [Validators.required]);
    public readonly note: FormControl<string | null> = new FormControl<string | null>('');
    public readonly city: FormControl<string | null> = new FormControl<string | null>(null);
    public readonly color: FormControl<string | null> = new FormControl<string | null>(null);
    public readonly options: ReadonlyArray<IRtSelect.Option<string>> = OPTIONS;
    public readonly readonly: WritableSignal<boolean> = signal<boolean>(false);
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
}

function setup(): ComponentFixture<MaterialFieldHostComponent> {
    const fixture: ComponentFixture<MaterialFieldHostComponent> = createRtFixture(MaterialFieldHostComponent);
    fixture.detectChanges();

    return fixture;
}

function fields(fixture: ComponentFixture<unknown>): HTMLElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('rt-field'));
}

function filledFlags(fixture: ComponentFixture<unknown>): boolean[] {
    return fields(fixture).map((field: HTMLElement): boolean => field.classList.contains('rt-field--filled'));
}

describe('rt-field под материальным набором', (): void => {
    describe('SC-UKV-916: подпись внутри контрола', (): void => {
        it('пустые поля не помечены значением — подпись лежит на месте подсказки', (): void => {
            expect(filledFlags(setup())).toEqual([false, false, false, false]);
        });

        it('значение поля, области текста и выбора поднимает подпись', (): void => {
            const fixture: ComponentFixture<MaterialFieldHostComponent> = setup();
            fixture.componentInstance.name.setValue('Иван');
            fixture.componentInstance.note.setValue('Позвонить');
            fixture.componentInstance.city.setValue('msk');
            fixture.detectChanges();

            expect(filledFlags(fixture)).toEqual([true, true, true, false]);
        });

        it('поле только для чтения и в загрузке держит подпись над значением', (): void => {
            const fixture: ComponentFixture<MaterialFieldHostComponent> = setup();
            const first: HTMLElement = fields(fixture)[0];
            expect(first.classList).not.toContain('rt-field--static');

            fixture.componentInstance.readonly.set(true);
            fixture.detectChanges();
            expect(first.classList).toContain('rt-field--static');

            fixture.componentInstance.readonly.set(false);
            fixture.componentInstance.loading.set(true);
            fixture.detectChanges();
            expect(first.classList).toContain('rt-field--static');
            expect(first.classList).not.toContain('rt-field--label-inside');
        });

        it('подпись ложится внутрь поля ввода, текста и выбора, а над палитрой остаётся сверху', (): void => {
            const fixture: ComponentFixture<MaterialFieldHostComponent> = setup();

            expect(fields(fixture).map((field: HTMLElement): boolean => field.classList.contains('rt-field--label-inside'))).toEqual([
                true,
                true,
                true,
                false,
            ]);
        });

        it('правило набора выводит подпись из потока и поднимает её на рамку', (): void => {
            expect(FIELD_STYLES).toContain("&--label-inside:is(.rt-preset-material *, [data-preset='material'] *");
            expect(FIELD_STYLES).toMatch(/\.rt-field__label-row \{\s*position: absolute;/);
            expect(FIELD_STYLES).toMatch(/&\.rt-field--filled \.rt-field__label-row,\s*&:focus-within \.rt-field__label-row \{\s*top: 0;/);
        });
    });

    describe('SC-UKV-917: звёздочка цвета подписи', (): void => {
        it('набор красит звёздочку цветом подписи', (): void => {
            expect(PRESET).toMatch(/--rt-field-required-color:\s*currentcolor;/);
        });

        it('недействительное поле помечено, и звёздочка берёт цвет ошибки', (): void => {
            const fixture: ComponentFixture<MaterialFieldHostComponent> = setup();
            const first: HTMLElement = fields(fixture)[0];
            expect(first.classList).not.toContain('rt-field--invalid');

            fixture.componentInstance.name.markAsTouched();
            fixture.componentInstance.name.updateValueAndValidity();
            fixture.detectChanges();

            expect(first.classList).toContain('rt-field--invalid');
            expect(FIELD_STYLES).toMatch(/&--invalid &__required \{\s*color: var\(--rt-field-error-color\);/);
        });
    });

    describe('SC-UKV-918: стрелка выбора', (): void => {
        it('правило набора не запрещает поворот, и открытое поле переворачивает треугольник', (): void => {
            const fromPreset: string = SELECT_STYLES.slice(
                SELECT_STYLES.indexOf(":is(.rt-preset-material, [data-preset='material']) &__chevron")
            );
            const presetRule: string = fromPreset.slice(0, fromPreset.indexOf('svg {'));

            expect(presetRule).not.toContain('transform');
            expect(SELECT_STYLES).toMatch(/&--open &__chevron \{\s*transform: rotate\(180deg\);/);
        });
    });
});
