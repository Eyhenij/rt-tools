import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture, qa, qaAll } from '../../../../testing/rt-kit-testing';
import { RtDynamicInputComponent } from './rt-dynamic-input.component';

@Component({
    selector: 'rt-dynamic-input-host',
    template: '<rt-dynamic-input [formControl]="control" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RtDynamicInputComponent],
})
class DynamicInputHostComponent {
    public readonly control: FormControl<string[] | null> = new FormControl<string[] | null>(['a@x.com']);
}

type THostFixture = ComponentFixture<DynamicInputHostComponent>;

function field(fixture: THostFixture): HTMLInputElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="dynamic-input-field"] input');
}

function openField(fixture: THostFixture): HTMLInputElement {
    (qa(fixture, 'dynamic-input-add')?.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    const input: HTMLInputElement | null = field(fixture);

    if (input === null) {
        throw new Error('поле набора не открылось');
    }

    return input;
}

function typeInto(fixture: THostFixture, input: HTMLInputElement, text: string): void {
    input.value = text;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

describe('RtDynamicInputComponent', (): void => {
    it('SC-UKV-455 — уход из поля добавляет текст в конец', (): void => {
        const fixture: THostFixture = createRtFixture(DynamicInputHostComponent);
        const input: HTMLInputElement = openField(fixture);

        typeInto(fixture, input, 'c@x.com');
        input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value).toEqual(['a@x.com', 'c@x.com']);
        expect(field(fixture)).toBeNull();
    });

    it('SC-UKV-453 — Enter добавляет срезанный текст и прячет поле', (): void => {
        const fixture: THostFixture = createRtFixture(DynamicInputHostComponent);
        const input: HTMLInputElement = openField(fixture);

        typeInto(fixture, input, ' b@x.com ');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value).toEqual(['a@x.com', 'b@x.com']);
        expect(qaAll(fixture, 'dynamic-selector-row')).toHaveLength(2);
        expect(field(fixture)).toBeNull();
    });

    it('SC-UKV-454 — пустой текст не добавляется, и поле остаётся открытым', (): void => {
        const fixture: THostFixture = createRtFixture(DynamicInputHostComponent);
        const input: HTMLInputElement = openField(fixture);

        typeInto(fixture, input, '   ');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value).toEqual(['a@x.com']);
        expect(field(fixture)).not.toBeNull();
    });
});
