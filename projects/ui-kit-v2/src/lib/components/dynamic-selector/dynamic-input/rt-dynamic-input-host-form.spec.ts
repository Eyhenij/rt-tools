import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture, qa } from '../../../../testing/rt-kit-testing';
import { RtDynamicInputComponent } from './rt-dynamic-input.component';

/** Родитель держит поле внутри своей формы: черновики строк не должны искать её контейнер. */
@Component({
    selector: 'rt-dynamic-input-host-form',
    template: `
        <form [formGroup]="form">
            <rt-dynamic-input editable formControlName="tags" />
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtDynamicInputComponent],
})
class HostFormComponent {
    public readonly form: FormGroup<{ tags: FormControl<string[] | null> }> = new FormGroup({
        tags: new FormControl<string[] | null>(['a@x.com']),
    });
}

type THostFixture = ComponentFixture<HostFormComponent>;

function inputOf(fixture: THostFixture, id: string): HTMLInputElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(`[qa-dataid="${id}"] input`);
}

function click(fixture: THostFixture, id: string): void {
    const target: HTMLElement = qa(fixture, id)?.nativeElement as HTMLElement;

    (target.querySelector<HTMLButtonElement>('button') ?? target).click();
    fixture.detectChanges();
}

function hostFormWarnings(warn: jest.SpyInstance): unknown[][] {
    return warn.mock.calls.filter((call: unknown[]): boolean => String(call[0]).includes('NG01354'));
}

describe('RtDynamicInputComponent — внутри формы родителя', (): void => {
    let warn: jest.SpyInstance;

    beforeEach((): void => {
        warn = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
    });

    afterEach((): void => {
        warn.mockRestore();
    });

    it('SC-UKV-939 — карандаш открывает правку без NG01354, Enter применяет её, форма родителя не получает чужих полей', (): void => {
        const fixture: THostFixture = createRtFixture(HostFormComponent);

        click(fixture, 'dynamic-selector-edit');
        const edit: HTMLInputElement | null = inputOf(fixture, 'dynamic-selector-edit-field');

        expect(edit).not.toBeNull();
        expect(hostFormWarnings(warn)).toEqual([]);

        (edit as HTMLInputElement).value = 'b@x.com';
        edit?.dispatchEvent(new Event('input'));
        edit?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.form.controls.tags.value).toEqual(['b@x.com']);
        expect(Object.keys(fixture.componentInstance.form.controls)).toEqual(['tags']);
    });

    it('SC-UKV-939 — поле набора новой строки открывается без NG01354', (): void => {
        const fixture: THostFixture = createRtFixture(HostFormComponent);

        click(fixture, 'dynamic-input-add');

        expect(inputOf(fixture, 'dynamic-input-field')).not.toBeNull();
        expect(hostFormWarnings(warn)).toEqual([]);
    });
});
